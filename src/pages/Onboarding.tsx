import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { usePassword } from '../auth'
import { parseUploadFile } from '../lib/parseUpload'
import { requestMerge } from '../lib/api'
import { setMaster, setPrefs } from '../store/storage'

const STEPS = ['welcome', 'upload', 'build', 'prefs', 'done'] as const
type Step = (typeof STEPS)[number]

interface CvEntry {
  id: string
  name: string
  text: string
}

const ease = [0.22, 1, 0.36, 1] as const

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function Onboarding() {
  const navigate = useNavigate()
  const location = useLocation()
  const password = usePassword()
  const fileRef = useRef<HTMLInputElement>(null)

  // When arriving from Load → "Build my universal profile from these", the CV
  // texts are passed via router state. Pre-seed them and jump to the build step.
  const seeded = (location.state as { seededCvs?: string[] } | null)?.seededCvs
  const seededCvs: CvEntry[] = (seeded ?? []).map((text, i) => ({
    id: `seeded-${i}`,
    name: `Imported CV ${i + 1}`,
    text,
  }))
  const hasSeed = seededCvs.length > 0

  const buildIndex = STEPS.indexOf('build')
  const [stepIndex, setStepIndex] = useState(hasSeed ? buildIndex : 0)
  const [dir, setDir] = useState(1)
  const step: Step = STEPS[stepIndex]

  const [cvs, setCvs] = useState<CvEntry[]>(seededCvs)
  const [pasteText, setPasteText] = useState('')
  const [parseError, setParseError] = useState('')

  const [merging, setMerging] = useState(false)
  const [mergeError, setMergeError] = useState('')
  const [merged, setMerged] = useState('')
  const [mergeStarted, setMergeStarted] = useState(false)

  const [prefs, setPrefsText] = useState('')

  function go(to: number) {
    setDir(to > stepIndex ? 1 : -1)
    setStepIndex(to)
  }
  const next = () => go(stepIndex + 1)
  const back = () => go(stepIndex - 1)

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setParseError('')
    for (const file of Array.from(files)) {
      try {
        const text = await parseUploadFile(file)
        setCvs((cur) => [...cur, { id: newId(), name: file.name, text }])
      } catch (err) {
        setParseError(`${file.name}: ${(err as Error).message}`)
      }
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  function addPasted() {
    const text = pasteText.trim()
    if (!text) return
    setCvs((cur) => [...cur, { id: newId(), name: `Pasted CV ${cur.length + 1}`, text }])
    setPasteText('')
  }

  function removeCv(id: string) {
    setCvs((cur) => cur.filter((c) => c.id !== id))
  }

  async function runMerge() {
    setMergeStarted(true)
    setMerging(true)
    setMergeError('')
    try {
      const profile = await requestMerge({ password, cvs: cvs.map((c) => c.text) })
      setMerged(profile)
    } catch (err) {
      setMergeError((err as Error).message)
    } finally {
      setMerging(false)
    }
  }

  // Kick off the merge automatically the first time the build step is shown.
  function goToBuild() {
    next()
    if (!mergeStarted) void runMerge()
  }

  // When seeded from Load, we land directly on the build step — start the merge.
  // Deferred to a microtask so it doesn't setState synchronously inside the effect.
  useEffect(() => {
    if (hasSeed && !mergeStarted) void Promise.resolve().then(() => runMerge())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function acceptProfile() {
    setMaster(merged)
    next()
  }

  function savePrefsAndContinue() {
    setPrefs(prefs.trim())
    next()
  }

  const inputClass =
    'w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-ink-faint focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/25 transition'

  return (
    <div className="max-w-2xl mx-auto">
      <ProgressBar step={stepIndex} total={STEPS.length} />

      <div className="relative mt-8">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.36, ease }}
          >
            {step === 'welcome' && (
              <Card className="p-9 sm:p-11 text-center">
                <p className="text-clay font-medium tracking-wide uppercase text-xs mb-3">
                  Step one
                </p>
                <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-4">
                  Let&apos;s build your universal CV
                </h1>
                <p className="text-ink-soft text-lg leading-relaxed max-w-md mx-auto mb-9">
                  We&apos;ll take the CVs you already have and merge them into a single
                  master profile. Every CV you tailor from here on is shaped out of that
                  one source.
                </p>
                <Button size="lg" onClick={next}>
                  Get started &rarr;
                </Button>
              </Card>
            )}

            {step === 'upload' && (
              <Card className="p-8 sm:p-10">
                <h2 className="font-display text-3xl text-ink leading-tight mb-2">
                  Upload your CVs
                </h2>
                <p className="text-ink-soft leading-relaxed mb-7">
                  Add any CVs you already have — PDF or Word. Got a few versions? Add them
                  all; we&apos;ll fold them together.
                </p>

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-2xl border-2 border-dashed border-line bg-paper hover:border-clay/50 hover:bg-paper-deep transition-colors px-6 py-10 text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
                >
                  <div className="font-display text-xl text-ink mb-1">
                    Choose files
                  </div>
                  <div className="text-sm text-ink-faint">
                    PDF or .docx &middot; you can pick more than one
                  </div>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx"
                  multiple
                  className="hidden"
                  onChange={(e) => onFiles(e.target.files)}
                />

                {parseError && (
                  <p className="mt-4 rounded-lg border border-clay/30 bg-clay-soft/40 px-4 py-2.5 text-sm text-clay-deep">
                    {parseError}
                  </p>
                )}

                {cvs.length > 0 && (
                  <ul className="mt-5 space-y-2.5">
                    <AnimatePresence initial={false}>
                      {cvs.map((cv) => (
                        <motion.li
                          key={cv.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.22, ease }}
                        >
                          <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3">
                            <span className="text-sage text-lg leading-none" aria-hidden>
                              ✓
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-ink font-medium truncate">{cv.name}</p>
                              <p className="text-xs text-ink-faint">
                                {cv.text.length.toLocaleString()} characters read
                              </p>
                            </div>
                            <button
                              onClick={() => removeCv(cv.id)}
                              aria-label={`Remove ${cv.name}`}
                              className="shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-full text-ink-faint hover:text-clay hover:bg-paper-deep transition"
                            >
                              <span className="text-lg leading-none">&times;</span>
                            </button>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}

                <div className="mt-7 border-t border-line pt-6">
                  <p className="text-sm font-medium text-ink-soft mb-2">
                    No file handy? Paste your CV instead
                  </p>
                  <textarea
                    rows={4}
                    className={inputClass}
                    placeholder="Paste the text of a CV here…"
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                  />
                  <div className="mt-2">
                    <Button variant="outline" onClick={addPasted} disabled={!pasteText.trim()}>
                      Add pasted CV
                    </Button>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <Button variant="ghost" onClick={back}>
                    &larr; Back
                  </Button>
                  <Button size="lg" onClick={goToBuild} disabled={cvs.length === 0}>
                    Continue &rarr;
                  </Button>
                </div>
              </Card>
            )}

            {step === 'build' && (
              <Card className="p-8 sm:p-10">
                <h2 className="font-display text-3xl text-ink leading-tight mb-2">
                  Your universal profile
                </h2>

                {merging && (
                  <div className="py-12 text-center">
                    <motion.div
                      className="mx-auto mb-5 h-3 w-3 rounded-full bg-clay"
                      animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <p className="text-ink-soft leading-relaxed max-w-sm mx-auto">
                      Reading your {cvs.length} {cvs.length === 1 ? 'CV' : 'CVs'} and
                      merging them into one master profile…
                    </p>
                  </div>
                )}

                {!merging && mergeError && (
                  <div className="py-6">
                    <p className="rounded-lg border border-clay/30 bg-clay-soft/40 px-4 py-3 text-sm text-clay-deep mb-5">
                      Couldn&apos;t build the profile: {mergeError}
                    </p>
                    <Button onClick={() => void runMerge()}>Try again</Button>
                  </div>
                )}

                {!merging && !mergeError && (
                  <>
                    <p className="text-ink-soft leading-relaxed mb-5">
                      Here&apos;s everything from your CVs, folded into one. Read it over and
                      tweak anything that&apos;s off — this is the source we tailor from.
                    </p>
                    <textarea
                      rows={16}
                      className={`${inputClass} font-sans text-sm leading-relaxed`}
                      value={merged}
                      onChange={(e) => setMerged(e.target.value)}
                    />
                    <div className="mt-8 flex items-center justify-between">
                      <Button variant="ghost" onClick={back}>
                        &larr; Back
                      </Button>
                      <Button size="lg" onClick={acceptProfile} disabled={!merged.trim()}>
                        Looks good &rarr;
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            )}

            {step === 'prefs' && (
              <Card className="p-8 sm:p-10">
                <h2 className="font-display text-3xl text-ink leading-tight mb-2">
                  Any standing preferences?
                </h2>
                <p className="text-ink-soft leading-relaxed mb-6">
                  Optional. Anything you write here is applied to every CV we tailor —
                  spelling, tone, the kinds of roles you&apos;re aiming for.
                </p>
                <textarea
                  rows={5}
                  className={inputClass}
                  placeholder="e.g. UK English. Concise bullets. Targets academic + training roles."
                  value={prefs}
                  onChange={(e) => setPrefsText(e.target.value)}
                />
                <div className="mt-8 flex items-center justify-between">
                  <Button variant="ghost" onClick={back}>
                    &larr; Back
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={next}>
                      Skip
                    </Button>
                    <Button size="lg" onClick={savePrefsAndContinue}>
                      Continue &rarr;
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {step === 'done' && (
              <Card className="p-10 sm:p-12 text-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease, delay: 0.1 }}
                  className="mx-auto mb-6 h-14 w-14 rounded-full bg-clay-soft text-clay-deep inline-flex items-center justify-center text-2xl"
                  aria-hidden
                >
                  ✓
                </motion.div>
                <h2 className="font-display text-4xl text-ink leading-tight mb-3">
                  You&apos;re set.
                </h2>
                <p className="text-ink-soft text-lg leading-relaxed max-w-md mx-auto mb-9">
                  Your universal profile is saved. From here, paste any job description and
                  we&apos;ll shape a CV to fit it.
                </p>
                <Button size="lg" onClick={() => navigate('/')}>
                  Go to my workshop &rarr;
                </Button>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = (step / (total - 1)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium tracking-wide uppercase text-ink-faint">
          Setup
        </span>
        <span className="text-xs text-ink-faint tabular-nums">
          {step + 1} / {total}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-paper-deep overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-clay"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease }}
        />
      </div>
    </div>
  )
}
