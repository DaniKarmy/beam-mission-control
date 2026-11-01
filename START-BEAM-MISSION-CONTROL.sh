#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo
echo "=============================================================="
echo "  BEAM MISSION CONTROL - Save the Satellite"
echo "  Local reviewer launcher"
echo "=============================================================="
echo

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js was not found. Install Node.js ^20.19.0 or >=22.12.0."
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm was not found. Install Node.js with npm."
  exit 1
fi

node --version
npm --version

if [ ! -x node_modules/.bin/vite ]; then
  echo "First local run: installing the locked dependencies with npm ci..."
  npm ci
fi

echo "Starting BEAM MISSION CONTROL (preferred port 4173)."
echo "If that port is busy, Vite will use the next available port."
echo "Press Ctrl+C to stop the local server."
npm run dev -- --host 127.0.0.1 --port 4173 --open
