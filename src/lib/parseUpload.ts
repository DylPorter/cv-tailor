import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value.trim()
}

async function parsePdf(file: File): Promise<string> {
  const data = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map((it: any) => ('str' in it ? it.str : '')).join(' '))
  }
  return pages.join('\n\n').trim()
}

export async function parseUploadFile(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.docx')) return parseDocx(file)
  if (name.endsWith('.pdf')) return parsePdf(file)
  throw new Error('Unsupported file type. Upload a .pdf or .docx, or paste your CV text.')
}
