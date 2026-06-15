import { pdf } from '@react-pdf/renderer'
import { CVDocument } from './CVDocument'
import type { CVJson } from '../types'

export async function renderPdf(cv: CVJson): Promise<Blob> {
  return pdf(<CVDocument cv={cv} />).toBlob()
}
