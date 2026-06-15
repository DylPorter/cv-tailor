import { z } from 'zod'
import type { TailorResponse } from './types'

const cvSchema = z.object({
  name: z.string().min(1),
  contact: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    links: z.array(z.string()).optional(),
  }),
  summary: z.string(),
  experience: z.array(
    z.object({
      title: z.string(),
      org: z.string(),
      dates: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      credential: z.string(),
      institution: z.string(),
      dates: z.string(),
    }),
  ),
  skills: z.array(z.string()),
  extras: z
    .array(z.object({ heading: z.string(), items: z.array(z.string()) }))
    .optional(),
})

const fitReportSchema = z.object({
  requirements: z.array(
    z.object({
      requirement: z.string(),
      covered: z.boolean(),
      evidence: z.string().optional(),
    }),
  ),
  gaps: z.array(z.string()),
  keywordsMirrored: z.array(z.string()),
})

const tailorResponseSchema = z.object({
  cv: cvSchema,
  fitReport: fitReportSchema,
  note: z.string().optional(),
  targetRole: z.string().optional(),
})

export type ValidationResult =
  | { ok: true; data: TailorResponse }
  | { ok: false; error: string }

export function validateTailorResponse(input: unknown): ValidationResult {
  const parsed = tailorResponseSchema.safeParse(input)
  if (parsed.success) return { ok: true, data: parsed.data as TailorResponse }
  return { ok: false, error: parsed.error.message }
}
