import { describe, it, expect } from 'vitest'
import { resumeFilename } from './filename'

describe('resumeFilename', () => {
  it('builds name + role + ext', () => {
    expect(resumeFilename('Jane Doe', 'Operations Manager', 'pdf')).toBe(
      'Jane_Doe_Resume_Operations_Manager.pdf',
    )
  })

  it('omits role when empty', () => {
    expect(resumeFilename('Jane Doe', '', 'pdf')).toBe('Jane_Doe_Resume.pdf')
    expect(resumeFilename('Jane Doe', '   ', 'docx')).toBe('Jane_Doe_Resume.docx')
  })

  it('sanitizes messy characters', () => {
    expect(resumeFilename('Jane  Doe!', 'Acme — Ops (Sr.)', 'docx')).toBe(
      'Jane_Doe_Resume_Acme_Ops_Sr.docx',
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
