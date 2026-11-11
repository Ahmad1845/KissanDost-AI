@echo off
echo ============================================================
echo  KissanDost AI - Full-Stack Local Environment (Windows)
echo ============================================================

if not exist "node_modules" (
  echo Installing npm dependencies...
  call npm install
)

node scripts/setup-local.mjs
echo Launching unified Express + Vite + AI Pipeline server on http://localhost:3000 ...
call npm run dev
