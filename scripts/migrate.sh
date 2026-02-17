#!/usr/bin/env bash
set -euo pipefail

# Load env from .env.local
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Check .env.local"
  exit 1
fi

echo "Running drizzle-kit push..."
npx drizzle-kit push

echo "Done."
