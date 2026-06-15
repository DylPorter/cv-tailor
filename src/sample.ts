import type { CVJson, FitReport } from './types'

export const SAMPLE_CV: CVJson = {
  name: 'Alan Porter',
  contact: {
    email: 'alan.porter@example.com',
    phone: '+852 5555 1234',
    location: 'Hong Kong SAR',
    links: ['linkedin.com/in/alanporter'],
  },
  summary:
    'Operations leader with 20+ years running cross-border programmes in education and the arts. Turns ambiguous mandates into staffed, budgeted, delivered outcomes.',
  experience: [
    {
      title: 'Director of Operations',
      org: 'British Council',
      dates: '2006 – 2026',
      bullets: [
        'Ran a HK$40M annual programme portfolio across 6 country offices.',
        'Cut event delivery costs 18% by consolidating vendor contracts.',
        'Built and led a 25-person operations team.',
      ],
    },
    {
      title: 'Programme Manager',
      org: 'Arts Council',
      dates: '2001 – 2006',
      bullets: ['Delivered 40+ public events annually on time and on budget.'],
    },
  ],
  education: [
    { credential: 'MA, Arts Administration', institution: 'University of London', dates: '1999 – 2000' },
    { credential: 'BA (Hons), History', institution: 'University of Bristol', dates: '1996 – 1999' },
  ],
  skills: ['Programme management', 'Budgeting', 'Vendor negotiation', 'Stakeholder management', 'Team leadership'],
  extras: [{ heading: 'Languages', items: ['English (native)', 'Cantonese (conversational)'] }],
}

export const SAMPLE_FIT: FitReport = {
  requirements: [
    { requirement: 'Operations leadership', covered: true, evidence: '20y at British Council' },
    { requirement: 'Budget ownership >HK$10M', covered: true, evidence: 'HK$40M portfolio' },
    { requirement: 'SQL / data analysis', covered: false },
  ],
  gaps: ['No explicit data-analysis tooling experience listed.'],
  keywordsMirrored: ['operations', 'budgeting', 'stakeholder management', 'team leadership'],
}
