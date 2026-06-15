// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { createServer as createViteServer, type ViteDevServer } from 'vite'
import { devApiPlugin } from './vite-plugin-dev-api'

// The dev API plugin makes `npm run dev` serve the Vercel-style functions in
// api/*.ts under /api/* — so the app runs locally without the Vercel CLI.
// These tests boot a real Vite dev server with only the plugin and hit it over
// HTTP, exercising routing, the req/res shim, and body delivery. None of them
// need a real LLM call: the handlers check method and env before touching the
// model, and an invalid body short-circuits to a 400.

let vite: ViteDevServer
let server: http.Server
let base: string

beforeAll(async () => {
  // Deterministic env so the handler gets past its "is the server configured?"
  // guard and into body parsing, without depending on a real .env.local.
  process.env.LLM_BASE_URL = 'https://example.test'
  process.env.LLM_API_KEY = 'test-key'
  process.env.LLM_MODEL = 'test-model'
  process.env.APP_PASSWORD = 'test-pass'

  vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
    plugins: [devApiPlugin()],
  })
  server = http.createServer(vite.middlewares)
  await new Promise<void>((resolve) => server.listen(0, resolve))
  const { port } = server.address() as AddressInfo
  base = `http://127.0.0.1:${port}`
})

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()))
  await vite.close()
})

describe('devApiPlugin', () => {
  test('routes GET /api/tailor to the handler, which rejects non-POST with 405', async () => {
    const res = await fetch(`${base}/api/tailor`)
    expect(res.status).toBe(405)
    expect(await res.json()).toEqual({ error: 'Method not allowed' })
  })

  test('delivers the POST body to the handler (invalid JSON -> 400 from the handler)', async () => {
    const res = await fetch(`${base}/api/merge`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json{',
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid request body.' })
  })

  test('returns 404 for an /api/* path with no matching function file', async () => {
    const res = await fetch(`${base}/api/does-not-exist`, { method: 'POST' })
    expect(res.status).toBe(404)
  })
})
