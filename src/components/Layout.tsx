import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { ExportModal } from './ExportModal'
import { LoadModal } from './LoadModal'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/generate', label: 'Tailor', end: false },
  { to: '/saved', label: 'Saved', end: false },
]

export function Layout({ onLock, children }: { onLock: () => void; children: ReactNode }) {
  const location = useLocation()
  const [exportOpen, setExportOpen] = useState(false)
  const [loadOpen, setLoadOpen] = useState(false)

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
              <Button
                variant="ghost"
                size="md"
                className="px-3 py-2"
                onClick={() => setExportOpen(true)}
              >
                Export
              </Button>
              <Button
                variant="ghost"
                size="md"
                className="px-3 py-2"
                onClick={() => setLoadOpen(true)}
              >
                Load
              </Button>
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

        <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
        <LoadModal open={loadOpen} onClose={() => setLoadOpen(false)} />

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
