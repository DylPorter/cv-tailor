import { useState } from 'react'

export function PasswordGate({ onUnlock }: { onUnlock: (password: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        className="bg-white p-8 rounded-xl shadow w-80 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (value) onUnlock(value)
        }}
      >
        <h1 className="text-lg font-semibold">cv-tailor</h1>
        <label className="block text-sm">
          Password
          <input
            type="password"
            className="mt-1 w-full border rounded px-3 py-2"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button type="submit" className="w-full bg-slate-900 text-white rounded py-2">
          Unlock
        </button>
      </form>
    </div>
  )
}
