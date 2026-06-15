# cv-tailor — Design Spec

**Date:** 2026-06-15
**Author:** Dylan Porter
**Status:** Approved for planning
**Repo:** `DylPorter/cv-tailor` (public, MIT)
**Location:** `~/Documents/Programming/cv-tailor/`

## Origin

Built for my dad. He's been job-hunting after ~20 years in one organisation, running a 7-page
CV written in Word and styled like it's 2006. A recruiter diagnosed the real problem in minutes:
the content is all genuinely there, it's the *presentation* that's broken — too long, and job
titles that mean nothing to the audience reading them. This tool fixes presentation, not substance.

## What it is

A web app that turns one master career history + a pasted job description into a tailored,
ATS-safe, 1–2 page CV, plus an honest fit report and a refine loop. All history stays in the
user's browser. The LLM call is backed by a key the deployer holds (DeepSeek for my dad's
deployment), gated behind a shared password so the key can't be abused.

Secondary goal: a public FOSS portfolio piece. Honest README, bring-your-own-key for anyone
who wants to self-host.

## Core design principle

**The LLM returns structured CV JSON, never a finished document.** The model does the *thinking*
(what to include, how to reframe, what matches the JD). Deterministic renderers do the *layout*
(PDF, .docx, on-screen preview), all from one JSON source of truth. This guarantees the output is
consistently formatted and ATS-safe, and means we never reformat model prose twice.

## Architecture

### Stack
- **Frontend:** Vite + React + TypeScript + Tailwind (consistent with the portfolio repo).
- **Backend:** one serverless function, `POST /api/tailor`. Written as a standard request handler
  so it deploys to Vercel (default) or ports to Cloudflare Pages Functions with minimal change.
- **LLM access:** OpenAI-compatible client configured by env vars — `LLM_BASE_URL`, `LLM_API_KEY`,
  `LLM_MODEL`. DeepSeek, OpenAI, Groq, Gemini, and Anthropic all expose OpenAI-compatible
  endpoints, so provider-agnosticism costs almost no code. My dad's deployment uses DeepSeek;
  FOSS users set their own three vars.
- **Storage:** entirely client-side. `localStorage` holds the master profile and the saved folder
  of tailored CVs. No database, no accounts. Career history only leaves the browser as the
  per-request `{master, jd}` payload to the LLM.

### Components
- **Master Profile** — raw text. User uploads their existing Word CV (parsed client-side via
  `mammoth.js`) or pastes it. Stored as-is; no structuring at this step. Editable later.
- **Tailor flow** — paste a JD → `POST /api/tailor {master, jd}` → `{cv, fitReport}`.
- **Saved folder** — each generated CV is saved to `localStorage`, keyed by company/role
  (parsed from the JD, user-editable label). This is the "folder of CVs by company" end-state.
- **Renderers** (deterministic, from CV JSON):
  - PDF via `@react-pdf/renderer` — real selectable text, single column, ATS-safe.
  - .docx via the `docx` library — same JSON, editable Word for HK portals (JobsDB etc.).
  - Preview — a React component rendering the same JSON. One clean recruiter-approved template.
- **Fit report** — returned alongside the CV: what the JD demands, what the profile covers,
  honest gaps (missing/weak), and the ATS keywords mirrored.
- **Refine loop** — "make it shorter" / "emphasise X" re-calls `/api/tailor` with the prior CV
  JSON + a refine instruction → new version. Stored as a new revision in the folder.

### Data shapes (indicative)

```ts
// localStorage
type MasterProfile = { text: string; updatedAt: string }
type SavedCV = {
  id: string
  label: string            // "Acme Corp — Ops Manager"
  jd: string
  cv: CVJson
  fitReport: FitReport
  createdAt: string
  revisionOf?: string      // for refine-loop history
}

// LLM response (server returns this, validated)
type CVJson = {
  name: string
  contact: { email?: string; phone?: string; location?: string; links?: string[] }
  summary: string
  experience: { title: string; org: string; dates: string; bullets: string[] }[]
  education: { credential: string; institution: string; dates: string }[]
  skills: string[]
  extras?: { heading: string; items: string[] }[]
}
type FitReport = {
  requirements: { requirement: string; covered: boolean; evidence?: string }[]
  gaps: string[]
  keywordsMirrored: string[]
}
```

### Request/response — `POST /api/tailor`
- **In:** `{ password, master, jd, priorCv?, refineInstruction? }`
- **Server:** validates `password` against `APP_PASSWORD` env (constant-time compare); calls the
  configured LLM with a strict system prompt; enforces JSON output; validates the shape.
- **Out:** `{ cv: CVJson, fitReport: FitReport }` or a typed error.

## LLM behaviour (system prompt requirements)

- **No fabrication.** Only select, reorder, and reframe content present in the master profile.
  Never invent experience, dates, employers, or skills. This is a presentation tool.
- **Reframe titles** to be legible to the target audience (the recruiter's exact diagnosis).
- **Mirror JD keywords honestly** for ATS — only where the profile genuinely supports them.
- **Hard cap 1–2 pages** worth of content; cut aggressively for relevance.
- **Return strict JSON** matching `CVJson` + `FitReport`. On refine, take `priorCv` +
  `refineInstruction` as the base.

## Error handling

- Bad/missing password → 401, clear UI message.
- LLM provider error / rate limit / timeout → typed error, user-facing retry.
- LLM returns malformed JSON → one server-side retry with a stricter reminder, then fail cleanly.
- `localStorage` quota exceeded → warn, offer to delete old saved CVs.
- Empty master profile or empty JD → client-side validation blocks the call.

## Testing

- **Unit:** CVJson → PDF renderer, CVJson → .docx renderer, JSON-shape validator, password check,
  API handler with a mocked LLM, input validation.
- **Manual eval:** run my dad's real CV against 2–3 real JobsDB postings; check ATS-safety
  (text selectable, single column), length (1–2 pages), and that the fit report's gaps are honest.

## FOSS / repo

- Public `DylPorter/cv-tailor`, MIT license.
- Honest README: what it is, why (built for my dad), how to self-host (`.env.example` with the
  three `LLM_*` vars + `APP_PASSWORD`), and the no-fabrication stance.
- README copy to be written in my own voice.

## Out of scope (YAGNI)

- Automated scraping of JobsDB/LinkedIn (manual paste only — scraping gets banned/rate-limited).
- Accounts, multi-user, server-side storage, payments.
- Multiple CV templates / theming (one clean ATS-safe template; revisit only if needed).
- Cover-letter generation (possible later, not v1).

## Open questions

None blocking. Repo may be renamed `refit` later; no code impact.
