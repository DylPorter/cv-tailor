import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { PasswordGate } from './components/PasswordGate'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { SavedPage } from './pages/SavedPage'
import { Onboarding } from './pages/Onboarding'
import { Generate } from './pages/Generate'
import { PasswordContext } from './auth'
import { getMaster } from './store/storage'

export default function App() {
  const [password, setPassword] = useState<string>(
    () => sessionStorage.getItem('cv-tailor:pw') ?? '',
  )

  // Frozen per-render location so AnimatePresence's exiting page keeps its old
  // route content during the transition (otherwise the new page flashes in,
  // then animates). The exit copy retains this render's <Routes location>.
  const location = useLocation()

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

  return (
    <PasswordContext.Provider value={password}>
      <Layout
        onLock={() => {
          sessionStorage.removeItem('cv-tailor:pw')
          setPassword('')
        }}
      >
        <Routes location={location}>
          <Route
            path="/"
            element={getMaster() ? <Dashboard /> : <Navigate to="/onboarding" replace />}
          />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </PasswordContext.Provider>
  )
}
