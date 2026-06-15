import { useState } from 'react'
import type { SavedCV } from '../types'
import { listSaved, deleteSaved } from '../store/storage'

export function SavedFolder({ onOpen }: { onOpen: (item: SavedCV) => void }) {
  const [items, setItems] = useState<SavedCV[]>(listSaved())

  function remove(id: string) {
    deleteSaved(id)
    setItems(listSaved())
  }

  if (items.length === 0) {
    return <p className="text-slate-400 text-sm">No saved CVs yet.</p>
  }

  return (
    <ul className="divide-y border rounded">
      {items.map((it) => (
        <li key={it.id} className="flex items-center justify-between px-3 py-2 text-sm">
          <button className="text-left hover:underline" onClick={() => onOpen(it)}>
            {it.label}
            <span className="text-slate-400"> · {new Date(it.createdAt).toLocaleDateString()}</span>
          </button>
          <button className="text-red-500 text-xs" onClick={() => remove(it.id)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}
