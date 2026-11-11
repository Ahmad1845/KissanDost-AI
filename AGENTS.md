# AGENTS.md — Architectural Guardrails for Local AI Coding Agents

> **CRITICAL NOTICE FOR AI AGENTS (Cursor, Claude Code, Windsurf, GitHub Copilot, etc.):**
> Read this file completely before running commands or editing files in this repository.

## 1. How This Repository Runs (Do Not Rewire!)

This repository is already **100% wired and self-contained**. The full-stack application runs from the **project root** on **Port 3000** via `server.ts`:

```bash
npm install
npm run local
```

- **`/server.ts`** mounts **both**:
  1. The backend REST API router (`/api/v1/*` from `/src/backend/api/v1Router.ts`), and
  2. The Vite + React frontend (`/src/App.tsx`) on the same port (`http://localhost:3000`).
- **DO NOT** split the frontend and backend into separate ports to run the web app.
- **DO NOT** delete or move `/server.ts`, `/src/backend/`, `/src/ml/`, or `/backend/`.
- **DO NOT** change frontend API calls from `/api/v1/...` to `http://localhost:8000/...` — relative `/api/v1/...` paths are served directly by `server.ts` on Port 3000 with zero CORS issues.

## 2. Why Both `/src/backend/` (TypeScript) and `/backend/` (Python FastAPI) Exist

1. **`/src/backend/` + `/server.ts` (Primary Runtime on Port 3000)**:
   - Runs the live application in Google AI Studio and locally via `npm run dev` or `npm run local`.
   - Contains the complete 10-stage Crop Diagnosis Pipeline, MLP Neural Network (`src/ml/cropDiseaseModel.ts`), HSV Biomarker Segmentation, Rule-Based Decision Engine, RAG Service, Open-Meteo Weather Service, AI Spray Advisor (Bottle OCR, Counterfeit/Expiry Detection, Barcode Lookup, Medicine Comparison, Conservative Tank-Mix Advisor), and Gemini Vision + 500ms-padded WAV TTS Service.
2. **`/backend/` (Python 3.12+ FastAPI Microservice on Port 8000)**:
   - Standalone Python FastAPI + SQLAlchemy 2.0 + PostgreSQL/pgvector + Redis microservice mirror (`cd backend && uvicorn app.main:app --reload --port 8000` or `docker compose up --build`).
   - Tested via `pytest` in `.github/workflows/ci-cd.yml`.

## 3. Safe Commands for Local Agents

- **Setup & Verify Environment**: `npm run doctor`
- **Start Full-Stack Dev Server (Port 3000)**: `npm run dev` (or `npm run local`)
- **Type-Check (Lint)**: `npm run lint`
- **Production Build**: `npm run build`
- **Run Python FastAPI Tests**: `cd backend && pytest -v`
