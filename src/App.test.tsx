import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

beforeEach(() => { localStorage.clear(); sessionStorage.clear() })

describe('App', () => {
  it('shows the password gate when locked', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /unlock/i })).toBeInTheDocument()
  })
})
