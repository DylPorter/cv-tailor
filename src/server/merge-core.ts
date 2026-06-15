import type { ChatMessage } from './prompt'
import type { LLMConfig, CallOptions } from './llm'

const MERGE_SYSTEM = `You are a career archivist. You are given one or more CVs/résumés belonging to the SAME person — often different versions tuned for different fields. Merge them into ONE comprehensive master profile that captures the full superset of their real experience.

RULES:
- NEVER invent anything. Only consolidate what appears in the source documents.
- Deduplicate: the same job appearing in two CVs is ONE entry. Keep the richest description.
- Preserve every distinct role, qualification, skill, and achievement across all versions, even if it only appeared in one.
- Keep it as plain, well-organised text (clear headings: contact, summary, experience with bullets, education, skills, anything else). This is an internal master record, not a finished CV — completeness matters more than brevity here.
- Resolve obvious conflicts (e.g. slightly different date formats) sensibly; if two versions genuinely disagree on a fact, keep both and note it.

Output the merged master profile as plain text. No preamble, no commentary.`

export interface MergeInput {
  password: string
  cvs: string[]
}

export interface MergeDeps {
  callLLM: (messages: ChatMessage[], cfg: LLMConfig, opts?: CallOptions) => Promise<string>
  config: LLMConfig
  password: string
}

export type MergeResult =
  | { ok: true; profile: string }
  | { ok: false; status: number; error: string }

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function mergeProfiles(input: MergeInput, deps: MergeDeps): Promise<MergeResult> {
  if (!constantTimeEqual(input.password ?? '', deps.password)) {
    return { ok: false, status: 401, error: 'Incorrect password.' }
  }
  const cvs = (input.cvs ?? []).map((c) => c?.trim()).filter(Boolean) as string[]
  if (cvs.length === 0) {
    return { ok: false, status: 400, error: 'At least one CV is required.' }
  }

  const docs = cvs.map((cv, i) => `=== SOURCE CV ${i + 1} ===\n${cv}`).join('\n\n')
  const messages: ChatMessage[] = [
    { role: 'system', content: MERGE_SYSTEM },
    { role: 'user', content: docs },
  ]

  try {
    const profile = await deps.callLLM(messages, deps.config, { json: false })
    if (!profile.trim()) {
      return { ok: false, status: 502, error: 'The model returned an empty profile. Please try again.' }
    }
    return { ok: true, profile: profile.trim() }
  } catch (e) {
    return { ok: false, status: 502, error: `Model call failed: ${(e as Error).message}` }
  }
}
