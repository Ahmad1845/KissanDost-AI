#!/usr/bin/env bash
set -e

echo "============================================================"
echo " 🌿 Starting KissanDost AI (Full-Stack Local Environment)"
echo "============================================================"

if [ ! -d "node_modules" ]; then
  echo "📦 Installing npm dependencies..."
  npm install
fi

node scripts/setup-local.mjs
echo "🚀 Launching unified Express + Vite + AI Pipeline server on http://localhost:3000 ..."
npm run dev
