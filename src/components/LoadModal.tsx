import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { collectFiles, findManifest, extractCvTexts, type CollectedFile } from '../lib/folderImport'
import { importData } from '../store/storage'

type Stage =
  | { kind: 'choose' }
  | { kind: 'reading' }
  | { kind: 'manifest'; text: string }
  | { kind: 'rawCvs'; files: CollectedFile[] }
  | { kind: 'empty' }

export function LoadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const folderRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>({ kind: 'choose' })
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy] = useState(false)

  function reset() {
    setStage({ kind: 'choose' })
    setError('')
    setDragOver(false)
    setBusy(false)
  }

  function close() {
    reset()
    onClose()
  }

  async function ingest(input: FileList | DataTransferItem[]) {
    setError('')
    setStage({ kind: 'reading' })
    try {
      const files = await collectFiles(input)
      if (files.length === 0) {
        setStage({ kind: 'empty' })
        return
      }
      const manifest = await findManifest(files)
      if (manifest) {
        setStage({ kind: 'manifest', text: manifest })
        return
      }
      const hasCvs = files.some((f) => {
        const n = f.file.name.toLowerCase()
        return n.endsWith('.pdf') || n.endsWith('.docx')
      })
      setStage(hasCvs ? { kind: 'rawCvs', files } : { kind: 'empty' })
    } catch (err) {
      setError((err as Error).message)
      setStage({ kind: 'choose' })
    }
  }

  function confirmManifest(text: string) {
    setBusy(true)
    setError('')
    try {
      importData(text)
      window.location.reload()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  async function buildProfileFrom(files: CollectedFile[]) {
    setBusy(true)
    setError('')
    try {
      const texts = await extractCvTexts(files)
      if (texts.length === 0) {
        setError('We couldn’t read any text out of those files.')
        setBusy(false)
        return
      }
      navigate('/onboarding', { state: { seededCvs: texts } })
      close()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    void ingest(Array.from(e.dataTransfer.items))
  }

  return (
    <Modal open={open} onClose={close} title="Load your CVs">
      {stage.kind === 'choose' && (
        <>
          <p className="text-ink-soft leading-relaxed mb-6">
            Choose or drop a folder of your CVs — or a cv-tailor export. We&apos;ll figure
            out what to do with it.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
              dragOver ? 'border-clay/60 bg-paper-deep' : 'border-line bg-paper'
            }`}
          >
            <div className="font-display text-xl text-ink mb-1">Drop a folder here</div>
            <div className="text-sm text-ink-faint mb-5">or pick one from your computer</div>
            <Button variant="outline" onClick={() => folderRef.current?.click()}>
              Choose a folder
            </Button>
            <input
              ref={folderRef}
              type="file"
              multiple
              // Non-standard directory picker — Chrome target.
              {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) void ingest(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          {error && (
            <p className="mt-5 rounded-lg border border-clay/30 bg-clay-soft/40 px-4 py-2.5 text-sm text-clay-deep">
              {error}
            </p>
          )}
        </>
      )}

      {stage.kind === 'reading' && (
        <div className="py-12 text-center text-ink-soft">Reading your folder…</div>
      )}

      {stage.kind === 'manifest' && (
        <>
          <p className="text-ink leading-relaxed mb-2 font-medium">
            This is a cv-tailor export.
          </p>
          <p className="text-ink-soft leading-relaxed mb-6">
            Loading it will{' '}
            <span className="text-clay-deep font-medium">replace</span> your current
            universal profile and saved CVs. This can&apos;t be undone.
          </p>
          {error && (
            <p className="mb-5 rounded-lg border border-clay/30 bg-clay-soft/40 px-4 py-2.5 text-sm text-clay-deep">
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={reset} disabled={busy}>
              Back
            </Button>
            <Button onClick={() => confirmManifest(stage.text)} disabled={busy}>
              {busy ? 'Loading…' : 'Replace everything'}
            </Button>
          </div>
        </>
      )}

      {stage.kind === 'rawCvs' && (
        <>
          <p className="text-ink-soft leading-relaxed mb-6">
            These are CV files, not a cv-tailor export. Here&apos;s what we can do with
            them:
          </p>

          <div className="space-y-4 mb-6">
            <button
              type="button"
              disabled={busy}
              onClick={() => void buildProfileFrom(stage.files)}
              className="w-full text-left rounded-xl border border-line bg-paper hover:border-clay/50 hover:bg-paper-deep transition-colors px-5 py-4 disabled:opacity-50"
            >
              <div className="font-display text-lg text-ink mb-1">
                Build my universal profile from these
              </div>
              <div className="text-sm text-ink-soft leading-relaxed">
                We&apos;ll read them and fold them into one master profile — the source we
                tailor every new CV from.
              </div>
            </button>

            <div className="rounded-xl border border-line bg-paper px-5 py-4 opacity-70">
              <div className="font-display text-lg text-ink-soft mb-1">
                Import as saved CVs
              </div>
              <div className="text-sm text-ink-faint leading-relaxed">
                Not available for plain PDF/Word files. A finished PDF can&apos;t be turned
                back into an editable tailored CV — only a full cv-tailor export (with its{' '}
                <span className="font-mono text-xs">cv-tailor-data.json</span>) can be
                restored that way.
              </div>
            </div>
          </div>

          {error && (
            <p className="mb-5 rounded-lg border border-clay/30 bg-clay-soft/40 px-4 py-2.5 text-sm text-clay-deep">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end">
            <Button variant="ghost" onClick={reset} disabled={busy}>
              Back
            </Button>
          </div>
        </>
      )}

      {stage.kind === 'empty' && (
        <>
          <p className="text-ink-soft leading-relaxed mb-6">
            We couldn&apos;t find any CVs or a cv-tailor export in there. Try a folder that
            contains PDF or Word CVs, or a folder you exported from cv-tailor.
          </p>
          <div className="flex items-center justify-end">
            <Button variant="outline" onClick={reset}>
              Try another folder
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
