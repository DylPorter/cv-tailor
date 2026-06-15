import type { FitReport } from '../types'

export function FitReportView({ report }: { report: FitReport }) {
  return (
    <div className="space-y-3 text-sm">
      <h3 className="font-semibold">Fit report</h3>
      <ul className="space-y-1">
        {report.requirements.map((r, i) => (
          <li key={i} className="flex gap-2">
            <span>{r.covered ? '✅' : '⚠️'}</span>
            <span>
              {r.requirement}
              {r.evidence ? <span className="text-slate-500"> — {r.evidence}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      {report.gaps.length > 0 && (
        <div>
          <p className="font-medium">Gaps</p>
          <ul className="list-disc ml-5 text-slate-600">
            {report.gaps.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      )}
      {report.keywordsMirrored.length > 0 && (
        <p className="text-slate-500">Keywords mirrored: {report.keywordsMirrored.join(', ')}</p>
      )}
    </div>
  )
}
