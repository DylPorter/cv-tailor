import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
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
        <Routes>
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
