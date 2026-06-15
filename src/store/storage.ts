import type { MasterProfile, SavedCV, CVJson, FitReport } from '../types'

const MASTER_KEY = 'cv-tailor:master'
const SAVED_KEY = 'cv-tailor:saved'
const PREFS_KEY = 'cv-tailor:prefs'

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

export function getPrefs(): string {
  return localStorage.getItem(PREFS_KEY) ?? ''
}

export function setPrefs(text: string): void {
  localStorage.setItem(PREFS_KEY, text)
}

interface BackupShape {
  version: 1
  master: MasterProfile | null
  saved: SavedCV[]
  prefs?: string
}

export function exportData(): string {
  const backup: BackupShape = { version: 1, master: getMaster(), saved: listSaved(), prefs: getPrefs() }
  return JSON.stringify(backup, null, 2)
}

export function importData(json: string): void {
  const parsed = JSON.parse(json) as BackupShape
  if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.saved)) {
    throw new Error('That file is not a valid cv-tailor backup.')
  }
  if (parsed.master) localStorage.setItem(MASTER_KEY, JSON.stringify(parsed.master))
  writeSaved(parsed.saved)
  if (typeof parsed.prefs === 'string') localStorage.setItem(PREFS_KEY, parsed.prefs)
}
