import type { CVJson, FitReport } from './types'

// Entirely fictional sample data — invented person, organisations, and schools.
// No real names: don't reference real people, employers, or institutions here.
export const SAMPLE_CV: CVJson = {
  name: 'Jordan Avery',
  contact: {
    email: 'jordan.avery@example.com',
    phone: '+44 20 7946 0123',
    location: 'London, UK',
    links: ['linkedin.com/in/jordanavery'],
  },
  summary:
    'Operations leader with 20+ years running cross-border programmes in education and the arts. Turns ambiguous mandates into staffed, budgeted, delivered outcomes.',
  experience: [
    {
      title: 'Director of Operations',
      org: 'Meridian Cultural Trust',
      dates: '2006 – 2026',
      bullets: [
        'Ran a £40M annual programme portfolio across 6 country offices.',
        'Cut event delivery costs 18% by consolidating vendor contracts.',
        'Built and led a 25-person operations team.',
      ],
    },
    {
      title: 'Programme Manager',
      org: 'Harbourline Arts Foundation',
      dates: '2001 – 2006',
      bullets: ['Delivered 40+ public events annually on time and on budget.'],
    },
  ],
  education: [
    { credential: 'MA, Arts Administration', institution: 'Greenmoor University', dates: '1999 – 2000' },
    { credential: 'BA (Hons), History', institution: 'Ravensworth University', dates: '1996 – 1999' },
  ],
  skills: ['Programme management', 'Budgeting', 'Vendor negotiation', 'Stakeholder management', 'Team leadership'],
  extras: [{ heading: 'Languages', items: ['English (native)', 'French (conversational)'] }],
}

export const SAMPLE_FIT: FitReport = {
  requirements: [
    { requirement: 'Operations leadership', covered: true, evidence: '20y at Meridian Cultural Trust' },
    { requirement: 'Budget ownership >£10M', covered: true, evidence: '£40M portfolio' },
    { requirement: 'SQL / data analysis', covered: false },
  ],
  gaps: ['No explicit data-analysis tooling experience listed.'],
  keywordsMirrored: ['operations', 'budgeting', 'stakeholder management', 'team leadership'],
}
