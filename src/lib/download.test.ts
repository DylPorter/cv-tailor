import { describe, it, expect, vi, afterEach } from 'vitest'
import { triggerDownload } from './download'

afterEach(() => vi.restoreAllMocks())

describe('triggerDownload', () => {
  it('creates an object URL and clicks an anchor', () => {
    const createUrl = vi.fn().mockReturnValue('blob:x')
    const revoke = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: createUrl, revokeObjectURL: revoke })
    const click = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValue({ click, set href(_v: string) {}, set download(_v: string) {} } as any)

    triggerDownload(new Blob(['x']), 'cv.pdf')
    expect(createUrl).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()
  })
})
