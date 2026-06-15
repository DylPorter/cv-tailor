import { describe, it, expect, beforeEach } from 'vitest'
import { getMaster, setMaster, listSaved, saveCV, deleteSaved, exportData, importData, getPrefs, setPrefs } from './storage'
import { SAMPLE_CV, SAMPLE_FIT } from '../sample'

beforeEach(() => localStorage.clear())

describe('storage', () => {
  it('round-trips the master profile', () => {
    expect(getMaster()).toBeNull()
    setMaster('my full history')
    expect(getMaster()?.text).toBe('my full history')
    expect(getMaster()?.updatedAt).toBeTruthy()
  })

  it('saves, lists, and deletes tailored CVs', () => {
    expect(listSaved()).toEqual([])
    const saved = saveCV({ label: 'Acme — Ops', jd: 'JD text', cv: SAMPLE_CV, fitReport: SAMPLE_FIT })
    expect(saved.id).toBeTruthy()
    expect(listSaved()).toHaveLength(1)
    deleteSaved(saved.id)
    expect(listSaved()).toEqual([])
  })

  it('exports and re-imports all data', () => {
    setMaster('history')
    saveCV({ label: 'Acme', jd: 'J', cv: SAMPLE_CV, fitReport: SAMPLE_FIT })
    const json = exportData()
    localStorage.clear()
    expect(getMaster()).toBeNull()
    expect(listSaved()).toEqual([])
    importData(json)
    expect(getMaster()?.text).toBe('history')
    expect(listSaved()).toHaveLength(1)
  })

  it('throws on malformed import payload', () => {
    expect(() => importData('not json')).toThrow()
  })

  it('round-trips preferences and includes them in backup', () => {
    setPrefs('UK English, concise')
    expect(getPrefs()).toBe('UK English, concise')
    setMaster('h')
    const json = exportData()
    localStorage.clear()
    expect(getPrefs()).toBe('')
    importData(json)
    expect(getPrefs()).toBe('UK English, concise')
  })
})
