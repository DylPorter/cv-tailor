import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MasterProfileEditor } from './MasterProfileEditor'

beforeEach(() => localStorage.clear())

describe('MasterProfileEditor', () => {
  it('saves pasted text and notifies parent', () => {
    const onSaved = vi.fn()
    render(<MasterProfileEditor onSaved={onSaved} />)
    fireEvent.change(screen.getByPlaceholderText(/full CV/i), { target: { value: 'my full history' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onSaved).toHaveBeenCalledWith('my full history')
  })

  it('persists preferences on save', () => {
    render(<MasterProfileEditor onSaved={() => {}} />)
    fireEvent.change(screen.getByPlaceholderText(/full CV/i), { target: { value: 'history' } })
    fireEvent.change(screen.getByPlaceholderText(/UK English/i), { target: { value: 'Concise bullets' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(localStorage.getItem('cv-tailor:prefs')).toBe('Concise bullets')
  })
})
