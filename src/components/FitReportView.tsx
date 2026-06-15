import type { FitReport } from '../types'

export function FitReportView({ report }: { report: FitReport }) {
  return (
    <div className="space-y-3 text-sm">
      <h3 className="font-display text-lg text-ink">Fit report</h3>
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
        <p className="text-ink-faint">Keywords mirrored: {report.keywordsMirrored.join(', ')}</p>
      )}
    </div>
  )
}
