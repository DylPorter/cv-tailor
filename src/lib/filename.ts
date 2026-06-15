export function resumeFilename(name: string, role: string, ext: 'pdf' | 'docx'): string {
  const clean = (s: string) => s.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  const who = clean(name) || 'CV'
  const what = clean(role)
  return what ? `${who}_Resume_${what}.${ext}` : `${who}_Resume.${ext}`
}
