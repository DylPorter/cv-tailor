import { describe, it, expect, beforeEach, vi } from 'vitest'
import JSZip from 'jszip'
import { SAMPLE_CV, SAMPLE_FIT } from '../sample'

vi.mock('../render/pdf', () => ({
  renderPdf: vi.fn(async () => new Blob(['%PDF'])),
}))
vi.mock('../render/docx', () => ({
  renderDocx: vi.fn(async () => new Blob(['PK'])),
}))

import { buildExportZip, exportSummary } from './zipExport'
import { setMaster, saveCV } from '../store/storage'

beforeEach(() => localStorage.clear())

function seed() {
  setMaster('my universal history')
  saveCV({ label: 'Uni — Lecturer', field: 'Academic', jd: 'J', cv: SAMPLE_CV, fitReport: SAMPLE_FIT })
  saveCV({ label: 'Acme — Ops', jd: 'J', cv: SAMPLE_CV, fitReport: SAMPLE_FIT })
}

describe('zipExport', () => {
  it('summarises saved CVs and distinct fields', () => {
    seed()
    const summary = exportSummary()
    expect(summary.count).toBe(2)
    expect(summary.fields.sort()).toEqual(['Academic', 'General'])
  })

  it('builds a zip with manifest, profile, and per-field CV folders', async () => {
    seed()
    const blob = await buildExportZip()
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())

    const manifestFile = zip.file('cv-tailor-data.json')
    expect(manifestFile).not.toBeNull()
    const manifest = JSON.parse(await manifestFile!.async('string'))
    expect(typeof manifest).toBe('object')
    expect(manifest.saved).toHaveLength(2)

    expect(zip.file('Universal Profile.txt')).not.toBeNull()
    expect(await zip.file('Universal Profile.txt')!.async('string')).toBe('my universal history')

    expect(zip.file('Tailored CVs/Academic/Uni — Lecturer/CV.pdf')).not.toBeNull()
    expect(zip.file('Tailored CVs/Academic/Uni — Lecturer/CV.docx')).not.toBeNull()
    expect(zip.file('Tailored CVs/General/Acme — Ops/CV.pdf')).not.toBeNull()
  })
})
