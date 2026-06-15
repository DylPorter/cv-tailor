import { describe, it, expect } from 'vitest'
import { renderDocx } from './docx'
import { SAMPLE_CV } from '../sample'

describe('renderDocx', () => {
  it('produces a docx (zip) buffer starting with PK', async () => {
    const blob = await renderDocx(SAMPLE_CV)
    const buf = Buffer.from(await blob.arrayBuffer())
    expect(buf.length).toBeGreaterThan(1000)
    expect(buf.subarray(0, 2).toString('ascii')).toBe('PK')
  })
})
