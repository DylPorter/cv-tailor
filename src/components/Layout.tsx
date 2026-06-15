import { useRef, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { exportData, importData } from '../store/storage'
import { triggerDownload } from '../lib/download'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/generate', label: 'Tailor', end: false },
  { to: '/saved', label: 'Saved', end: false },
]

export function Layout({ onLock, children }: { onLock: () => void; children: ReactNode }) {
  const location = useLocation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [restoreError, setRestoreError] = useState('')

  function backup() {
    triggerDownload(
      new Blob([exportData()], { type: 'application/json' }),
      'cv-tailor-backup.json',
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
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="grain min-h-screen bg-paper">
      <div className="relative z-10">
        <header className="border-b border-line/70 bg-paper/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <NavLink to="/" className="flex items-center gap-2 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-clay" aria-hidden />
              <span className="font-display text-xl text-ink tracking-tight">cv&#8202;-&#8202;tailor</span>
            </NavLink>

            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive ? 'text-ink' : 'text-ink-faint hover:text-ink-soft'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-clay"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button variant="ghost" size="md" className="px-3 py-2" onClick={backup}>
                Back up
              </Button>
              <Button
                variant="ghost"
                size="md"
                className="px-3 py-2"
                onClick={() => fileRef.current?.click()}
              >
                Restore
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={onRestore}
              />
              <Button variant="outline" size="md" className="px-3 py-2" onClick={onLock}>
                Lock
              </Button>
            </div>
          </div>

          {/* mobile nav */}
          <nav className="sm:hidden flex items-center gap-1 px-6 pb-3 -mt-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? 'text-ink bg-paper-deep' : 'text-ink-faint'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        {restoreError && (
          <div className="max-w-5xl mx-auto px-6 pt-4">
            <p className="rounded-lg border border-clay/30 bg-clay-soft/40 px-4 py-2.5 text-sm text-clay-deep">
              {restoreError}
            </p>
          </div>
        )}

        <main className="max-w-5xl mx-auto px-6 py-10 sm:py-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
