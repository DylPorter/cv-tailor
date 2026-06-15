import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SavedFolder } from './SavedFolder'
import { saveCV } from '../store/storage'
import { SAMPLE_CV, SAMPLE_FIT } from '../sample'

beforeEach(() => localStorage.clear())

describe('SavedFolder', () => {
  it('lists saved CV labels', () => {
    saveCV({ label: 'Acme — Ops', jd: 'J', cv: SAMPLE_CV, fitReport: SAMPLE_FIT })
    render(<SavedFolder onOpen={() => {}} />)
    expect(screen.getByText('Acme — Ops')).toBeInTheDocument()
  })

  it('shows an empty state when nothing is saved', () => {
    render(<SavedFolder onOpen={() => {}} />)
    expect(screen.getByText(/no saved/i)).toBeInTheDocument()
  })
})
