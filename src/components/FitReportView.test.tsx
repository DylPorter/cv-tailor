import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FitReportView } from './FitReportView'
import { SAMPLE_FIT } from '../sample'

describe('FitReportView', () => {
  it('renders covered requirements and gaps', () => {
    render(<FitReportView report={SAMPLE_FIT} />)
    expect(screen.getByText(/Operations leadership/)).toBeInTheDocument()
    expect(screen.getByText(/No explicit data-analysis/)).toBeInTheDocument()
  })
})
