import { useState } from 'react'
import { PasswordGate } from './components/PasswordGate'
import { MasterProfileEditor } from './components/MasterProfileEditor'
import { TailorPanel } from './components/TailorPanel'
import { SavedFolder } from './components/SavedFolder'
import { CVPreview } from './components/CVPreview'
import { FitReportView } from './components/FitReportView'
import { getMaster, exportData, importData } from './store/storage'
import { triggerDownload } from './lib/download'
import { renderPdf } from './render/pdf'
import { renderDocx } from './render/docx'
import type { SavedCV } from './types'

export default function App() {
  const [password, setPassword] = useState<string>(() => sessionStorage.getItem('cv-tailor:pw') ?? '')
  const [master, setMasterText] = useState<string>(() => getMaster()?.text ?? '')
  const [opened, setOpened] = useState<SavedCV | null>(null)
  const [restoreError, setRestoreError] = useState('')

  if (!password) {
    return (
      <PasswordGate
        onUnlock={(pw) => {
          sessionStorage.setItem('cv-tailor:pw', pw)
          setPassword(pw)
        }}
      />
    )
  }

  async function onRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setRestoreError('')
    try {
      importData(await file.text())
      window.location.reload()
    } catch (err) {
      setRestoreError((err as Error).message)
    }
  }

  function backup() {
    triggerDownload(new Blob([exportData()], { type: 'application/json' }), 'cv-tailor-backup.json')
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">cv-tailor</h1>
        <div className="flex items-center gap-3 text-sm">
          <button className="text-slate-600" onClick={backup}>Back up</button>
          <label className="text-slate-600 cursor-pointer">
            Restore
            <input type="file" accept="application/json,.json" className="hidden" onChange={onRestore} />
          </label>
          <button
            className="text-slate-500"
            onClick={() => {
              sessionStorage.removeItem('cv-tailor:pw')
              setPassword('')
            }}
          >
            Lock
          </button>
        </div>
      </header>
      {restoreError && <p className="text-red-600 text-sm">{restoreError}</p>}

      <section className="border rounded-xl p-5">
        <MasterProfileEditor onSaved={setMasterText} />
      </section>

      {master ? (
        <section className="border rounded-xl p-5">
          <TailorPanel master={master} password={password} />
        </section>
      ) : (
        <p className="text-slate-500">Save your career history above to start tailoring.</p>
      )}

      <section className="border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold">Saved CVs</h2>
        <SavedFolder onOpen={setOpened} />
        {opened && (
          <div className="space-y-2 pt-3 border-t">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{opened.label}</h3>
              <button className="text-slate-500 text-sm" onClick={() => setOpened(null)}>Close</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="border rounded px-3 py-1 text-sm" onClick={async () => triggerDownload(await renderPdf(opened.cv), 'CV.pdf')}>Download PDF</button>
              <button className="border rounded px-3 py-1 text-sm" onClick={async () => triggerDownload(await renderDocx(opened.cv), 'CV.docx')}>Download .docx</button>
            </div>
            <FitReportView report={opened.fitReport} />
            <CVPreview cv={opened.cv} />
          </div>
        )}
      </section>
    </div>
  )
}
