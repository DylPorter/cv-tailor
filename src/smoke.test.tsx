import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

// Smoke test: verifies the Vitest + jsdom + Testing Library + jest-dom
// toolchain is wired up correctly. Replace with real tests as features land.
test('test harness renders and jest-dom matchers work', () => {
  render(<h1>cv-tailor</h1>)
  expect(screen.getByRole('heading', { name: 'cv-tailor' })).toBeInTheDocument()
})
