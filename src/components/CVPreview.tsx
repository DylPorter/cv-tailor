import type { CVJson } from '../types'

export function CVPreview({ cv }: { cv: CVJson }) {
  const contact = [cv.contact.location, cv.contact.email, cv.contact.phone, ...(cv.contact.links ?? [])]
    .filter(Boolean)
    .join('  •  ')
  return (
    <article className="bg-white p-8 shadow text-sm leading-relaxed max-w-2xl">
      <h1 className="text-2xl font-bold">{cv.name}</h1>
      <p className="text-slate-500 mb-4">{contact}</p>

      {cv.summary && (
        <section className="mb-4">
          <h2 className="uppercase text-xs font-bold border-b pb-1 mb-2">Summary</h2>
          <p>{cv.summary}</p>
        </section>
      )}

      <section className="mb-4">
        <h2 className="uppercase text-xs font-bold border-b pb-1 mb-2">Experience</h2>
        {cv.experience.map((job, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between font-semibold">
              <span>{job.title}</span>
              <span className="text-slate-500 font-normal">{job.dates}</span>
            </div>
            <p className="italic">{job.org}</p>
            <ul className="list-disc ml-5">
              {job.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mb-4">
        <h2 className="uppercase text-xs font-bold border-b pb-1 mb-2">Education</h2>
        {cv.education.map((ed, i) => (
          <div key={i} className="flex justify-between">
            <span className="font-semibold">{ed.credential}, <span className="italic font-normal">{ed.institution}</span></span>
            <span className="text-slate-500">{ed.dates}</span>
          </div>
        ))}
      </section>

      <section className="mb-4">
        <h2 className="uppercase text-xs font-bold border-b pb-1 mb-2">Skills</h2>
        <p>{cv.skills.join('  •  ')}</p>
      </section>

      {(cv.extras ?? []).map((ex, i) => (
        <section key={i} className="mb-4">
          <h2 className="uppercase text-xs font-bold border-b pb-1 mb-2">{ex.heading}</h2>
          <p>{ex.items.join('  •  ')}</p>
        </section>
      ))}
    </article>
  )
}
