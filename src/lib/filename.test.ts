import { describe, it, expect } from 'vitest'
import { resumeFilename } from './filename'

describe('resumeFilename', () => {
  it('builds name + role + ext', () => {
    expect(resumeFilename('Taliesin Porter', 'Operations Manager', 'pdf')).toBe(
      'Taliesin_Porter_Resume_Operations_Manager.pdf',
    )
  })

  it('omits role when empty', () => {
    expect(resumeFilename('Taliesin Porter', '', 'pdf')).toBe('Taliesin_Porter_Resume.pdf')
    expect(resumeFilename('Taliesin Porter', '   ', 'docx')).toBe('Taliesin_Porter_Resume.docx')
  })

  it('sanitizes messy characters', () => {
    expect(resumeFilename('Taliesin  Porter!', 'Acme — Ops (Sr.)', 'docx')).toBe(
      'Taliesin_Porter_Resume_Acme_Ops_Sr.docx',
    )
  })

  it('keeps hyphens, collapses underscores, trims edges', () => {
    expect(resumeFilename('  Jean-Luc  ', 'Full-Stack / AI', 'pdf')).toBe(
      'Jean-Luc_Resume_Full-Stack_AI.pdf',
    )
  })

  it('falls back to CV when name sanitizes to empty', () => {
    expect(resumeFilename('!!!', 'Ops', 'pdf')).toBe('CV_Resume_Ops.pdf')
    expect(resumeFilename('', '', 'docx')).toBe('CV_Resume.docx')
  })
})
