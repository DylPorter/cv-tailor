import type { CVJson, TailorResponse } from '../types'

export interface TailorRequest {
  password: string
  master: string
  jd: string
  priorCv?: CVJson
  refineInstruction?: string
}

export async function requestTailor(req: TailorRequest): Promise<TailorResponse> {
  const res = await fetch('/api/tailor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return (await res.json()) as TailorResponse
}
