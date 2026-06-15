import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { CVPreview } from '../components/CVPreview'
import { FitReportView } from '../components/FitReportView'
import { listSaved, deleteSaved } from '../store/storage'
import { triggerDownload } from '../lib/download'
import { resumeFilename } from '../lib/filename'
import { renderPdf } from '../render/pdf'
import { renderDocx } from '../render/docx'
import type { SavedCV } from '../types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const } },
}

export function SavedPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<SavedCV[]>(() => listSaved())
  const [opened, setOpened] = useState<SavedCV | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  function remove(id: string) {
    deleteSaved(id)
    setItems(listSaved())
    setOpened((cur) => (cur?.id === id ? null : cur))
    setConfirmingId(null)
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center pt-6">
        <Card className="p-12">
          <h1 className="font-display text-3xl text-ink mb-3">Nothing saved yet</h1>
          <p className="text-ink-soft mb-8 leading-relaxed">
            Tailor your first CV and it&apos;ll land here, ready to download whenever
            you need it.
          </p>
          <Button size="lg" onClick={() => navigate('/generate')}>
            Tailor your first CV &rarr;
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-4xl text-ink leading-tight">Saved CVs</h1>
        <p className="text-ink-soft mt-2">
          {items.length} tailored {items.length === 1 ? 'CV' : 'CVs'}, kept on this device.
        </p>
      </header>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {items.map((cv) => (
          <motion.div key={cv.id} variants={item}>
            <Card className="p-6 h-full flex flex-col">
              <div className="flex-1">
                <h2 className="font-display text-xl text-ink leading-snug mb-1 line-clamp-2">
                  {cv.label}
                </h2>
                <p className="text-sm text-ink-faint">{formatDate(cv.createdAt)}</p>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Button onClick={() => setOpened(cv)}>Open</Button>
                <Button
                  variant="outline"
                  onClick={async () =>
                    triggerDownload(await renderPdf(cv.cv), resumeFilename(cv.cv.name, cv.label, 'pdf'))
                  }
                >
                  PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={async () =>
                    triggerDownload(await renderDocx(cv.cv), resumeFilename(cv.cv.name, cv.label, 'docx'))
                  }
                >
                  .docx
                </Button>
                {confirmingId === cv.id ? (
                  <span className="ml-auto inline-flex items-center gap-2">
                    <span className="text-sm text-ink-soft">Delete?</span>
                    <Button
                      variant="ghost"
                      className="text-clay hover:text-clay-deep"
                      onClick={() => remove(cv.id)}
                    >
                      Yes
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmingId(null)}>
                      Cancel
                    </Button>
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    className="text-clay hover:text-clay-deep ml-auto"
                    onClick={() => setConfirmingId(cv.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Modal open={!!opened} onClose={() => setOpened(null)} title={opened?.label}>
        {opened && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={async () =>
                  triggerDownload(await renderPdf(opened.cv), resumeFilename(opened.cv.name, opened.label, 'pdf'))
                }
              >
                Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={async () =>
                  triggerDownload(await renderDocx(opened.cv), resumeFilename(opened.cv.name, opened.label, 'docx'))
                }
              >
                Download .docx
              </Button>
            </div>
            <div className="rounded-xl border border-line bg-paper p-5">
              <FitReportView report={opened.fitReport} />
            </div>
            <CVPreview cv={opened.cv} />
          </div>
        )}
      </Modal>
    </div>
  )
}
