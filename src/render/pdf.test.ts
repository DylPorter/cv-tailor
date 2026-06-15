import { describe, it, expect } from 'vitest'
import { renderPdf } from './pdf'
import { SAMPLE_CV } from '../sample'

describe('renderPdf', () => {
  it('produces a non-trivial PDF buffer starting with %PDF', async () => {
    const blob = await renderPdf(SAMPLE_CV)
    const buf = Buffer.from(await blob.arrayBuffer())
    expect(buf.length).toBeGreaterThan(1000)
    expect(buf.subarray(0, 4).toString('ascii')).toBe('%PDF')
  })
})
