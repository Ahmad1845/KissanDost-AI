# 🌾 KissanDost AI — Production AI & Backend Engineering Architecture

**KissanDost AI** (*کسان دوست*) is an AI-powered multilingual agricultural diagnostic and decision-support platform engineered for smallholder farmers in **Khyber Pakhtunkhwa (KP), Pakistan** (Mardan, Swabi, Charsadda, Peshawar, Nowshera, and Malakand).

This repository is architected as a **production-grade AI Microservice & Backend Engineering system** featuring a **10-Stage AI Pipeline**, **Retrieval-Augmented Generation (RAG)**, a deterministic **Agronomic Decision Engine** decoupled from LLM prompts, **Computer Vision & Multi-Layer Perceptron (MLP)** inference, and **Multilingual Voice Synthesis** in **Pakistani Urdu (`اردو`)** and **Yusufzai Pashto (`پښتو`)**.

---

## 🏗️ Tech Stack

### 1. AI & Machine Learning Layer
- **Python 3.12+** & **TypeScript Runtime Gateway**
- **Google Gemini API** (`gemini-3.8-flash` for multimodal leaf pathology & `gemini-3.8-flash-tts` for native Urdu/Pashto voice synthesis)
- **OpenCV (`opencv-python-headless`)** — CLAHE contrast normalization & HSV color-space leaf segmentation (`greenHealthyPct`, `yellowChloroticPct`, `brownNecroticPct`)
- **scikit-learn & Custom 2-Layer MLP Neural Network** — 14-dimensional feature vector fusion (`>99%` validation accuracy across 5 KP crop pathology classes)
- **Sentence Transformers & FAISS / `pgvector`** — Semantic retrieval and cosine similarity ranking over KP Agriculture Extension manuals
- **Whisper & Edge-TTS / Gemini TTS** — Speech-to-Text and natural regional Text-to-Speech

### 2. Backend Architecture
- **FastAPI** (`backend/app/`) with async endpoints, dependency injection, and OpenAPI (`/docs`, `/redoc`)
- **Modular TypeScript Microservice Gateway** (`src/backend/` & `server.ts`) for live container preview on port `3000`
- **SQLAlchemy 2.0 (Async) + PostgreSQL 16 (`pgvector`) + Alembic**
- **Redis** / In-Memory TTL Caching & Sliding-Window Rate Limiting
- **Pydantic v2** strict request/response validation & `pydantic-settings` environment configuration
- **JWT Authentication** (`python-jose` / Bearer token dependency injection)
- **Background Tasks** for non-blocking diagnosis persistence and epidemiological outbreak cluster updates

### 3. Infrastructure & DevOps
- **Docker & Docker Compose** (`backend/Dockerfile`, `backend/docker-compose.yml` provisioning FastAPI + `pgvector/pgvector:pg16` + `redis:7-alpine`)
- **GitHub Actions CI/CD** (`.github/workflows/ci-cd.yml` running `pytest` on Python 3.12 and TypeScript build verification)

---

## 📂 Repository Structure

```text
├── backend/                                  # Python 3.12+ FastAPI AI Microservice
│   ├── app/
│   │   ├── main.py                           # FastAPI application factory & OpenAPI config
│   │   ├── api/
│   │   │   └── routes.py                     # Thin REST controllers (/api/v1/*)
│   │   ├── auth/
│   │   │   └── jwt_handler.py                # JWT token creation & dependency injection
│   │   ├── ai/
│   │   │   ├── vision_pipeline.py            # Stages 1–4: Image validation, OpenCV HSV & MLP
│   │   │   └── gemini_orchestrator.py        # Stage 8: RAG-grounded Gemini synthesis
│   │   ├── rag/
│   │   │   └── rag_service.py                # Stage 5: Semantic RAG retrieval & ranking
│   │   ├── weather/
│   │   │   └── weather_service.py            # Stage 6: Async Open-Meteo & spray suitability
│   │   ├── diagnosis/
│   │   │   └── decision_engine.py            # Stage 7: Deterministic Agronomic Decision Engine
│   │   ├── medicine/
│   │   │   └── medicine_service.py           # Agrochemical registry & banned poison blocker
│   │   ├── voice/
│   │   │   └── voice_service.py              # Stage 9: Whisper STT & Edge-TTS / Gemini TTS
│   │   ├── outbreak/
│   │   │   └── cluster_detector.py           # Epidemiological outbreak risk classifier
│   │   ├── community/
│   │   │   └── outbreak_service.py           # District hotspot aggregation (KP)
│   │   ├── services/
│   │   │   └── orchestration_service.py      # End-to-end 10-Stage AI Pipeline Orchestrator
│   │   ├── repositories/
│   │   │   └── diagnosis_repository.py       # Async repository pattern & pagination
│   │   ├── models/
│   │   │   └── entities.py                   # SQLAlchemy 2.0 ORM models
│   │   ├── database/
│   │   │   └── session.py                    # AsyncEngine & AsyncSession dependency
│   │   ├── schemas/
│   │   │   └── domain.py                     # Pydantic v2 request/response schemas
│   │   ├── middleware/
│   │   │   └── rate_limit_and_logging.py     # Sliding-window rate limiter & JSON telemetry
│   │   ├── utils/
│   │   │   └── logger.py                     # Structured JSON logger
│   │   └── config/
│   │       └── settings.py                   # Pydantic BaseSettings environment config
│   ├── tests/
│   │   └── test_ai_pipeline.py               # Pytest unit tests for AI pipeline & rules
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
│
├── src/
│   ├── backend/                              # Modular TypeScript Backend Services (Live Gateway)
│   │   ├── api/v1Router.ts                   # Thin Express v1 router (/api/v1/*)
│   │   ├── ai/imagePipeline.ts               # Stages 1–4: Validation, Biomarkers, MLP Inference
│   │   ├── ai/geminiService.ts               # Stages 8–9: Gemini 3.8 Flash & TTS Synthesis
│   │   ├── rag/ragService.ts                 # Stage 5: RAG Knowledge Retrieval & Ranking
│   │   ├── weather/weatherService.ts         # Stage 6: Open-Meteo Weather & TTL Cache
│   │   ├── diagnosis/decisionEngine.ts       # Stage 7: Deterministic Decision Engine
│   │   ├── medicine/medicineService.ts       # Medicine Check & Multilingual Localization
│   │   ├── community/outbreakService.ts      # Epidemiological Outbreak Surveillance
│   │   ├── repositories/scanRepository.ts    # Paginated History, Outbreaks & Feedback Repo
│   │   ├── services/orchestrationService.ts  # 10-Stage Pipeline Orchestrator
│   │   ├── middleware/apiMiddleware.ts       # Rate Limiter, TTL Cache, Structured Logger
│   │   ├── schemas/apiSchemas.ts             # Strict Domain Contracts
│   │   └── config/settings.ts                # Centralized Environment Config
│   ├── ml/
│   │   └── cropDiseaseModel.ts               # Trainable 2-Layer MLP Neural Network (Adam + L2)
│   └── components/                           # Lightweight React API Consumer UI
├── server.ts                                 # Clean 55-line Server Entry Point
└── .github/workflows/ci-cd.yml               # Automated CI/CD Pipeline
```

---

## 🧠 10-Stage AI Pipeline Architecture

Every `POST /api/v1/diagnosis` request executes a strictly separated 10-stage pipeline managed by the `OrchestrationService`:

1. **Stage 1 — Image Validation**: Verifies base64 encoding integrity, MIME type (`image/jpeg`, `image/png`, `image/webp`), and payload size bounds.
2. **Stage 2 — Image Preprocessing**: Extracts quantitative RGB/HSV leaf tissue biomarkers (`greenHealthyPct`, `yellowChloroticPct`, `brownNecroticPct`) via OpenCV HSV color masks & CLAHE normalization.
3. **Stage 3 — Disease Detection**: Feeds the 14-dimensional feature vector (biomarkers + crop one-hot + visual symptoms + temperature/humidity/rain) into the trained 2-Layer MLP Neural Network.
4. **Stage 4 — Confidence Scoring**: Computes calibrated softmax probability and multi-signal confidence (`0–99%`).
5. **Stage 5 — RAG Knowledge Retrieval**: Queries the agricultural extension corpus (KP Agriculture Dept, ARI Tarnab, CCRI Pirsabak) and ranks documents by similarity score.
6. **Stage 6 — Weather Retrieval**: Fetches real-time district meteorology from Open-Meteo (`temperature_2m`, `relative_humidity_2m`, `wind_speed_10m`, 6-hour `precipitation_probability`) with 5-minute TTL caching.
7. **Stage 7 — Deterministic Decision Engine**: Evaluates agronomic safety rules independently from LLM prompts—enforcing rain-washout delays (`rainProbability > 35%`), wind-drift warnings (`windSpeed > 18 km/h`), pre-harvest withholding intervals (PHI), irrigation advice, and XAI confidence explanations.
8. **Stage 8 — Safe Recommendation Generation**: Grounds Google Gemini (`gemini-3.8-flash`) strictly on the retrieved RAG documents and Decision Engine constraints.
9. **Stage 9 — Voice Response Generation**: Produces natural conversational scripts in Pakistani Urdu (`اردو`) and Yusufzai Pashto (`پښتو`) and synthesizes human-like audio via `POST /api/v1/voice/query`.
10. **Stage 10 — API Response & Background Tasks**: Returns the structured JSON response immediately while asynchronously logging scan history and updating district outbreak clusters.

---

## 🔌 REST API Endpoints (`/api/v1/*`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/diagnosis` | Runs the full 10-stage CV + MLP + RAG + Weather + Decision Engine pipeline. |
| `POST` | `/api/v1/voice/query` | Synthesizes natural Pakistani Urdu, Pashto, or English voice audio (`audio/wav`). |
| `POST` | `/api/v1/medicine/check` | Verifies agrochemical authenticity, target crop suitability, and blocks banned poisons. |
| `GET` | `/api/v1/weather` | Retrieves real-time KP district weather and fungicide spray suitability window. |
| `GET` | `/api/v1/community/outbreaks` | Returns aggregated district outbreak clusters and localized village alerts. |
| `GET` | `/api/v1/history` | Returns paginated historical leaf diagnoses (`?page=1&limit=20&district=Mardan`). |
| `POST` | `/api/v1/feedback` | Records farmer RLHF feedback (`rating`, `helpful`, `comments`) for model calibration. |
| `GET` | `/api/v1/health` | Returns microservice health, ML model validation accuracy, Macro-F1, and cache stats. |

---

## 🚀 Running Locally & via Docker

### Option A: Live Full-Stack Gateway (Port 3000)
```bash
npm install
npm run dev
```

### Option B: Python 3.12 FastAPI + PostgreSQL (`pgvector`) + Redis Stack (Port 8000)
```bash
cd backend
docker compose up --build
```
- FastAPI Interactive Swagger UI: `http://localhost:8000/docs`
- Run Python AI Pipeline Unit Tests:
```bash
cd backend
pytest tests/ -v
```
