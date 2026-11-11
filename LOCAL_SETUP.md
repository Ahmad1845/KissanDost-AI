# Local Machine Setup Guide (`LOCAL_SETUP.md`)

This project is pre-configured to run on your local machine (**Windows, macOS, or Linux**) identically to how it runs inside Google AI Studio—on a single unified port (**`http://localhost:3000`**) with zero CORS issues or extra database dependencies required.

---

## Quickest Way to Run Locally (3 Steps)

### Prerequisite
- Install **Node.js v20 LTS** (or v18+): [https://nodejs.org](https://nodejs.org)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Ahmad1845/KissanDost-AI---Agricultural-Decision-Support-System.git
cd KissanDost-AI---Agricultural-Decision-Support-System
```

### Step 2: Install Dependencies & Auto-Create `.env`
```bash
npm install
npm run setup
```
*(This automatically creates `.env` from `.env.example` and verifies all required files.)*

### Step 3: Add Your Gemini API Key in `.env` & Start
Open `.env` in the root folder and paste your Gemini API key from [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey):
```env
GEMINI_API_KEY=AIzaSyYourRealApiKeyHere
PORT=3000
```
Then start the full-stack server:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser!

> **One-Click Scripts**:
> - **Windows**: Double-click `start-local.bat` or run `.\start-local.bat` in PowerShell/CMD.
> - **macOS / Linux / Git Bash**: Run `bash start-local.sh`.

---

## Why Previous Local Attempts Failed (And How It Is Fixed Now)

1. **Fixed Public `npm install` Version Ranges (`package.json`)**:
   - AI Studio's internal container uses custom pre-release version numbers (`@google/genai@^2.25.0`, `vite@^8.3.0`, `typescript@^7.0.2`) that do not exist on public npm.
   - `package.json` now uses compatible semver ranges (`>=1.0.0`, `>=6.0.0`, `>=5.6.0`) so `npm install` works cleanly on any local laptop without `ETARGET` errors.
2. **Fixed Missing/Public API Key Handling (`src/backend/llm/geminiService.ts`)**:
   - Previously, starting the server before setting `GEMINI_API_KEY` could crash the `@google/genai` constructor. Now the Gemini client initializes lazily, so the app starts cleanly even without an API key.
   - Added automatic model fallback from AI Studio's internal model aliases (`gemini-3.8-flash` / `gemini-3.8-flash-tts`) to public API models (`gemini-2.5-flash` / `gemini-2.5-flash-preview-tts`) when using a standard local API key.
3. **Added `AGENTS.md` Guardrails**:
   - Local AI agents (Cursor, Windsurf, Claude Code) often see both `/server.ts` and `/backend/` and mistakenly try to rewire or delete files. `AGENTS.md` instructs any local agent to preserve the unified Port 3000 architecture.

---

## Optional: Running with Docker Compose

From the project root:
```bash
docker compose up --build
```
- **Full-Stack Web App & API Gateway**: `http://localhost:3000`
- **Python FastAPI Microservice Swagger UI**: `http://localhost:8000/docs`
- **PostgreSQL 16 (`pgvector`)**: `localhost:5432`
- **Redis 7**: `localhost:6379`
