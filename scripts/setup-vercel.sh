#!/usr/bin/env bash
#
# One-shot Vercel setup for cv-tailor.
#
# Prerequisites (one time):
#   1. npm i -g vercel          # already installed if you're reading this
#   2. vercel login             # authenticates with YOUR Vercel account (browser)
#   3. cp .env.example .env.local && edit it  # real DeepSeek key + a password
#
# Then run:  ./scripts/setup-vercel.sh
#
# What it does:
#   - links this directory to a Vercel project (creates one if needed)
#   - pushes every var from .env.local into the project's Production env
#   - connects the GitHub repo so every `git push` auto-deploys
#   - runs an initial production deploy
#
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI not found. Install with: npm i -g vercel" >&2
  exit 1
fi

if [ ! -f .env.local ]; then
  echo ".env.local not found. Run: cp .env.example .env.local  (then fill it in)" >&2
  exit 1
fi

echo "→ Linking project (create one if prompted)…"
vercel link

echo "→ Pushing env vars from .env.local into Production…"
while IFS= read -r line || [ -n "$line" ]; do
  # skip blanks and comments
  case "$line" in ''|\#*) continue ;; esac
  key="${line%%=*}"
  val="${line#*=}"
  [ -z "$key" ] && continue
  # replace any existing value so re-runs are idempotent
  vercel env rm "$key" production --yes >/dev/null 2>&1 || true
  printf '%s' "$val" | vercel env add "$key" production >/dev/null
  echo "   set $key"
done < .env.local

echo "→ Connecting the GitHub repo (enables auto-deploy on push)…"
vercel git connect || echo "   (skip: connect it later in the Vercel dashboard if this errored)"

echo "→ Deploying to production…"
vercel --prod

echo "✓ Done. Future 'git push' to the connected branch will auto-deploy."
