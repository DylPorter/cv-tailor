import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TailorPanel } from './TailorPanel'
import { SAMPLE_CV, SAMPLE_FIT } from '../sample'

vi.mock('../lib/api', async () => {
  const { SAMPLE_CV, SAMPLE_FIT } = await import('../sample')
  return {
    requestTailor: vi.fn().mockResolvedValue({ cv: SAMPLE_CV, fitReport: SAMPLE_FIT }),
  }
})

beforeEach(() => localStorage.clear())

describe('TailorPanel', () => {
  it('tailors a JD and shows the resulting CV name', async () => {
    render(<TailorPanel master="MASTER" password="p" />)
    fireEvent.change(screen.getByPlaceholderText(/job description/i), { target: { value: 'JD text' } })
    fireEvent.click(screen.getByRole('button', { name: /tailor/i }))
    await waitFor(() => expect(screen.getByText(SAMPLE_CV.name)).toBeInTheDocument())
  })
})
