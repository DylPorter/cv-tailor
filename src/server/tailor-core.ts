import { buildMessages, type ChatMessage } from './prompt'
import type { LLMConfig } from './llm'
import { validateTailorResponse } from '../schema'
import type { CVJson, TailorResponse } from '../types'

export interface TailorInput {
  password: string
  master: string
  jd: string
  priorCv?: CVJson
  refineInstruction?: string
}

export interface TailorDeps {
  callLLM: (messages: ChatMessage[], cfg: LLMConfig) => Promise<string>
  config: LLMConfig
  password: string
}

export type TailorResult =
  | { ok: true; data: TailorResponse }
  | { ok: false; status: number; error: string }

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function parseJson(raw: string): unknown | null {
  try {
    return JSON.parse(raw)
  } catch {
    const stripped = raw.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
    try {
      return JSON.parse(stripped)
    } catch {
      return null
    }
  }
}

export async function tailor(input: TailorInput, deps: TailorDeps): Promise<TailorResult> {
  if (!constantTimeEqual(input.password ?? '', deps.password)) {
    return { ok: false, status: 401, error: 'Incorrect password.' }
  }
  if (!input.master?.trim() || !input.jd?.trim()) {
    return { ok: false, status: 400, error: 'Master profile and job description are required.' }
  }

  const messages = buildMessages({
    master: input.master,
    jd: input.jd,
    priorCv: input.priorCv,
    refineInstruction: input.refineInstruction,
  })

  for (let attempt = 0; attempt < 2; attempt++) {
    let raw: string
    try {
      raw = await deps.callLLM(messages, deps.config)
    } catch (e) {
      return { ok: false, status: 502, error: `Model call failed: ${(e as Error).message}` }
    }
    const parsed = parseJson(raw)
    if (parsed) {
      const validated = validateTailorResponse(parsed)
      if (validated.ok) return { ok: true, data: validated.data }
    }
    if (attempt === 0) {
      messages.push({ role: 'user', content: 'Your previous reply was not valid JSON matching the schema. Reply with ONLY the JSON object.' })
    }
  }
  return { ok: false, status: 502, error: 'The model did not return a valid CV. Please try again.' }
}
