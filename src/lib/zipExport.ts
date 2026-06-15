import JSZip from 'jszip'
import { exportData, getMaster, listSaved } from '../store/storage'
import { renderPdf } from '../render/pdf'
import { renderDocx } from '../render/docx'
import { resumeFilename } from './filename'

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
 * CV, organised by field. Each CV is two files named descriptively and placed
 * directly inside its field folder:
 *
 *   {Field}/{Name}_Resume_{Role}.pdf
 *   {Field}/{Name}_Resume_{Role}.docx
 *   Universal Profile.txt
 *   cv-tailor-data.json
 */
export async function buildExportZip(): Promise<Blob> {
  const zip = new JSZip()

  zip.file('cv-tailor-data.json', exportData())
  zip.file('Universal Profile.txt', getMaster()?.text ?? '')

  const used = new Set<string>()

  for (const s of listSaved()) {
    const field = sanitize(s.field || 'General')
    const folder = zip.folder(field)!

    let pdfName = resumeFilename(s.cv.name, s.role || s.label, 'pdf')
    let docxName = resumeFilename(s.cv.name, s.role || s.label, 'docx')

    // Disambiguate filename collisions within a field with a short id suffix.
    if (used.has(`${field}/${pdfName}`)) {
      const suffix = `_${s.id.slice(0, 6)}`
      pdfName = pdfName.replace(/\.pdf$/, `${suffix}.pdf`)
      docxName = docxName.replace(/\.docx$/, `${suffix}.docx`)
    }
    used.add(`${field}/${pdfName}`)

    const [pdf, docx] = await Promise.all([renderPdf(s.cv), renderDocx(s.cv)])
    folder.file(pdfName, pdf)
    folder.file(docxName, docx)
  }

  return zip.generateAsync({ type: 'blob' })
}
