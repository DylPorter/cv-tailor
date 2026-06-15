import JSZip from 'jszip'
import { exportData, getMaster, listSaved } from '../store/storage'
import { renderPdf } from '../render/pdf'
import { renderDocx } from '../render/docx'

/** Strip characters that are illegal in folder/file names across OSes. */
function sanitize(name: string): string {
  const cleaned = name.replace(/[/\\:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim()
  return cleaned || 'Untitled'
}

/** Quick preview stats for the export modal. */
export function exportSummary(): { count: number; fields: string[] } {
  const saved = listSaved()
  const fields = Array.from(new Set(saved.map((s) => s.field || 'General')))
  return { count: saved.length, fields }
}

/**
 * Build a downloadable folder (zip) containing the canonical manifest, the
 * universal profile as plain text, and a rendered PDF + .docx for every saved
 * CV, organised by field then label.
 */
export async function buildExportZip(): Promise<Blob> {
  const zip = new JSZip()

  zip.file('cv-tailor-data.json', exportData())
  zip.file('Universal Profile.txt', getMaster()?.text ?? '')

  const root = zip.folder('Tailored CVs')!
  const used = new Set<string>()

  for (const s of listSaved()) {
    const field = sanitize(s.field || 'General')
    let label = sanitize(s.label)

    // Disambiguate field+label collisions with a short id suffix.
    let key = `${field}/${label}`
    if (used.has(key)) {
      label = `${label} (${s.id.slice(0, 6)})`
      key = `${field}/${label}`
    }
    used.add(key)

    const folder = root.folder(field)!.folder(label)!
    const [pdf, docx] = await Promise.all([renderPdf(s.cv), renderDocx(s.cv)])
    folder.file('CV.pdf', pdf)
    folder.file('CV.docx', docx)
  }

  return zip.generateAsync({ type: 'blob' })
}
