import { useState } from 'react'
import { getMaster, setMaster, getPrefs, setPrefs } from '../store/storage'
import { parseUploadFile } from '../lib/parseUpload'

export function MasterProfileEditor({ onSaved }: { onSaved: (text: string) => void }) {
  const [text, setText] = useState(getMaster()?.text ?? '')
  const [prefs, setPrefsState] = useState(getPrefs())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      setText(await parseUploadFile(file))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function save() {
    if (!text.trim()) return
    try {
      setMaster(text)
      setPrefs(prefs)
      setError('')
      onSaved(text)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold">Your full career history</h2>
      <p className="text-sm text-slate-500">
        Paste everything, or upload your existing PDF / Word CV. This stays in your browser.
      </p>
      <input type="file" accept=".pdf,.docx" onChange={onUpload} disabled={busy} />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <textarea
        className="w-full h-64 border rounded p-3 text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your full CV / career history here…"
      />
      <div>
        <label className="block text-sm font-medium">Standing preferences (optional)</label>
        <p className="text-xs text-slate-500 mb-1">
          Notes applied to every CV — e.g. "UK English, concise bullets, targets academic + training roles".
        </p>
        <textarea
          className="w-full h-20 border rounded p-3 text-sm"
          value={prefs}
          onChange={(e) => setPrefsState(e.target.value)}
          placeholder="e.g. UK English. Concise bullets. Targets academic + L&D roles."
        />
      </div>
      <button className="bg-slate-900 text-white rounded px-4 py-2" onClick={save}>
        Save profile
      </button>
    </div>
  )
}
