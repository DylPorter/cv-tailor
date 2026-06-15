import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { PasswordGate } from './components/PasswordGate'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { SavedPage } from './pages/SavedPage'
import { PasswordContext } from './auth'
import { getMaster, setMaster } from './store/storage'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

function OnboardingPlaceholder() {
  const navigate = useNavigate()
  return (
    <div className="max-w-xl mx-auto text-center">
      <Card className="p-10">
        <h1 className="font-display text-3xl text-ink mb-3">Onboarding wizard</h1>
        <p className="text-ink-soft mb-8 leading-relaxed">
          The guided setup that builds your universal CV lands in pass 2. For now,
          drop in a placeholder profile so you can explore the workshop.
        </p>
        <Button
          size="lg"
          onClick={() => {
            setMaster('(placeholder)')
            navigate('/')
          }}
        >
          Use a placeholder profile
        </Button>
      </Card>
    </div>
  )
}

function GeneratePlaceholder() {
  return (
    <div className="max-w-xl mx-auto text-center">
      <Card className="p-10">
        <h1 className="font-display text-3xl text-ink mb-3">Tailor a CV</h1>
        <p className="text-ink-soft leading-relaxed">
          The generate flow — paste a job, get a tailored CV and a fit report —
          arrives in pass 2.
        </p>
      </Card>
    </div>
  )
}

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
          <Route path="/onboarding" element={<OnboardingPlaceholder />} />
          <Route path="/generate" element={<GeneratePlaceholder />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </PasswordContext.Provider>
  )
}
