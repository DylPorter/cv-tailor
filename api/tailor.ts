import { tailor, type TailorInput } from '../src/server/tailor-core'
import { callLLM } from '../src/server/llm'

export const config = { runtime: 'nodejs' }

// PRIVACY GUARD: the request body contains the user's master profile (full CV),
// the job description, and the tailored CV/fit report the model returns — all
// sensitive PII. Vercel captures function logs, so this handler must NEVER log
// `body`/`req.body`/`master`/`jd` or any result data. Log only non-sensitive
// facts (HTTP status, result.ok, static strings) if logging is ever added.
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
  let body: TailorInput
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    res.status(400).json({ error: 'Invalid request body.' })
    return
  }
  const result = await tailor(body, {
    callLLM,
    config: { baseUrl: LLM_BASE_URL, apiKey: LLM_API_KEY, model: LLM_MODEL },
    password: APP_PASSWORD,
  })
  if (result.ok) res.status(200).json(result.data)
  else res.status(result.status).json({ error: result.error })
}
