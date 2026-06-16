import { mergeProfiles, type MergeInput } from '../src/server/merge-core.js'
import { callLLM } from '../src/server/llm.js'

// maxDuration: merging several CVs into one master profile is a large LLM call
// that can exceed Vercel's 10s default (ERR_CONNECTION_CLOSED). 60s = Hobby ceiling.
export const config = { runtime: 'nodejs', maxDuration: 60 }

// PRIVACY GUARD: the body contains the user's CVs (full PII). Never log
// body/cvs/result. Vercel captures function logs.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const { LLM_BASE_URL, LLM_API_KEY, LLM_MODEL, APP_PASSWORD } = process.env
  if (!LLM_BASE_URL || !LLM_API_KEY || !LLM_MODEL || !APP_PASSWORD) {
    res.status(500).json({ error: 'Server is not configured.' })
    return
  }
  let body: MergeInput
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    res.status(400).json({ error: 'Invalid request body.' })
    return
  }
  const result = await mergeProfiles(body, {
    callLLM,
    config: { baseUrl: LLM_BASE_URL, apiKey: LLM_API_KEY, model: LLM_MODEL },
    password: APP_PASSWORD,
  })
  if (result.ok) res.status(200).json({ profile: result.profile })
  else res.status(result.status).json({ error: result.error })
}
