import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FitReportView } from './FitReportView'
import { SAMPLE_FIT } from '../sample'

describe('FitReportView', () => {
  it('is collapsed by default, expands to show requirements and gaps', () => {
    render(<FitReportView report={SAMPLE_FIT} />)
    // collapsed: body content not shown
    expect(screen.queryByText(/Operations leadership/)).not.toBeInTheDocument()
    // the toggle header is always present
    fireEvent.click(screen.getByRole('button', { name: /fit report/i }))
    expect(screen.getByText(/Operations leadership/)).toBeInTheDocument()
    expect(screen.getByText(/No explicit data-analysis/)).toBeInTheDocument()
  })
})
