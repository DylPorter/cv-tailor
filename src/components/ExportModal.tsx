import { useMemo, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { buildExportZip, exportSummary } from '../lib/zipExport'
import { triggerDownload } from '../lib/download'

export function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')

  // Recompute the preview each time the modal opens.
  const summary = useMemo(() => (open ? exportSummary() : { count: 0, fields: [] }), [open])

  async function doExport() {
    setWorking(true)
    setError('')
    try {
      const blob = await buildExportZip()
      triggerDownload(blob, 'cv-tailor-export.zip')
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setWorking(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Export your CVs">
      <p className="text-ink-soft leading-relaxed mb-6">
        Export your universal profile and your{' '}
        <span className="text-ink font-medium">
          {summary.count} saved {summary.count === 1 ? 'CV' : 'CVs'}
        </span>{' '}
        as a single folder you can keep or move to another device.
      </p>

      <div className="rounded-xl border border-line bg-paper p-5 mb-6">
        <p className="text-xs font-medium tracking-wide uppercase text-ink-faint mb-3">
          What&apos;s inside
        </p>
        <ul className="space-y-1.5 text-[13px] leading-relaxed text-ink-soft">
          <li>• Your tailored CVs as PDF + Word, sorted by field</li>
          <li>• Your master profile</li>
          <li>• A backup file to reload everything later</li>
        </ul>
      </div>

      {error && (
        <p className="mb-5 rounded-lg border border-clay/30 bg-clay-soft/40 px-4 py-2.5 text-sm text-clay-deep">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={working}>
          Cancel
        </Button>
        <Button onClick={() => void doExport()} disabled={working}>
          {working ? 'Packing your folder…' : 'Export'}
        </Button>
      </div>
    </Modal>
  )
}
