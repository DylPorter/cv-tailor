import type { MasterProfile, SavedCV, CVJson, FitReport } from '../types'

const MASTER_KEY = 'cv-tailor:master'
const SAVED_KEY = 'cv-tailor:saved'
const PREFS_KEY = 'cv-tailor:prefs'

// Wrap every write so a full localStorage surfaces a friendly, catchable error
// instead of a raw QuotaExceededError. Callers show err.message in their UI.
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
      throw new Error('Browser storage is full. Delete some saved CVs and try again.')
    }
    throw e
  }
}

export function getMaster(): MasterProfile | null {
  const raw = localStorage.getItem(MASTER_KEY)
  return raw ? (JSON.parse(raw) as MasterProfile) : null
}

export function setMaster(text: string): MasterProfile {
  const profile: MasterProfile = { text, updatedAt: new Date().toISOString() }
  safeSetItem(MASTER_KEY, JSON.stringify(profile))
  return profile
}

export function listSaved(): SavedCV[] {
  const raw = localStorage.getItem(SAVED_KEY)
  return raw ? (JSON.parse(raw) as SavedCV[]) : []
}

function writeSaved(items: SavedCV[]): void {
  safeSetItem(SAVED_KEY, JSON.stringify(items))
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
  safeSetItem(PREFS_KEY, text)
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
  let parsed: BackupShape
  try {
    parsed = JSON.parse(json) as BackupShape
  } catch {
    throw new Error('That file is not a valid cv-tailor backup.')
  }
  if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.saved)) {
    throw new Error('That file is not a valid cv-tailor backup.')
  }
  if (parsed.master) safeSetItem(MASTER_KEY, JSON.stringify(parsed.master))
  writeSaved(parsed.saved)
  if (typeof parsed.prefs === 'string') safeSetItem(PREFS_KEY, parsed.prefs)
}
