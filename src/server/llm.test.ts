import { describe, it, expect, vi, afterEach } from 'vitest'
import { callLLM } from './llm'

afterEach(() => vi.restoreAllMocks())

describe('callLLM', () => {
  it('posts to {baseUrl}/chat/completions and returns message content', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '{"hello":1}' } }] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const out = await callLLM(
      [{ role: 'user', content: 'hi' }],
      { baseUrl: 'https://api.deepseek.com', apiKey: 'k', model: 'deepseek-chat' },
    )

    expect(out).toBe('{"hello":1}')
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.deepseek.com/chat/completions')
    expect((opts as any).headers.Authorization).toBe('Bearer k')
    expect(JSON.parse((opts as any).body).model).toBe('deepseek-chat')
  })

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, text: async () => 'rate limited' }))
    await expect(
      callLLM([{ role: 'user', content: 'hi' }], { baseUrl: 'https://x', apiKey: 'k', model: 'm' }),
    ).rejects.toThrow(/429/)
  })
})
