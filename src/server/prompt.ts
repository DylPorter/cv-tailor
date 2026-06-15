import type { CVJson } from '../types'

export interface ChatMessage {
  role: 'system' | 'user'
  content: string
}

export interface BuildArgs {
  master: string
  jd: string
  priorCv?: CVJson
  refineInstruction?: string
}

const SYSTEM = `You are an expert CV editor. You tailor an existing career history to a specific job.

HARD RULES:
- This is a PRESENTATION tool. NEVER invent experience, employers, dates, qualifications, or skills. Only select, reorder, and reword content that is present in the candidate's master history.
- Reframe job titles and descriptions so they are legible to the target audience (the hiring side), without changing the underlying facts.
- Mirror the job description's key terminology for ATS, but ONLY where the master history genuinely supports it.
- Be ruthless about relevance and length: the result must fit on 1-2 pages.
- Output STRICT JSON only, matching exactly this shape:
{
  "cv": {
    "name": string,
    "contact": { "email"?: string, "phone"?: string, "location"?: string, "links"?: string[] },
    "summary": string,
    "experience": [{ "title": string, "org": string, "dates": string, "bullets": string[] }],
    "education": [{ "credential": string, "institution": string, "dates": string }],
    "skills": string[],
    "extras"?: [{ "heading": string, "items": string[] }]
  },
  "fitReport": {
    "requirements": [{ "requirement": string, "covered": boolean, "evidence"?: string }],
    "gaps": string[],
    "keywordsMirrored": string[]
  }
}
Do not include any prose, markdown, or code fences outside the JSON object.`

export function buildMessages(args: BuildArgs): ChatMessage[] {
  const parts = [
    `MASTER CAREER HISTORY:\n${args.master}`,
    `\n\nTARGET JOB DESCRIPTION:\n${args.jd}`,
  ]
  if (args.priorCv) {
    parts.push(`\n\nPREVIOUS TAILORED CV (refine this):\n${JSON.stringify(args.priorCv)}`)
  }
  if (args.refineInstruction) {
    parts.push(`\n\nREFINEMENT INSTRUCTION: ${args.refineInstruction}`)
  }
  return [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: parts.join('') },
  ]
}
