# KissanDost AI (کسان دوست / د بزګر ملګری)

**Scalable AI Backend Architecture & Multilingual Agricultural Decision Support System for Khyber Pakhtunkhwa, Pakistan**

KissanDost AI is a production-inspired AI backend and voice-first mobile web application built for smallholder farmers across Khyber Pakhtunkhwa (Mardan, Swabi, Charsadda, Peshawar, Nowshera, Malakand, and Swat). It combines an image analysis pipeline, an MLP-based classifier for crop disease classification, a Rule-Based Decision Engine independent of the LLM, Retrieval-Augmented Generation (RAG) over KP Agriculture Extension manuals, live district weather integration, and native **Urdu (اردو)** and **Pashto (پښتو)** voice guidance.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Request Flow](#4-request-flow)
5. [Why the Decision Engine Exists](#5-why-the-decision-engine-exists)
6. [Repository Structure](#6-repository-structure)
7. [Backend File-by-File Guide](#7-backend-file-by-file-guide)
8. [Frontend File-by-File Guide](#8-frontend-file-by-file-guide)
9. [REST API Reference & Response Example](#9-rest-api-reference--response-example)
10. [Security](#10-security)
11. [Testing](#11-testing)
12. [Setup & Deployment](#12-setup--deployment)
13. [Future Improvements](#13-future-improvements)

---

## 1. System Overview

Smallholder farmers in Khyber Pakhtunkhwa frequently face yield losses from **Tomato Early & Late Blight**, **Wheat Yellow Stripe Rust**, and **Maize Northern Leaf Blight**, as well as financial loss when fungicides are washed away by rain or when restricted/counterfeit chemicals are applied.

KissanDost AI addresses these challenges through a modular backend architecture:

- **Computer Vision & Disease Prediction (`vision/`)**: Extracts quantitative RGB/HSV leaf color biomarkers (healthy green, chlorotic yellow halo, and necrotic brown tissue) using center-weighted region-of-interest (ROI) segmentation and runs a custom neural network designed for crop disease prediction.
- **Rule-Based Decision Engine (`diagnosis/`)**: Evaluates disease predictions, district weather forecasts, and pre-harvest safety intervals independently of the LLM.
- **RAG Retrieval (`rag/` & `embeddings/`)**: Ranks agricultural extension advisories, dosage tables, and approved pesticide records from KP Agriculture Department and PARC manuals.
- **Multimodal LLM & Voice Synthesis (`llm/` & `voice/`)**: Uses Google Gemini (`gemini-2.5-flash`) for grounded Urdu and Pashto farmer explanations and the Gemini Speech/TTS API for spoken audio guidance.

---

## 2. Tech Stack

Every technology listed below is implemented directly in this repository:

### AI & Machine Learning Layer
- **Python 3.12+** & **TypeScript 5.8**
- **Google Gemini API (`gemini-2.5-flash`)** — Multimodal leaf inspection and RAG-grounded explanation synthesis
- **Google Gemini TTS API (`gemini-2.5-flash-preview-tts`)** — Native Urdu (اردو), Pashto (پښتو), and English speech synthesis
- **OpenCV (`opencv-python-headless`) & Canvas HSV Segmentation** — Leaf color-space segmentation and necrotic lesion extraction
- **MLP-Based Classifier (`scikit-learn` / `NumPy` / TypeScript MLP)** — Custom 2-layer neural network designed for crop disease prediction across 14 agronomic features
- **RAG & Token-Vector Similarity (`embeddings/`)** — Lexical and domain-feature similarity ranking over KP Agriculture Extension documents

### Backend Layer
- **FastAPI** (`/backend/app/`) — Async Python REST API microservice with OpenAPI documentation and background tasks
- **Express.js + TypeScript** (`/src/backend/` & `/server.ts`) — Full-stack API gateway serving `/api/v1/*` and the Vite client on Port 3000
- **SQLAlchemy 2.0 (Async) & PostgreSQL** — Relational ORM models for users, farms, diagnosis logs, outbreak reports, and feedback
- **Alembic** — Database schema migration support
- **Redis & In-Memory TTL Cache** — Weather snapshot caching, TTS audio caching, and sliding-window IP rate limiting
- **Pydantic v2** — Request/response schema validation and environment settings management
- **JWT Authentication (`python-jose` & `passlib`)** — Role-based access control for farmers, agriculture officers, and admins

### Frontend Layer
- **React 19 + Vite 6 + Tailwind CSS 4** — Lightweight, mobile-first RTL/LTR interface (`Noto Nastaliq Urdu` & `Plus Jakarta Sans`) that consumes `/api/v1/*` endpoints without embedding backend business logic

### Infrastructure
- **Docker & Docker Compose** — Multi-container setup for the FastAPI backend, PostgreSQL 16, and Redis 7
- **GitHub Actions CI/CD** — Automated Python `pytest` test suite and TypeScript type-checking/build verification

---

## 3. Architecture Diagram

```text
Farmer
  ↓
React UI
  ↓
FastAPI
  ↓
Image Pipeline
  ↓
Disease Detection
  ↓
Weather Service
  ↓
Decision Engine
  ↓
RAG Retrieval
  ↓
Gemini
  ↓
Response
  ↓
Voice Service
```

---

## 4. Request Flow

When a farmer uploads or captures a crop leaf photo, the backend executes the following sequence:

```text
Upload Image
  ↓
Validation
  ↓
OpenCV
  ↓
Disease Prediction
  ↓
Weather API
  ↓
RAG Retrieval
  ↓
Decision Engine
  ↓
Gemini
  ↓
Voice Generation
  ↓
JSON Response
```

1. **Upload Image & Validation**: Validates MIME type, base64 payload integrity, and image dimensions.
2. **OpenCV / HSV Preprocessing**: Extracts center-weighted leaf color biomarkers (`greenHealthyPct`, `yellowChloroticPct`, `brownNecroticPct`).
3. **Disease Prediction**: Passes the 14-feature vector (biomarkers, crop one-hot encoding, visible symptoms, and weather indicators) through the MLP-based classifier.
4. **Weather API**: Queries Open-Meteo for the farmer's KP district (temperature, humidity, wind speed, and rain probability).
5. **RAG Retrieval**: Scores and retrieves the top-matching KP Agriculture Extension guidelines and approved fungicide dosages.
6. **Decision Engine**: Applies deterministic agronomic and weather safety rules (such as delaying sprays before rain and enforcing pre-harvest withholding intervals).
7. **Gemini (`gemini-2.5-flash`)**: Synthesizes simple, jargon-free farmer guidance in Urdu, Pashto, and English grounded on the Decision Engine output and RAG context.
8. **Voice Generation & JSON Response**: Prepares the spoken Urdu and Pashto scripts (and audio stream via `/api/v1/voice/query`) and returns the structured JSON response while logging outbreak data in a background task.

---

## 5. Why the Decision Engine Exists

The Decision Engine ensures agronomic safety by applying deterministic rules before generating recommendations. Weather conditions, confidence thresholds, irrigation status, and spray timing are validated independently of the language model to reduce hallucinations and improve recommendation reliability.

Key rules enforced by the Decision Engine (`backend/app/diagnosis/decision_engine.py` and `src/backend/diagnosis/decisionEngine.ts`):
- **Rain Washout Prevention**: Automatically advises delaying chemical sprays if precipitation probability exceeds 35%–40% in the farmer's district.
- **Wind Drift Prevention**: Warns against afternoon spraying when wind speeds exceed 18 km/h.
- **Morning Dew Rule for Wheat Rust**: Instructs farmers to wait until heavy morning dew dries (after 9:00 AM) before applying Propiconazole (`Tilt 250 EC`).
- **Pre-Harvest Interval (PHI) Enforcement**: Enforces mandatory waiting periods before harvest (7 days for Mancozeb on Tomato and Maize fodder; 28 days for Propiconazole on Wheat).
- **False-Healthy Protection**: Prevents leaves with necrotic brown (`>= 5%`) or chlorotic yellow (`>= 8%`) lesions from being misclassified as healthy plants.

---

## 6. Repository Structure

The backend is organized into clean, single-responsibility modules with `vision/`, `llm/`, `embeddings/`, and `pipelines/` separated for scalability:

```text
.
├── backend/                                  # Python 3.12+ FastAPI AI Microservice
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py                     # REST API controllers (/api/v1/*)
│   │   ├── auth/
│   │   │   └── jwt_handler.py                # JWT token creation, verification & RBAC
│   │   ├── vision/
│   │   │   └── vision_pipeline.py            # Image validation, OpenCV HSV segmentation & MLP classifier
│   │   ├── llm/
│   │   │   └── gemini_client.py              # Gemini 2.5 Flash grounded recommendation synthesis
│   │   ├── embeddings/
│   │   │   └── vector_scorer.py              # Token-vector & domain similarity scorer for RAG
│   │   ├── pipelines/
│   │   │   └── diagnosis_pipeline.py         # Multi-stage crop diagnosis pipeline runner
│   │   ├── diagnosis/
│   │   │   └── decision_engine.py            # Rule-Based Decision Engine independent of the LLM
│   │   ├── rag/
│   │   │   └── rag_service.py                # Agricultural knowledge base & document retrieval
│   │   ├── weather/
│   │   │   └── weather_service.py            # Async Open-Meteo integration for KP districts
│   │   ├── medicine/
│   │   │   └── medicine_service.py           # Pesticide authenticity & banned chemical checker
│   │   ├── outbreak/
│   │   │   └── cluster_detector.py           # District & village outbreak severity aggregation
│   │   ├── voice/
│   │   │   └── voice_service.py              # Gemini TTS speech synthesis service (Urdu & Pashto)
│   │   ├── community/
│   │   │   └── outbreak_service.py           # Community surveillance feed & regional alerts
│   │   ├── services/
│   │   │   └── orchestration_service.py      # Pipeline orchestration & background task scheduling
│   │   ├── models/
│   │   │   └── entities.py                   # SQLAlchemy 2.0 async ORM entities (PostgreSQL)
│   │   ├── repositories/
│   │   │   └── diagnosis_repository.py       # Data access layer for scans, outbreaks & feedback
│   │   ├── database/
│   │   │   └── session.py                    # Async SQLAlchemy engine & session dependency
│   │   ├── schemas/
│   │   │   └── domain.py                     # Pydantic v2 request & response schemas
│   │   ├── middleware/
│   │   │   └── rate_limit_and_logging.py     # Sliding-window rate limiter & request timing
│   │   ├── utils/
│   │   │   └── logger.py                     # Structured JSON logger
│   │   ├── config/
│   │   │   └── settings.py                   # Environment-based Pydantic Settings
│   │   └── main.py                           # FastAPI application factory & exception handlers
│   ├── tests/
│   │   └── test_ai_pipeline.py               # Pytest unit & pipeline tests
│   ├── Dockerfile                            # Container image definition for FastAPI service
│   ├── docker-compose.yml                    # FastAPI + PostgreSQL 16 + Redis 7 stack
│   └── requirements.txt                      # Python dependencies
│
├── src/
│   ├── backend/                              # TypeScript Modular Backend Gateway (Port 3000)
│   │   ├── api/v1Router.ts                   # Express REST router (/api/v1/*)
│   │   ├── vision/imagePipeline.ts           # Image validation, biomarker calibration & MLP inference
│   │   ├── llm/geminiService.ts              # Gemini 2.5 Flash & Gemini TTS integration
│   │   ├── embeddings/embeddingScorer.ts     # Token-vector similarity scorer for RAG ranking
│   │   ├── pipelines/diagnosisPipeline.ts    # Multi-stage diagnosis pipeline coordinator
│   │   ├── diagnosis/decisionEngine.ts       # Rule-Based Decision Engine independent of the LLM
│   │   ├── rag/ragService.ts                 # Agricultural RAG retrieval & context builder
│   │   ├── weather/weatherService.ts         # Live Open-Meteo client with TTL caching
│   │   ├── medicine/medicineService.ts       # Pesticide registry & safety verification service
│   │   ├── community/outbreakService.ts      # District outbreak cluster service
│   │   ├── repositories/scanRepository.ts    # Paginated scan history & feedback repository
│   │   ├── services/orchestrationService.ts  # End-to-end pipeline orchestration & background tasks
│   │   ├── schemas/apiSchemas.ts             # TypeScript domain contracts & DTOs
│   │   ├── middleware/apiMiddleware.ts       # Structured logger, TTL cache, rate limiter & error handler
│   │   └── config/settings.ts                # Environment configuration
│   ├── ml/
│   │   └── cropDiseaseModel.ts               # MLP neural network classifier (14 features -> 5 classes)
│   ├── components/                           # Mobile-first React UI components
│   ├── data/                                 # KP agricultural corpus & Urdu/Pashto/English translations
│   ├── types/                                # Frontend TypeScript interfaces
│   ├── utils/                                # Client audio playback & Web Speech fallback
│   ├── App.tsx                               # Main application shell
│   └── index.css                             # Tailwind CSS 4 & RTL typography rules
│
├── .github/workflows/ci-cd.yml               # GitHub Actions CI/CD pipeline
├── server.ts                                 # Express + Vite server entry point (Port 3000)
├── package.json                              # Node.js scripts & dependencies
└── README.md                                 # Project documentation
```

---

## 7. Backend File-by-File Guide

### Vision, LLM, Embeddings & Pipelines
- **`backend/app/vision/vision_pipeline.py` & `src/backend/vision/imagePipeline.ts`**:
  Validates base64 and local image payloads, performs HSV color segmentation to measure healthy green, chlorotic yellow, and necrotic brown leaf percentages, and invokes the MLP classifier.
- **`src/ml/cropDiseaseModel.ts`**:
  Implements the 2-layer MLP neural network (`14 input features → 28 hidden units with LeakyReLU → 5 output classes`: `Tomato_Early_Blight`, `Tomato_Late_Blight`, `Wheat_Yellow_Rust`, `Maize_Northern_Leaf_Blight`, `Healthy_Crop`) with mini-batch gradient descent, momentum, and L2 regularization, plus agronomic lesion guards.
- **`backend/app/llm/gemini_client.py` & `src/backend/llm/geminiService.ts`**:
  Interfaces with `gemini-2.5-flash` for multimodal leaf analysis and RAG-grounded explanation generation, and `gemini-2.5-flash-preview-tts` for native Urdu and Pashto speech synthesis. Includes a post-generation check so LLM outputs cannot override disease detections with false-healthy labels.
- **`backend/app/embeddings/vector_scorer.py` & `src/backend/embeddings/embeddingScorer.ts`**:
  Tokenizes queries and agricultural extension documents and computes normalized token-overlap and crop-domain similarity scores.
- **`backend/app/pipelines/diagnosis_pipeline.py` & `src/backend/pipelines/diagnosisPipeline.ts`**:
  Coordinates the sequential execution of image validation, biomarker extraction, weather lookup, disease classification, RAG retrieval, the Rule-Based Decision Engine, and Gemini synthesis.

### Domain Services, Repositories & Middleware
- **`backend/app/diagnosis/decision_engine.py` & `src/backend/diagnosis/decisionEngine.ts`**:
  Rule-Based Decision Engine independent of the LLM. Maps disease classes, biomarker thresholds, and district weather into spray timing windows, chemical dosages, organic alternatives, and Urdu/Pashto farmer voice scripts.
- **`backend/app/rag/rag_service.py` & `src/backend/rag/ragService.ts`**:
  Retrieves and ranks official KP Agriculture Department, ARI Tarnab, CCRI Pirsabak, and PARC guidelines and formats the top-K context block.
- **`backend/app/weather/weather_service.py` & `src/backend/weather/weatherService.ts`**:
  Fetches live meteorological data from Open-Meteo for 9 KP districts (Mardan, Swabi, Charsadda, Peshawar, Nowshera, Malakand, Swat, Dera Ismail Khan, Mansehra) with 5-minute TTL caching.
- **`backend/app/medicine/medicine_service.py` & `src/backend/medicine/medicineService.ts`**:
  Checks chemical trade names and active ingredients against the KP plant protection registry to flag banned/restricted products (`Paraquat`, `Monocrotophos`, `Endosulfan`, `Methamidophos`) and verify safe dosages.
- **`backend/app/models/entities.py` & `backend/app/database/session.py`**:
  Defines async SQLAlchemy 2.0 PostgreSQL tables (`users`, `farms`, `diagnosis_records`, `outbreak_reports`, `farmer_feedback`) and async database session management.
- **`backend/app/middleware/rate_limit_and_logging.py` & `src/backend/middleware/apiMiddleware.ts`**:
  Provides structured JSON request logging, sliding-window IP rate limiting (`120 req/min`), and centralized error formatting.

---

## 8. Frontend File-by-File Guide

- **`src/App.tsx`**: Main application shell featuring a focused Hero section (dominant camera CTA, collapsible voice drawer, and compact weather bar), Recent Diagnosis card with `72x72` leaf thumbnail, and sticky 5-tab bottom navigation.
- **`src/components/CropScanModal.tsx`**: Camera and photo upload modal with client-side image compression, HSV + center-weighted leaf biomarker extraction, drag-and-drop upload, automatic symptom synchronization, and mutually exclusive healthy/diseased symptom selection.
- **`src/components/RecommendationView.tsx`**: 3-step farmer decision view (*1. What is the problem? 2. When to spray? 3. Which medicine & how much to mix?*) with one-tap Urdu and Pashto voice playback and WhatsApp sharing.
- **`src/components/VoiceGuideModal.tsx`**: Voice assistant modal with a concise summary card, primary play button, collapsible full transcript drawer, and interactive farmer Q&A chips.
- **`src/components/PesticideVerifier.tsx`**: Medicine authenticity and safety checker with unified search card, quick-select chips, and status badges (`✅ Safe & Approved`, `⚠️ Caution`, `❌ Restricted / Banned`).
- **`src/components/FarmManager.tsx`**: Spacious farm cards (`🌱 Crop · District · Acres`) and longitudinal crop recovery timeline.
- **`src/components/CommunityIntelligence.tsx` & `src/components/GovernmentDashboard.tsx`**: District outbreak cluster alerts for farmers and regional surveillance tables for KP Agriculture Extension Officers.

---

## 9. REST API Reference & Response Example

### Core Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/diagnosis` | Runs the full crop diagnosis pipeline on an uploaded leaf image |
| `POST` | `/api/v1/voice/query` | Synthesizes spoken Urdu (`ur`), Pashto (`ps`), or English (`en`) audio |
| `POST` | `/api/v1/medicine/check` | Verifies whether a pesticide or fungicide is approved, restricted, or banned |
| `GET` | `/api/v1/weather?district=Mardan` | Returns real-time district weather and spray window suitability |
| `GET` | `/api/v1/community/outbreaks` | Returns aggregated village and district disease outbreak clusters |
| `GET` | `/api/v1/history?page=1&limit=20` | Returns paginated diagnosis scan history |
| `POST` | `/api/v1/feedback` | Records farmer helpfulness ratings and comments |
| `GET` | `/api/v1/health` | Returns service health, model version, and cache status |

### Example `POST /api/v1/diagnosis` Response

Summary structure:

```json
{
  "crop": "Tomato",
  "disease": "Early Blight",
  "confidence": 0.93,
  "severity": "Moderate",
  "weather": {
    "rain_probability": 12
  },
  "recommendation": "Spray Mancozeb 75% WP (600-800g per 100L water per acre) tomorrow morning between 7:00 AM and 10:00 AM.",
  "voice_url": "/api/v1/voice/query",
  "sources": [
    "KP Agriculture Extension Manual"
  ]
}
```

Full API response payload returned by `/api/v1/diagnosis`:

```json
{
  "success": true,
  "scanId": "scan-1762859650112",
  "result": {
    "crop": "Tomato",
    "disease": "Early Blight (ٹماٹر کے پتوں کا جھلساؤ)",
    "severity": "Moderate",
    "confidence": 95,
    "action": "Do NOT spray today because of rain! Spray Mancozeb tomorrow morning between 7:00 AM and 10:00 AM.",
    "bestTime": "Tomorrow Morning 7:00 AM - 10:00 AM",
    "warnings": [
      "Rain washout risk (55% precipitation probability in Mardan). Delay chemical spraying until tomorrow morning."
    ],
    "irrigationAdvice": "Water at the base of the tomato ridges in the morning; avoid wetting lower leaves.",
    "approvedTreatments": [
      {
        "name": "Mancozeb 75% WP (ڈائیتھین ایم-۴۵)",
        "dosage": "600 to 800 grams in 100 litres of water for 1 Acre",
        "withholding": "Stop spraying 7 days before picking tomatoes",
        "ppe": "Tie a cloth over nose and mouth and wash hands with soap after spraying"
      }
    ],
    " groundedSources": [
      {
        "title": "Advisory 2026/EB: Management of Tomato Early Blight in Mardan & Peshawar Valley",
        "source": "KP Agriculture Dept",
        "relevanceScore": 0.924
      }
    ],
    "weatherSnapshot": {
      "district": "Mardan",
      "temperature": 25,
      "humidity": 78,
      "windSpeed": 7,
      "rainProbability": 55,
      "spraySuitability": "Delay Spray — Rain Risk"
    }
  }
}
```

---

## 10. Security

The backend implements layered security controls across both the FastAPI and Express services:

- **JWT Authentication**: Stateless Bearer token authentication (`backend/app/auth/jwt_handler.py`) with Bcrypt password hashing and role-based access control (`farmer`, `officer`, `admin`).
- **Rate Limiting**: Sliding-window per-IP rate limiting (`120 requests/minute`) protecting inference and TTS endpoints from abuse.
- **Input Validation**: Strict request body validation using Pydantic v2 schemas (`backend/app/schemas/domain.py`) and TypeScript runtime guards.
- **File Type Validation**: MIME-type verification (`image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`) and payload size bounds before decoding images.
- **Prompt Injection Protection**: User inputs are sanitized and constrained to structured fields (`cropHint`, predefined symptom keys, and validated district names), while the Rule-Based Decision Engine validates outputs after LLM generation so prompts cannot override safety rules or recommend banned chemicals.
- **API Key Management**: `GEMINI_API_KEY` and `JWT_SECRET_KEY` are loaded exclusively on the server side; no API keys are exposed to the browser bundle.
- **Environment Variables**: Configured via `.env` (with `.env.example` template committed to version control and `.env*` excluded in `.gitignore`).
- **Structured Logging**: JSON-formatted logs recording request method, path, HTTP status code, latency (`X-Process-Time-Ms`), and error codes without leaking sensitive payloads.

---

## 11. Testing

Automated tests are located in `backend/tests/test_ai_pipeline.py` and executed in CI via `.github/workflows/ci-cd.yml`.

What is covered:
- **API Endpoints**: Health check, diagnosis request validation, medicine verification, and weather lookup.
- **AI Pipeline**: Image base64/MIME validation, HSV biomarker extraction, and feature vector construction.
- **Decision Engine Rules**: Rain washout delay rules (`rainProbability > 35%`), severity classification, and false-healthy prevention when necrotic lesions are present.
- **RAG Retrieval**: Token-vector similarity scoring and crop-specific document ranking.
- **Authentication**: JWT token generation, expiration handling, and role verification.
- **Integration Tests**: End-to-end execution from image upload payload to structured recommendation output.

Run the Python test suite:
```bash
cd backend
pytest -v
```

Run the TypeScript compiler & lint verification:
```bash
npm run lint
npm run build
```

---

## 12. Setup & Deployment

### 1. Environment Variables
Copy `.env.example` to `.env` and configure your server-side credentials:
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET_KEY=kissandost-kp-secret-key
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/kissandost
REDIS_URL=redis://localhost:6379/0
```

### 2. Run the Full-Stack Application (Port 3000)
```bash
npm install
npm run dev
```

### 3. Run the Python FastAPI Microservice Stack via Docker Compose
```bash
cd backend
docker compose up --build
```
- **FastAPI Swagger UI**: `http://localhost:8000/docs`
- **FastAPI ReDoc**: `http://localhost:8000/redoc`

---

## 13. Future Improvements

- **Fine-tuned disease classification model**: Train and quantize a Vision Transformer / MobileNetV3 backbone on field images collected across Khyber Pakhtunkhwa districts.
- **Multi-crop support**: Expand pathology coverage to sugarcane, potato, tobacco, and stone fruits (peach and plum orchards in Swat).
- **Offline inference**: Package a quantized ONNX / TensorFlow Lite model in the Progressive Web App (PWA) for zero-connectivity mountain villages.
- **Satellite weather integration**: Combine Open-Meteo forecasts with Sentinel-2 NDVI vegetation indices for field-scale stress detection.
- **Farmer analytics dashboard**: Track seasonal fungicide cost savings, yield recovery trends, and irrigation logs per farm.
- **Continuous learning from farmer feedback**: Use agronomist-verified farmer scan feedback (`/api/v1/feedback`) to curate and expand the training dataset.
