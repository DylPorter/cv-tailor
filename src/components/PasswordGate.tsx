import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

export function PasswordGate({ onUnlock }: { onUnlock: (password: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <div className="grain min-h-screen bg-paper flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="p-9 sm:p-11">
          <div className="flex items-center gap-2 mb-7">
            <span className="h-2.5 w-2.5 rounded-full bg-clay" aria-hidden />
            <span className="font-display text-2xl text-ink tracking-tight">cv&#8202;-&#8202;tailor</span>
          </div>

          <h1 className="font-display text-3xl leading-tight text-ink mb-2">
            A private CV workshop.
          </h1>
          <p className="text-ink-soft mb-8 leading-relaxed">
            Enter your password to step inside.
          </p>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              if (value) onUnlock(value)
            }}
          >
            <label className="block">
              <span className="block text-sm font-medium text-ink-soft mb-2">Password</span>
              <input
                type="password"
                autoFocus
                className="w-full rounded-xl border border-line bg-paper px-4 py-3.5 text-lg text-ink placeholder:text-ink-faint focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/25 transition"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </label>
            <Button type="submit" size="lg" className="w-full">
              Unlock
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
