import { describe, it, expect, vi, afterEach } from 'vitest'
import { requestTailor } from './api'
import { SAMPLE_CV, SAMPLE_FIT } from '../sample'

afterEach(() => vi.restoreAllMocks())

describe('requestTailor', () => {
  it('POSTs to /api/tailor and returns parsed data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ cv: SAMPLE_CV, fitReport: SAMPLE_FIT }),
    }))
    const data = await requestTailor({ password: 'p', master: 'M', jd: 'J' })
    expect(data.cv.name).toBe(SAMPLE_CV.name)
  })

  it('throws the server error message on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Incorrect password.' }),
    }))
    await expect(requestTailor({ password: 'x', master: 'M', jd: 'J' })).rejects.toThrow('Incorrect password.')
  })
})
