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
  // Entry WITHOUT a role → file name falls back to the label.
  saveCV({ label: 'Uni — Lecturer', field: 'Academic', jd: 'J', cv: SAMPLE_CV, fitReport: SAMPLE_FIT })
  // Entry WITH a stored role → file name uses the role, not the label.
  saveCV({ label: 'Acme — Ops', role: 'Operations Director', jd: 'J', cv: SAMPLE_CV, fitReport: SAMPLE_FIT })
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

    // Flat: {Field}/{Name}_Resume_{Role}.{ext}, no wrapper or per-CV subfolder.
    // No stored role → falls back to the label.
    expect(zip.file('Academic/Jordan_Avery_Resume_Uni_Lecturer.pdf')).not.toBeNull()
    expect(zip.file('Academic/Jordan_Avery_Resume_Uni_Lecturer.docx')).not.toBeNull()
    // Stored role → file name uses the role, NOT the label ("Acme — Ops").
    expect(zip.file('General/Jordan_Avery_Resume_Operations_Director.pdf')).not.toBeNull()
    expect(zip.file('General/Jordan_Avery_Resume_Operations_Director.docx')).not.toBeNull()

    // No legacy wrapper folder.
    expect(zip.file(/^Tailored CVs\//)).toHaveLength(0)
  })
})
