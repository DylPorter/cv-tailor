import type { MasterProfile, SavedCV, CVJson, FitReport } from '../types'

const MASTER_KEY = 'cv-tailor:master'
const SAVED_KEY = 'cv-tailor:saved'

export function getMaster(): MasterProfile | null {
  const raw = localStorage.getItem(MASTER_KEY)
  return raw ? (JSON.parse(raw) as MasterProfile) : null
}

export function setMaster(text: string): MasterProfile {
  const profile: MasterProfile = { text, updatedAt: new Date().toISOString() }
  localStorage.setItem(MASTER_KEY, JSON.stringify(profile))
  return profile
}

export function listSaved(): SavedCV[] {
  const raw = localStorage.getItem(SAVED_KEY)
  return raw ? (JSON.parse(raw) as SavedCV[]) : []
}

function writeSaved(items: SavedCV[]): void {
  localStorage.setItem(SAVED_KEY, JSON.stringify(items))
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function saveCV(input: {
  label: string
  jd: string
  cv: CVJson
  fitReport: FitReport
  revisionOf?: string
}): SavedCV {
  const item: SavedCV = { id: newId(), createdAt: new Date().toISOString(), ...input }
  writeSaved([item, ...listSaved()])
  return item
}

export function deleteSaved(id: string): void {
  writeSaved(listSaved().filter((s) => s.id !== id))
}
