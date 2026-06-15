import { describe, it, expect } from 'vitest'
import { validateTailorResponse } from './schema'

const valid = {
  cv: {
    name: 'Jane Doe',
    contact: { email: 'j@x.com' },
    summary: 'Ops leader.',
    experience: [{ title: 'Manager', org: 'Acme', dates: '2010-2020', bullets: ['Did X'] }],
    education: [{ credential: 'BA', institution: 'Uni', dates: '2006-2009' }],
    skills: ['Excel'],
  },
  fitReport: {
    requirements: [{ requirement: '5y ops', covered: true, evidence: '10y at Acme' }],
    gaps: ['No SQL'],
    keywordsMirrored: ['operations'],
  },
}

describe('validateTailorResponse', () => {
  it('accepts a well-formed response', () => {
    const result = validateTailorResponse(valid)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.cv.name).toBe('Jane Doe')
  })

  it('rejects missing cv.name', () => {
    const bad = { ...valid, cv: { ...valid.cv, name: undefined } }
    const result = validateTailorResponse(bad)
    expect(result.ok).toBe(false)
  })

  it('rejects non-object input', () => {
    expect(validateTailorResponse('nope').ok).toBe(false)
  })
})
