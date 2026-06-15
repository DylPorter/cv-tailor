import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

export interface PdfMetrics {
  pages: number
  /**
   * Fraction of the LAST page's height occupied by content
   * (1.0 ≈ full, ~0.1 ≈ nearly empty). Used to decide whether a 2-page
   * render is a legit full two-pager or a sparse spill that should be
   * compressed back to one page.
   */
  lastPageFillRatio: number
}

// Renders nothing — just measures an existing PDF blob.
export async function measurePdf(blob: Blob): Promise<PdfMetrics> {
  const data = await blob.arrayBuffer()
  const doc = await pdfjsLib.getDocument({ data }).promise
  const pages = doc.numPages
  const page = await doc.getPage(pages)
  const viewport = page.getViewport({ scale: 1 })
  const content = await page.getTextContent()

  // PDF coords put origin at the bottom-left, so a text item's distance from
  // the top is (height - y). The largest such distance is how far down the
  // page content reaches; as a fraction of height that's the fill ratio.
  let maxExtent = 0
  for (const item of content.items as { transform?: number[] }[]) {
    const y = item.transform?.[5]
    if (typeof y === 'number') {
      const extent = viewport.height - y
      if (extent > maxExtent) maxExtent = extent
    }
  }

  return { pages, lastPageFillRatio: Math.min(1, maxExtent / viewport.height) }
}
