import type { IncomingMessage, ServerResponse } from 'node:http'
import { loadEnv, type Plugin } from 'vite'

// Dev-only Vite plugin that serves the Vercel-style functions in api/*.ts at
// /api/* during `npm run dev`, so the whole app runs locally without the Vercel
// CLI. In production Vercel runs these same files; here we just emulate enough
// of Vercel's (req, res) contract for the handlers to work unchanged.

const FUNCTION_ENV = ['LLM_BASE_URL', 'LLM_API_KEY', 'LLM_MODEL', 'APP_PASSWORD']

// Minimal stand-in for Vercel's response object: status() is chainable and
// json()/end() flush to the underlying Node response.
function makeRes(nodeRes: ServerResponse) {
  let statusCode = 200
  return {
    status(code: number) {
      statusCode = code
      return this
    },
    json(body: unknown) {
      nodeRes.statusCode = statusCode
      nodeRes.setHeader('content-type', 'application/json')
      nodeRes.end(JSON.stringify(body))
    },
    setHeader: (k: string, v: string) => nodeRes.setHeader(k, v),
    end: (body?: string) => {
      nodeRes.statusCode = statusCode
      nodeRes.end(body)
    },
  }
}

async function readBody(nodeReq: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of nodeReq) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8')
}

export function devApiPlugin(): Plugin {
  return {
    name: 'cv-tailor-dev-api',
    apply: 'serve',
    // Load .env / .env.local into process.env so the handlers (which read
    // process.env directly, as on Vercel) see the LLM config in local dev.
    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), '')
      for (const key of FUNCTION_ENV) {
        if (env[key] && !process.env[key]) process.env[key] = env[key]
      }
    },
    configureServer(server) {
      server.middlewares.use(async (nodeReq, nodeRes, next) => {
        const url = nodeReq.url ?? ''
        if (!url.startsWith('/api/')) return next()

        const name = url.split('?')[0].replace(/^\/api\//, '').replace(/\/+$/, '')

        let mod: { default?: (req: unknown, res: unknown) => unknown }
        try {
          mod = await server.ssrLoadModule(`/api/${name}.ts`)
        } catch {
          nodeRes.statusCode = 404
          nodeRes.setHeader('content-type', 'application/json')
          nodeRes.end(JSON.stringify({ error: 'Not found' }))
          return
        }

        const handler = mod.default
        if (typeof handler !== 'function') return next()

        const req = {
          method: nodeReq.method,
          url: nodeReq.url,
          headers: nodeReq.headers,
          body: await readBody(nodeReq),
        }
        await handler(req, makeRes(nodeRes))
      })
    },
  }
}
