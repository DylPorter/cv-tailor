import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { CVPreview } from '../components/CVPreview'
import { FitReportView } from '../components/FitReportView'
import { usePassword } from '../auth'
import { requestTailor } from '../lib/api'
import { getMaster, getPrefs, saveCV, bumpGenerated } from '../store/storage'
import { renderPdf } from '../render/pdf'
import { renderDocx } from '../render/docx'
import { measurePdf } from '../lib/pdfMeasure'
import { triggerDownload } from '../lib/download'
import { resumeFilename } from '../lib/filename'
import type { CVJson, FitReport } from '../types'

const ease = [0.22, 1, 0.36, 1] as const

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
}

interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  text: string
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

const SEED_MESSAGE: ChatMessage = {
  id: 'seed',
  role: 'assistant',
  text: "Here's your tailored CV. Want to change anything? Try ‘make it shorter’ or ‘emphasise my teaching experience’.",
}

const inputClass =
  'w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-ink-faint focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/25 transition'

export function Generate() {
  const navigate = useNavigate()
  const password = usePassword()
  const master = getMaster()

  const [phase, setPhase] = useState<'job' | 'result'>('job')
  const [dir, setDir] = useState(1)

  const [jd, setJd] = useState('')
  const [label, setLabel] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genStatus, setGenStatus] = useState('Tailoring your CV…')
  const [genError, setGenError] = useState('')
  const hasGenerated = useRef(false)

  const [cv, setCv] = useState<CVJson | null>(null)
  const [fitReport, setFitReport] = useState<FitReport | null>(null)
  const [targetRole, setTargetRole] = useState('')

  // Routes guarantee a master before /generate, but guard anyway.
  if (!master) {
    return (
      <div className="max-w-xl mx-auto text-center pt-6">
        <Card className="p-12">
          <h1 className="font-display text-3xl text-ink mb-3">Build your profile first</h1>
          <p className="text-ink-soft mb-8 leading-relaxed">
            You need a universal CV before you can tailor one. It only takes a minute.
          </p>
          <Button size="lg" onClick={() => navigate('/onboarding')}>
            Build my universal CV &rarr;
          </Button>
        </Card>
      </div>
    )
  }

  async function tailor() {
    if (!master || !jd.trim()) return
    setGenerating(true)
    setGenStatus('Tailoring your CV…')
    setGenError('')
    try {
      const initial = await requestTailor({
        password,
        master: master.text,
        jd,
        prefs: getPrefs(),
      })
      let cv = initial.cv
      let fit = initial.fitReport
      let role = initial.targetRole?.trim() || ''

      // Length-optimization loop: a CV should be a clean 1 page or a full
      // 2 pages — never a sparse spill onto a near-empty second page. This runs
      // only on the INITIAL generate; manual chat refines stay one-shot.
      // Fully guarded: if rendering/measuring ever throws, we keep the result
      // we already have and never block the user on the optimizer.
      try {
        setGenStatus('Optimising length…')
        for (let pass = 0; pass < 2; pass++) {
          const metrics = await measurePdf(await renderPdf(cv))
          if (metrics.pages <= 1) break // ideal: one page
          if (metrics.pages === 2 && metrics.lastPageFillRatio >= 0.55) break // legit full two-pager

          const instruction =
            metrics.pages === 2 && metrics.lastPageFillRatio < 0.55
              ? 'Your CV rendered to two pages but the second page is nearly empty — this looks unprofessional. Compress it to fit EXACTLY ONE page: tighten the summary, cut the weakest bullets, and trim or merge the least-relevant older roles. Keep all the strongest, most relevant content.'
              : `Your CV rendered to ${metrics.pages} pages, which is too long. Cut it down to a tight TWO pages maximum — drop the least-relevant roles and bullets, keep the strongest evidence.`

          const refined = await requestTailor({
            password,
            master: master.text,
            jd,
            prefs: getPrefs(),
            priorCv: cv,
            refineInstruction: instruction,
          })
          cv = refined.cv
          fit = refined.fitReport
          role = refined.targetRole?.trim() || role
        }

        // Final guard: if it's still a sparse two-pager after the loop, one page
        // isn't achievable without dropping strong content — so use the space well.
        const finalMetrics = await measurePdf(await renderPdf(cv)).catch(() => null)
        if (finalMetrics && finalMetrics.pages === 2 && finalMetrics.lastPageFillRatio < 0.5) {
          const filled = await requestTailor({
            password,
            master: master.text,
            jd,
            prefs: getPrefs(),
            priorCv: cv,
            refineInstruction:
              'This CV needs two pages but the second is sparse. Since one page is not achievable without dropping strong content, instead use the full two pages well: add depth (an extra strong bullet) to the top 2–3 roles and a slightly fuller summary so both pages feel complete and intentional. Do not pad with fluff.',
          })
          cv = filled.cv
          fit = filled.fitReport
          role = filled.targetRole?.trim() || role
        }
      } catch {
        // Optimizer failed — fall back to the result we already have.
      }

      setCv(cv)
      setFitReport(fit)
      setTargetRole(role)
      if (!hasGenerated.current) {
        bumpGenerated()
        hasGenerated.current = true
      }
      setDir(1)
      setPhase('result')
    } catch (err) {
      setGenError((err as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  function startOver() {
    setDir(-1)
    setPhase('job')
    setCv(null)
    setFitReport(null)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <AnimatePresence mode="wait" custom={dir}>
        {phase === 'job' ? (
          <motion.div
            key="job"
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.36, ease }}
            className="max-w-2xl mx-auto"
          >
            <header className="mb-7">
              <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
                Tailor a CV
              </h1>
              <p className="text-ink-soft mt-3 text-lg leading-relaxed">
                Paste the job description below. We&apos;ll shape a CV to fit it and show
                you an honest fit report.
              </p>
            </header>

            <Card className="p-7 sm:p-8">
              <label className="block mb-5">
                <span className="block text-sm font-medium text-ink-soft mb-2">
                  Job description
                </span>
                <textarea
                  rows={12}
                  autoFocus
                  className={inputClass}
                  placeholder="Paste the job description…"
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                />
              </label>

              <label className="block mb-6">
                <span className="block text-sm font-medium text-ink-soft mb-2">
                  Label <span className="text-ink-faint font-normal">(optional)</span>
                </span>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Acme — Operations Manager"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </label>

              {genError && (
                <p className="mb-5 rounded-lg border border-clay/30 bg-clay-soft/40 px-4 py-2.5 text-sm text-clay-deep">
                  {genError}
                </p>
              )}

              <Button
                size="lg"
                className="w-full"
                onClick={() => void tailor()}
                disabled={!jd.trim() || generating}
              >
                {generating ? (
                  <span className="inline-flex items-center gap-2.5">
                    <motion.span
                      className="h-2 w-2 rounded-full bg-paper"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {genStatus}
                  </span>
                ) : (
                  'Tailor my CV →'
                )}
              </Button>
            </Card>
          </motion.div>
        ) : (
          cv &&
          fitReport && (
            <motion.div
              key="result"
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.36, ease }}
            >
              <ResultView
                cv={cv}
                fitReport={fitReport}
                jd={jd}
                defaultLabel={label}
                targetRole={targetRole}
                password={password}
                master={master.text}
                onUpdate={(nextCv, nextReport) => {
                  setCv(nextCv)
                  setFitReport(nextReport)
                }}
                onStartOver={startOver}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  )
}

function ResultView({
  cv,
  fitReport,
  jd,
  defaultLabel,
  targetRole,
  password,
  master,
  onUpdate,
  onStartOver,
}: {
  cv: CVJson
  fitReport: FitReport
  jd: string
  defaultLabel: string
  targetRole: string
  password: string
  master: string
  onUpdate: (cv: CVJson, report: FitReport) => void
  onStartOver: () => void
}) {
  const [saveLabel, setSaveLabel] = useState(defaultLabel)
  // Role used to name downloaded files: a typed label overrides; blank falls
  // back to the role auto-detected from the job description. Never the name.
  const roleForFile = saveLabel.trim() || targetRole || ''
  const [saveField, setSaveField] = useState('')
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [messages, setMessages] = useState<ChatMessage[]>([SEED_MESSAGE])
  const [draft, setDraft] = useState('')
  const [refining, setRefining] = useState(false)

  function save() {
    setSaveError('')
    try {
      saveCV({
        label: saveLabel.trim() || targetRole || cv.name,
        field: saveField.trim() || 'General',
        role: roleForFile,
        jd,
        cv,
        fitReport,
      })
      setSaved(true)
    } catch (err) {
      setSaveError((err as Error).message)
    }
  }

  async function refine() {
    const text = draft.trim()
    if (!text || refining) return
    setDraft('')
    setMessages((cur) => [...cur, { id: newId(), role: 'user', text }])
    setRefining(true)
    try {
      const res = await requestTailor({
        password,
        master,
        jd,
        prefs: getPrefs(),
        priorCv: cv,
        refineInstruction: text,
      })
      onUpdate(res.cv, res.fitReport)
      setSaved(false)
      const note = res.note?.trim()
      setMessages((cur) => [
        ...cur,
        { id: newId(), role: 'assistant', text: note || 'Done — I’ve updated it.' },
      ])
    } catch (err) {
      setMessages((cur) => [
        ...cur,
        {
          id: newId(),
          role: 'assistant',
          text: `I couldn’t make that change: ${(err as Error).message}`,
        },
      ])
    } finally {
      setRefining(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
      {/* Left column: fit report, actions, chat */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <div className="rounded-xl border border-line bg-paper p-5">
            <FitReportView report={fitReport} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg text-ink mb-3">Download</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={async () =>
                triggerDownload(await renderPdf(cv), resumeFilename(cv.name, roleForFile, 'pdf'))
              }
            >
              PDF
            </Button>
            <Button
              variant="outline"
              onClick={async () =>
                triggerDownload(await renderDocx(cv), resumeFilename(cv.name, roleForFile, 'docx'))
              }
            >
              .docx
            </Button>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <label className="block">
              <span className="block text-sm font-medium text-ink-soft mb-2">
                Role / title <span className="text-ink-faint font-normal">(names the file)</span>
              </span>
              <input
                type="text"
                className={inputClass}
                placeholder="Defaults to the role from the job description"
                value={saveLabel}
                onChange={(e) => {
                  setSaveLabel(e.target.value)
                  setSaved(false)
                }}
              />
            </label>
            <label className="block mt-3">
              <span className="block text-xs font-medium text-ink-faint mb-1.5">
                Field <span className="font-normal">(optional)</span>
              </span>
              <input
                type="text"
                className={inputClass}
                placeholder="Academic, Operations… (defaults to General)"
                value={saveField}
                onChange={(e) => {
                  setSaveField(e.target.value)
                  setSaved(false)
                }}
              />
            </label>
            <div className="mt-3 flex items-center gap-3">
              <Button variant="outline" onClick={save}>
                Save
              </Button>
              <AnimatePresence>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-sage inline-flex items-center gap-1.5"
                  >
                    <span aria-hidden>✓</span> Saved to your folder
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            {saveError && (
              <p className="mt-3 rounded-lg border border-clay/30 bg-clay-soft/40 px-4 py-2.5 text-sm text-clay-deep">
                {saveError}
              </p>
            )}
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <Button variant="ghost" onClick={onStartOver}>
              &larr; Start over with a new job
            </Button>
          </div>
        </Card>

        {/* Chat refine */}
        <Card className="p-6 flex flex-col">
          <h3 className="font-display text-lg text-ink mb-1">Refine it</h3>
          <p className="text-sm text-ink-faint mb-4">
            Ask for changes in plain English. The preview and downloads update with each
            tweak.
          </p>

          <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
            {messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} text={m.text} />
            ))}
            {refining && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-paper-deep px-4 py-3">
                  <motion.span
                    className="inline-flex gap-1"
                    aria-label="Working on it"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-ink-faint"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: i * 0.18,
                        }}
                      />
                    ))}
                  </motion.span>
                </div>
              </div>
            )}
          </div>

          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              void refine()
            }}
          >
            <textarea
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="make it shorter…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void refine()
                }
              }}
            />
            <Button type="submit" disabled={!draft.trim() || refining}>
              Send
            </Button>
          </form>
        </Card>
      </div>

      {/* Right column: live CV preview */}
      <div className="lg:col-span-3">
        <CVPreview cv={cv} />
      </div>
    </div>
  )
}

function ChatBubble({ role, text }: { role: 'assistant' | 'user'; text: string }) {
  const isUser = role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-clay text-paper'
            : 'rounded-bl-md bg-paper-deep text-ink'
        }`}
      >
        {text}
      </div>
    </motion.div>
  )
}
