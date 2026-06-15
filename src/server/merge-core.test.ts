import { describe, it, expect, vi } from 'vitest'
import { mergeProfiles } from './merge-core'

const deps = (llm: any) => ({
  callLLM: llm,
  config: { baseUrl: 'b', apiKey: 'k', model: 'm' },
  password: 'secret',
})

describe('mergeProfiles', () => {
  it('rejects a wrong password before calling the LLM', async () => {
    const llm = vi.fn()
    const r = await mergeProfiles({ password: 'no', cvs: ['a'] }, deps(llm))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.status).toBe(401)
    expect(llm).not.toHaveBeenCalled()
  })

  it('rejects an empty CV list with 400', async () => {
    const llm = vi.fn()
    const r = await mergeProfiles({ password: 'secret', cvs: ['  ', ''] }, deps(llm))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.status).toBe(400)
    expect(llm).not.toHaveBeenCalled()
  })

  it('returns merged profile text and calls the LLM in non-JSON mode', async () => {
    const llm = vi.fn().mockResolvedValue('MERGED PROFILE')
    const r = await mergeProfiles({ password: 'secret', cvs: ['cv one', 'cv two'] }, deps(llm))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.profile).toBe('MERGED PROFILE')
    expect(llm.mock.calls[0][2]).toEqual({ json: false })
  })
})
