import { describe, it, expect } from 'vitest'
import { buildMessages } from './prompt'

describe('buildMessages', () => {
  it('includes master, jd, and the no-fabrication rule', () => {
    const msgs = buildMessages({ master: 'MASTER_TEXT', jd: 'JD_TEXT' })
    const all = JSON.stringify(msgs)
    expect(msgs[0].role).toBe('system')
    expect(all).toContain('MASTER_TEXT')
    expect(all).toContain('JD_TEXT')
    expect(msgs[0].content.toLowerCase()).toContain('never invent')
  })

  it('appends refine instruction and prior CV when refining', () => {
    const msgs = buildMessages({
      master: 'M',
      jd: 'J',
      priorCv: { name: 'X' } as any,
      refineInstruction: 'make it shorter',
    })
    // Assert against the raw user-message content. NOTE: the spec's original
    // assertion used JSON.stringify(msgs), but that double-escapes the nested
    // CV JSON (it appears as \"name\":\"X\"), so `"name":"X"` can never be a
    // literal substring of the double-stringified blob. The user content is
    // what we actually want to verify the prior CV is embedded in.
    const userContent = msgs[1].content
    expect(userContent).toContain('make it shorter')
    expect(userContent).toContain('"name":"X"')
  })

  it('includes preferences when provided', () => {
    const msgs = buildMessages({ master: 'M', jd: 'J', prefs: 'UK English only' })
    expect(JSON.stringify(msgs)).toContain('UK English only')
  })

  it('omits the preferences block when prefs is empty', () => {
    const msgs = buildMessages({ master: 'M', jd: 'J', prefs: '   ' })
    expect(JSON.stringify(msgs)).not.toContain('STANDING INSTRUCTIONS')
  })
})
