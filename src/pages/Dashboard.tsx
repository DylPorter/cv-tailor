import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { getGeneratedCount, listSaved, getMaster } from '../store/storage'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <motion.div variants={item}>
      <Card className="p-6 h-full">
        <div className="font-display text-4xl text-ink tabular-nums leading-none mb-2">
          {value}
        </div>
        <div className="text-sm text-ink-soft">{label}</div>
      </Card>
    </motion.div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const master = getMaster()
  const generated = getGeneratedCount()
  const savedCount = listSaved().length
  const [viewMaster, setViewMaster] = useState(false)

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.header variants={item} className="mb-10">
        <p className="text-clay font-medium tracking-wide uppercase text-xs mb-2">
          Welcome back
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
          Your CV workshop
        </h1>
        <p className="text-ink-soft mt-3 text-lg max-w-xl leading-relaxed">
          One universal profile, tailored into the right CV for every job worth applying to.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Stat value={generated} label="CVs generated" />
        <Stat value={savedCount} label="Saved CVs" />
        <Stat
          value={master ? <span className="text-sage">Ready</span> : <span className="text-ink-faint">Not set</span>}
          label="Universal profile"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Primary CTA */}
        <motion.div variants={item} className="lg:col-span-3">
          <Card className="p-8 h-full flex flex-col justify-between bg-clay text-paper border-clay-deep">
            <div>
              <h2 className="font-display text-3xl text-paper leading-tight mb-2">
                Tailor a new CV
              </h2>
              <p className="text-paper/80 leading-relaxed max-w-md">
                Paste a job description. Get a CV shaped to it and an honest fit report
                showing what lines up and what doesn&apos;t.
              </p>
            </div>
            <div className="mt-8">
              <Button
                variant="outline"
                size="lg"
                className="bg-paper border-paper text-clay-deep hover:bg-card hover:border-card"
                onClick={() => navigate('/generate')}
              >
                Start tailoring &rarr;
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Universal CV */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="p-7 h-full flex flex-col justify-between">
            <div>
              <h2 className="font-display text-2xl text-ink mb-1">Your universal CV</h2>
              {master ? (
                <p className="text-ink-soft text-sm leading-relaxed">
                  Saved &middot; last updated {formatDate(master.updatedAt)}
                </p>
              ) : (
                <p className="text-ink-soft text-sm leading-relaxed">
                  No profile yet — build one to start.
                </p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={!master}
                onClick={() => setViewMaster(true)}
              >
                View
              </Button>
              <Button variant="ghost" onClick={() => navigate('/onboarding')}>
                {master ? 'Rebuild' : 'Build it'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      <Modal
        open={viewMaster}
        onClose={() => setViewMaster(false)}
        title="Universal CV"
      >
        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ink-soft bg-paper rounded-xl border border-line p-5 max-h-[60vh] overflow-y-auto">
          {master?.text ?? ''}
        </pre>
      </Modal>
    </motion.div>
  )
}
