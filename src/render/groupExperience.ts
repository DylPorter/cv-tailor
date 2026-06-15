import type { CVExperience } from '../types'

export interface OrgGroup {
  org: string
  roles: { title: string; dates: string; bullets: string[] }[]
}

// Group only CONSECUTIVE entries sharing the same org (case-insensitive, trimmed),
// preserving order. Non-consecutive same-org entries stay separate (rare; respects ordering).
export function groupExperienceByOrg(experience: CVExperience[]): OrgGroup[] {
  const groups: OrgGroup[] = []
  for (const e of experience) {
    const last = groups[groups.length - 1]
    if (last && last.org.trim().toLowerCase() === e.org.trim().toLowerCase()) {
      last.roles.push({ title: e.title, dates: e.dates, bullets: e.bullets })
    } else {
      groups.push({ org: e.org, roles: [{ title: e.title, dates: e.dates, bullets: e.bullets }] })
    }
  }
  return groups
}
