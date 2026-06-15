import { describe, it, expect, vi } from 'vitest'

vi.mock('mammoth', () => ({
  default: { extractRawText: vi.fn().mockResolvedValue({ value: 'docx text' }) },
}))

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: vi.fn(() =>
        Promise.resolve({
          getTextContent: vi.fn(() => Promise.resolve({ items: [{ str: 'pdf' }, { str: 'text' }] })),
        }),
      ),
    }),
  })),
}))

import { parseUploadFile } from './parseUpload'

describe('parseUploadFile', () => {
  it('parses .docx via mammoth', async () => {
    const f = { arrayBuffer: async () => new ArrayBuffer(8), name: 'cv.docx' } as unknown as File
    expect(await parseUploadFile(f)).toBe('docx text')
  })
  it('parses .pdf via pdfjs', async () => {
    const f = { arrayBuffer: async () => new ArrayBuffer(8), name: 'cv.pdf' } as unknown as File
    expect(await parseUploadFile(f)).toContain('pdf text')
  })
  it('rejects unsupported types (e.g. legacy .doc)', async () => {
    const f = { arrayBuffer: async () => new ArrayBuffer(8), name: 'cv.doc' } as unknown as File
    await expect(parseUploadFile(f)).rejects.toThrow(/Unsupported|\.pdf|\.docx/i)
  })
})
