import { useState } from 'react'
import type { TailorResponse } from '../types'
import { requestTailor } from '../lib/api'
import { renderPdf } from '../render/pdf'
import { renderDocx } from '../render/docx'
import { triggerDownload } from '../lib/download'
import { saveCV, getPrefs } from '../store/storage'
import { CVPreview } from './CVPreview'
import { FitReportView } from './FitReportView'

export function TailorPanel({ master, password, onSaved }: { master: string; password: string; onSaved?: () => void }) {
  const [jd, setJd] = useState('')
  const [label, setLabel] = useState('')
  const [result, setResult] = useState<TailorResponse | null>(null)
  const [refine, setRefine] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(refineInstruction?: string) {
    if (!jd.trim()) return
    setBusy(true)
    setError('')
    try {
      const data = await requestTailor({
        password,
        master,
        jd,
        prefs: getPrefs(),
        priorCv: refineInstruction ? result?.cv : undefined,
        refineInstruction,
      })
      setResult(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function save() {
    if (!result) return
    try {
      saveCV({ label: label || 'Untitled role', jd, cv: result.cv, fitReport: result.fitReport })
      setError('')
      onSaved?.()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h2 className="font-semibold">Target job</h2>
        <textarea
          className="w-full h-48 border rounded p-3 text-sm"
          placeholder="Paste the job description here…"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
        <button className="bg-slate-900 text-white rounded px-4 py-2" disabled={busy} onClick={() => run()}>
          {busy ? 'Tailoring…' : 'Tailor my CV'}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {result && (
          <div className="space-y-2 pt-2 border-t">
            <FitReportView report={result.fitReport} />
            <div className="flex flex-wrap gap-2 pt-2">
              <button className="border rounded px-3 py-1 text-sm" onClick={async () => triggerDownload(await renderPdf(result.cv), 'CV.pdf')}>
                Download PDF
              </button>
              <button className="border rounded px-3 py-1 text-sm" onClick={async () => triggerDownload(await renderDocx(result.cv), 'CV.docx')}>
                Download .docx
              </button>
            </div>
            <div className="flex gap-2 pt-2">
              <input className="border rounded px-2 py-1 text-sm flex-1" placeholder="Label (e.g. Acme — Ops Manager)" value={label} onChange={(e) => setLabel(e.target.value)} />
              <button className="border rounded px-3 py-1 text-sm" onClick={save}>Save to folder</button>
            </div>
            <div className="flex gap-2 pt-2">
              <input className="border rounded px-2 py-1 text-sm flex-1" placeholder="Refine: e.g. make it shorter" value={refine} onChange={(e) => setRefine(e.target.value)} />
              <button className="border rounded px-3 py-1 text-sm" disabled={busy} onClick={() => run(refine)}>Refine</button>
            </div>
          </div>
        )}
      </div>

      <div>
        {result ? <CVPreview cv={result.cv} /> : <p className="text-slate-400">Your tailored CV preview will appear here.</p>}
      </div>
    </div>
  )
}
