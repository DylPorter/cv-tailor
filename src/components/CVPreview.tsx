import type { CVJson } from '../types'
import { groupExperienceByOrg } from '../render/groupExperience'

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
        {groupExperienceByOrg(cv.experience).map((group, i) => {
          const multi = group.roles.length > 1
          return (
            <div key={i} className="mb-4">
              <p className="font-semibold text-ink">{group.org}</p>
              <div className={multi ? 'border-l border-line pl-3 mt-1 space-y-2.5' : 'mt-0.5'}>
                {group.roles.map((r, j) => (
                  <div key={j}>
                    <div className="flex justify-between text-ink">
                      <span className="italic text-ink-soft">{r.title}</span>
                      <span className="text-ink-faint">{r.dates}</span>
                    </div>
                    <ul className="list-disc ml-5 mt-1 text-ink-soft marker:text-clay-soft">
                      {r.bullets.map((b, k) => (
                        <li key={k}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
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
