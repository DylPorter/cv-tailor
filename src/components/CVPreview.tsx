import type { CVJson } from '../types'

export function CVPreview({ cv }: { cv: CVJson }) {
  const contact = [cv.contact.location, cv.contact.email, cv.contact.phone, ...(cv.contact.links ?? [])]
    .filter(Boolean)
    .join('  •  ')
  return (
    <article className="bg-card border border-line rounded-[var(--radius-card)] p-8 sm:p-10 shadow-[0_1px_2px_rgba(33,29,24,0.04),0_8px_24px_-12px_rgba(33,29,24,0.12)] text-sm leading-relaxed text-ink max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-ink leading-tight">{cv.name}</h1>
      <p className="text-ink-faint mb-6 mt-1">{contact}</p>

      {cv.summary && (
        <section className="mb-5">
          <h2 className="uppercase text-xs font-semibold tracking-wider text-clay border-b border-line pb-1 mb-2">Summary</h2>
          <p className="text-ink-soft">{cv.summary}</p>
        </section>
      )}

      <section className="mb-5">
        <h2 className="uppercase text-xs font-semibold tracking-wider text-clay border-b border-line pb-1 mb-3">Experience</h2>
        {cv.experience.map((job, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between font-semibold text-ink">
              <span>{job.title}</span>
              <span className="text-ink-faint font-normal">{job.dates}</span>
            </div>
            <p className="italic text-ink-soft">{job.org}</p>
            <ul className="list-disc ml-5 mt-1 text-ink-soft marker:text-clay-soft">
              {job.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mb-5">
        <h2 className="uppercase text-xs font-semibold tracking-wider text-clay border-b border-line pb-1 mb-2">Education</h2>
        {cv.education.map((ed, i) => (
          <div key={i} className="flex justify-between">
            <span className="font-semibold text-ink">{ed.credential}, <span className="italic font-normal text-ink-soft">{ed.institution}</span></span>
            <span className="text-ink-faint">{ed.dates}</span>
          </div>
        ))}
      </section>

      <section className="mb-5">
        <h2 className="uppercase text-xs font-semibold tracking-wider text-clay border-b border-line pb-1 mb-2">Skills</h2>
        <p className="text-ink-soft">{cv.skills.join('  •  ')}</p>
      </section>

      {(cv.extras ?? []).map((ex, i) => (
        <section key={i} className="mb-5">
          <h2 className="uppercase text-xs font-semibold tracking-wider text-clay border-b border-line pb-1 mb-2">{ex.heading}</h2>
          <p className="text-ink-soft">{ex.items.join('  •  ')}</p>
        </section>
      ))}
    </article>
  )
}
