import { describe, it, expect, vi } from 'vitest'
import { tailor } from './tailor-core'
import { SAMPLE_CV, SAMPLE_FIT } from '../sample'

const goodJson = JSON.stringify({ cv: SAMPLE_CV, fitReport: SAMPLE_FIT })

const deps = (llm: any) => ({
  callLLM: llm,
  config: { baseUrl: 'b', apiKey: 'k', model: 'm' },
  password: 'secret',
})

describe('tailor', () => {
  it('rejects a wrong password before calling the LLM', async () => {
    const llm = vi.fn()
    const res = await tailor({ password: 'nope', master: 'M', jd: 'J' }, deps(llm))
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.status).toBe(401)
    expect(llm).not.toHaveBeenCalled()
  })

  it('returns validated data on a good LLM response', async () => {
    const llm = vi.fn().mockResolvedValue(goodJson)
    const res = await tailor({ password: 'secret', master: 'M', jd: 'J' }, deps(llm))
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.data.cv.name).toBe(SAMPLE_CV.name)
  })

  it('retries once when the first response is malformed JSON', async () => {
    const llm = vi.fn().mockResolvedValueOnce('not json').mockResolvedValueOnce(goodJson)
    const res = await tailor({ password: 'secret', master: 'M', jd: 'J' }, deps(llm))
    expect(llm).toHaveBeenCalledTimes(2)
    expect(res.ok).toBe(true)
  })

  it('fails cleanly when both attempts are malformed', async () => {
    const llm = vi.fn().mockResolvedValue('still not json')
    const res = await tailor({ password: 'secret', master: 'M', jd: 'J' }, deps(llm))
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.status).toBe(502)
  })

  it('rejects empty master or jd with 400', async () => {
    const llm = vi.fn()
    const res = await tailor({ password: 'secret', master: '', jd: 'J' }, deps(llm))
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.status).toBe(400)
    expect(llm).not.toHaveBeenCalled()
  })
})
