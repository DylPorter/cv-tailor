import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { FitReport } from '../types'

const ease = [0.22, 1, 0.36, 1] as const

export function FitReportView({ report }: { report: FitReport }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left group"
      >
        <h3 className="font-display text-lg text-ink">Fit report</h3>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.25, ease }}
          className="text-ink-faint group-hover:text-ink-soft"
          aria-hidden
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-3">
              <ul className="space-y-1.5">
                {report.requirements.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className={r.covered ? 'text-sage' : 'text-clay'} aria-hidden>
                      {r.covered ? '✓' : '!'}
                    </span>
                    <span className="text-ink">
                      {r.requirement}
                      {r.evidence ? <span className="text-ink-faint"> — {r.evidence}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
              {report.gaps.length > 0 && (
                <div>
                  <p className="font-medium text-ink">Gaps</p>
                  <ul className="list-disc ml-5 text-ink-soft marker:text-clay-soft">
                    {report.gaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
              {report.keywordsMirrored.length > 0 && (
                <p className="text-ink-faint">
                  Keywords mirrored: {report.keywordsMirrored.join(', ')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
