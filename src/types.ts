// src/types.ts
export interface CVContact {
  email?: string
  phone?: string
  location?: string
  links?: string[]
}

export interface CVExperience {
  title: string
  org: string
  dates: string
  bullets: string[]
}

export interface CVEducation {
  credential: string
  institution: string
  dates: string
}

export interface CVExtra {
  heading: string
  items: string[]
}

export interface CVJson {
  name: string
  contact: CVContact
  summary: string
  experience: CVExperience[]
  education: CVEducation[]
  skills: string[]
  extras?: CVExtra[]
}

export interface FitRequirement {
  requirement: string
  covered: boolean
  evidence?: string
}

export interface FitReport {
  requirements: FitRequirement[]
  gaps: string[]
  keywordsMirrored: string[]
}

export interface TailorResponse {
  cv: CVJson
  fitReport: FitReport
  note?: string
}

export interface MasterProfile {
  text: string
  updatedAt: string
}

export interface SavedCV {
  id: string
  label: string
  field?: string
  jd: string
  cv: CVJson
  fitReport: FitReport
  createdAt: string
  revisionOf?: string
}
