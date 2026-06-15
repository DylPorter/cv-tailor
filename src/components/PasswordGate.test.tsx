import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PasswordGate } from './PasswordGate'

describe('PasswordGate', () => {
  it('calls onUnlock with the entered password', () => {
    const onUnlock = vi.fn()
    render(<PasswordGate onUnlock={onUnlock} />)
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
    expect(onUnlock).toHaveBeenCalledWith('secret')
  })
})
