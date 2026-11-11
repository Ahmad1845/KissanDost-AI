@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo  KissanDost AI - Full-Stack Local Environment (Windows)
echo ============================================================

REM Use npm.cmd explicitly to bypass Windows PowerShell ExecutionPolicy (npm.ps1 restriction)
if not exist "node_modules" (
  echo [1/3] Installing npm dependencies via npm.cmd...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo [ERROR] npm.cmd install failed. Make sure Node.js is installed.
    pause
    exit /b 1
  )
)

echo [2/3] Running environment check and self-healing missing files...
node scripts/setup-local.mjs

if not exist "server.ts" (
  echo.
  echo [ERROR] server.ts is still missing in "%cd%".
  echo Please accept/sync all updated files from AI Studio or run: git checkout HEAD -- .
  echo.
  pause
  exit /b 1
)

echo [3/3] Launching unified Express + Vite + AI Pipeline server on http://localhost:3000 ...
echo (Press Ctrl+C to stop the server)
echo.
call npm.cmd run dev

echo.
echo Server stopped. Press any key to close this window...
pause
