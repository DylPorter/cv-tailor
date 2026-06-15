import type { ChatMessage } from './prompt'

export interface LLMConfig {
  baseUrl: string
  apiKey: string
  model: string
}

export interface CallOptions {
  /** Force structured JSON output. Default true (the tailor path); merge passes false for prose. */
  json?: boolean
}

export async function callLLM(
  messages: ChatMessage[],
  cfg: LLMConfig,
  opts: CallOptions = {},
): Promise<string> {
  const { json = true } = opts
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: 0.3,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`LLM error ${res.status}: ${detail.slice(0, 300)}`)
  }
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string') throw new Error('LLM returned no message content')
  return content
}
