import { describe, it, expect, beforeEach } from 'vitest'
import { getMaster, setMaster, listSaved, saveCV, deleteSaved } from './storage'
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
})
