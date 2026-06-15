import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mirrors parseUpload.test.ts's pdfjs mock style. Each test reconfigures the
// getDocument mock to model a specific page count + last-page text layout.
const getDocument = vi.fn()

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: (...args: unknown[]) => getDocument(...args),
}))

import { measurePdf } from './pdfMeasure'

const A4_HEIGHT = 842

function mockDoc(numPages: number, lastPageItems: { transform: number[] }[]) {
  return {
    promise: Promise.resolve({
      numPages,
      getPage: vi.fn(() =>
        Promise.resolve({
          getViewport: () => ({ width: 595, height: A4_HEIGHT }),
          getTextContent: () => Promise.resolve({ items: lastPageItems }),
        }),
      ),
    }),
  }
}

const blob = { arrayBuffer: async () => new ArrayBuffer(8) } as unknown as Blob

describe('measurePdf', () => {
  beforeEach(() => getDocument.mockReset())

  it('reports a sparse last page (2 pages, one item near the top → low fill)', async () => {
    // y near the top of the page → tiny distance-from-top → near-empty page.
    getDocument.mockReturnValue(mockDoc(2, [{ transform: [1, 0, 0, 1, 44, 800] }]))
    const m = await measurePdf(blob)
    expect(m.pages).toBe(2)
    expect(m.lastPageFillRatio).toBeLessThan(0.3)
  })

  it('reports a single-page document', async () => {
    getDocument.mockReturnValue(mockDoc(1, [{ transform: [1, 0, 0, 1, 44, 120] }]))
    const m = await measurePdf(blob)
    expect(m.pages).toBe(1)
  })

  it('reports a full last page when content reaches the bottom', async () => {
    // y near the bottom → large distance-from-top → high fill ratio.
    getDocument.mockReturnValue(mockDoc(2, [{ transform: [1, 0, 0, 1, 44, 60] }]))
    const m = await measurePdf(blob)
    expect(m.pages).toBe(2)
    expect(m.lastPageFillRatio).toBeGreaterThan(0.8)
  })
})
