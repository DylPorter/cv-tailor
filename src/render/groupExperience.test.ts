import { describe, it, expect } from 'vitest'
import { groupExperienceByOrg } from './groupExperience'
import type { CVExperience } from '../types'

function role(title: string, org: string): CVExperience {
  return { title, org, dates: '2000 – 2001', bullets: [`${title} bullet`] }
}

describe('groupExperienceByOrg', () => {
  it('groups consecutive same-org entries, keeping non-consecutive ones separate', () => {
    const experience: CVExperience[] = [
      role('Director', 'Meridian Cultural Trust'),
      role('Senior Manager', 'Meridian Cultural Trust'),
      role('Manager', 'Meridian Cultural Trust'),
      role('Tutor', 'Lexicon Tutors'),
      role('Volunteer', 'Meridian Cultural Trust'),
    ]
    const groups = groupExperienceByOrg(experience)
    expect(groups).toHaveLength(3)
    expect(groups[0].org).toBe('Meridian Cultural Trust')
    expect(groups[0].roles).toHaveLength(3)
    expect(groups[0].roles.map((r) => r.title)).toEqual([
      'Director',
      'Senior Manager',
      'Manager',
    ])
    expect(groups[1].org).toBe('Lexicon Tutors')
    expect(groups[1].roles).toHaveLength(1)
    expect(groups[2].org).toBe('Meridian Cultural Trust')
    expect(groups[2].roles).toHaveLength(1)
    expect(groups[2].roles[0].title).toBe('Volunteer')
  })

  it('matches org case-insensitively and trimmed', () => {
    const experience: CVExperience[] = [
      role('A', 'Meridian Cultural Trust'),
      role('B', '  meridian cultural trust '),
    ]
    const groups = groupExperienceByOrg(experience)
    expect(groups).toHaveLength(1)
    expect(groups[0].roles).toHaveLength(2)
  })

  it('handles a single entry', () => {
    const groups = groupExperienceByOrg([role('Solo', 'Acme')])
    expect(groups).toHaveLength(1)
    expect(groups[0].org).toBe('Acme')
    expect(groups[0].roles).toHaveLength(1)
  })

  it('handles an empty array', () => {
    expect(groupExperienceByOrg([])).toEqual([])
  })
})
