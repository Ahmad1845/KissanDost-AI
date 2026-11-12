# 🌿 KissanDost AI (کسان دوست اے آئی)

**Crop-Locked Hybrid Disease Diagnosis, AI Spray Advisor, Real-Time Weather Intelligence & Pakistani Urdu / Mardan Pashto Voice Advisory System for Khyber Pakhtunkhwa Farmers**

[![Python 3.12+](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL + pgvector](https://img.shields.io/badge/PostgreSQL-16_%2B_pgvector-4169E1?logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Docker Ready](https://img.shields.io/badge/Docker-Compose_Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## 1. Project Overview

**KissanDost AI** is an end-to-end agricultural decision-support platform engineered for smallholder farmers across **Khyber Pakhtunkhwa (KP), Pakistan** (*Mardan, Swabi, Charsadda, Peshawar, Nowshera, Malakand, Swat, Dera Ismail Khan, and Mansehra*).

Smallholder farmers in KP face three critical field challenges:
1. **Delayed or Inaccurate Crop Pathology Identification**: Fungal, viral, and bacterial infections (*Early Blight, Late Blight, Wheat Yellow Rust, Maize Northern Leaf Blight, Cotton Leaf Curl Virus, Cotton Bacterial Blight, Potato Blight, Chili Anthracnose, Onion Purple Blotch*) can destroy 30–70% of seasonal yield within days if misidentified.
2. **Weather-Induced Chemical Washout & Unsafe Tank Mixing**: Spraying fungicides right before unseasonal rain or high wind wastes PKR 4,000–8,000 per acre, while mixing incompatible or counterfeit pesticides damages crops.
3. **Literacy & Dialect Barriers**: Written technical manuals in English are inaccessible to many field farmers who rely on spoken **Pakistani Urdu** or **everyday Mardan Pashto (یوسفزئی / مردان پشتو)**.

**How KissanDost AI Solves It**:
- **3-Step Farmer-First Diagnosis Flow**:
  1. **📷 Upload Leaf Photo**: Automatic image clarity & leaf coverage validation (`blurScore` & `leafCoverage` gate) plus HSV biomarker segmentation (`healthyGreenPct`, `chloroticYellowPct`, `necroticBrownPct`, `lesionCount`).
  2. **🌱 Select Crop**: The farmer taps their crop (**Tomato, Potato, Wheat, Maize, Chili, Cotton, or Onion**) — locking the crop across the entire pipeline and eliminating cross-crop misclassification.
  3. **📅 Enter Planting Age**: Automatically calculates exact **Crop Age (Days)** and **Growth Stage** (`Seedling`, `Vegetative`, `Flowering`, `Fruiting`, `Maturity`).
- **Silent Hybrid Consensus Engine**: Runs both the **LeafVision Disease Model** (returning crop-locked Top-3 disease candidates) and **Google Gemini Multimodal Vision** (`gemini-3.8-flash` with fallback to `gemini-2.5-flash`) in parallel, combining both models behind the scenes to deliver a single, authoritative diagnosis without exposing confusing technical metrics to the farmer.
- **Minimalist Farmer Recommendation UI**: Strips away AI confidence percentages, model telemetry, and internal consensus logs — presenting only:
  1. **🔊 Local Language Voice Output** (One-tap Pakistani Urdu & Mardan Pashto audio right at the top)
  2. **🌿 Disease Name & Crop**
  3. **💊 Clear Action Steps, Approved Medicine & Exact Dosage**
  4. **⏰ Best Time to Spray** (grounded in real-time district weather)
- **Accurate Real-Time Weather Engine (Google Maps Platform Weather API + Time-Indexed Open-Meteo)**: Queries Google Maps Platform Weather API (`weather.googleapis.com/v1/currentConditions:lookup` & `forecast/hours:lookup`) with automatic fallback to time-indexed Open-Meteo matched to the **current Pakistan Standard Time (`Asia/Karachi`) hour** and WMO weather codes.

---

## 2. Final Hybrid Diagnosis Architecture

```text
📷 Step 1: Farmer Uploads Leaf Image
          │  (Automatic Blur & Leaf Coverage Gate + HSV Biomarker Extraction)
          ▼
🌱 Step 2: Farmer Selects Crop
          │  (Tomato, Potato, Wheat, Maize, Chili, Cotton, Onion — Crop-Locked)
          ▼
📅 Step 3: Farmer Selects Planting Age (Days Since Planting)
          │  (Calculates Crop Age & Growth Stage: Seedling → Vegetative → Flowering → Fruiting → Maturity)
          ▼
🤖 Step 4: Silent Hybrid Disease Detection (Parallel Execution)
          │
          ├── 🧠 LeafVision Disease Model (Crop-Locked Top-3 Disease Candidates + HSV Lesion Biomarkers)
          │
          └── 👁️ Gemini Multimodal Vision (Locked to Farmer's Crop — Verifies Visual Lesions & Severity)
          │
          ▼
🤝 Step 5: Unified Backend Consensus & Rule-Based Decision Engine
          │  (Merges Gemini + LeafVision Top-3 + Growth Stage + District Weather + KP RAG Guidelines)
          ▼
🌦️ Step 6: Real-Time Weather Verification
          │  (Google Maps Platform Weather API / Time-Indexed Asia/Karachi Open-Meteo Next-6h Rain & Wind Check)
          ▼
🔊 Step 7: Minimalist Farmer Recommendation View
             • Pakistani Urdu & Mardan Pashto Voice Output (500ms Leading Silence WAV Buffer)
             • Disease Name
             • Clear Action Steps + Approved Medicine & Dosage
             • Best Time to Spray
```

---

## 3. Upgraded Weather Intelligence (`Google Maps Platform Weather API` + `Time-Indexed Open-Meteo`)

### Why the Weather Engine Was Upgraded
Previously, slicing `hourly.precipitation_probability.slice(0, 6)` from Open-Meteo inspected `00:00–05:00` midnight instead of the **current hour**, occasionally flagging clear afternoon skies as "Rain Expected".

### How It Works Now (`src/backend/weather/weatherService.ts` & `backend/app/weather/weather_service.py`)
1. **Primary — Google Maps Platform Weather API (`weather.googleapis.com/v1`)**:
   - When `GOOGLE_MAPS_PLATFORM_KEY` (or `GOOGLE_WEATHER_API_KEY`) is configured, the backend queries:
     - `GET https://weather.googleapis.com/v1/currentConditions:lookup`
     - `GET https://weather.googleapis.com/v1/forecast/hours:lookup?hours=6`
   - Includes the official `X-Goog-Maps-Solution-ID: gmp_git_agentskills_v1` header and evaluates real-time temperature, relative humidity, wind speed, QPF precipitation, and the next 6 hours of precipitation probabilities.
2. **Zero-Key Fallback — Time-Indexed Open-Meteo (`Asia/Karachi`)**:
   - Matches `data.current.time` (`YYYY-MM-DDTHH`) against `data.hourly.time` in **Pakistan Standard Time (`Asia/Karachi`, UTC+5)** so the 6-hour rain forecast window always starts at the **exact current hour**.
   - Cross-checks WMO `weather_code` (`0–3` Clear/Cloudy, `45–48` Fog, `51–67` Drizzle/Rain, `80–82` Showers, `95–99` Thunderstorm) and live `precipitation` (`mm`) so sunny days are never falsely marked as rainy.

---

## 4. Supported Crops & Crop-Locked Pathology Rules

The Rule-Based Decision Engine (`src/backend/diagnosis/decisionEngine.ts`) provides dedicated agronomic rules, KP-approved medicines, dosages, pre-harvest intervals (PHI), and localized Urdu & Mardan Pashto voice scripts across **7 core KP crops**:

| Crop | Primary Diseases Covered | Approved KP Treatment & Dosage |
| :--- | :--- | :--- |
| **Tomato (`ٹماٹر`)** | Early Blight (*Alternaria solani*), Late Blight (*Phytophthora infestans*), Tomato Leaf Curl Virus | `Mancozeb 75% WP` (600–800g/acre), `Metalaxyl + Mancozeb (Ridomil Gold 68 WP)` (500g/acre) |
| **Cotton (`کپاس`)** | Cotton Bacterial Blight / Leaf Spot, Cotton Leaf Curl Virus (CLCuV) + Whitefly Vector | `Copper Oxychloride 50% WP` (500g/acre for Leaf Spot/Blight), `Flonicamid 50% WG (Ulala)` (60–80g/acre for Whitefly/CLCuV) |
| **Potato (`آلو`)** | Potato Early Blight, Potato Late Blight | `Mancozeb 75% WP` (600–800g/acre), `Ridomil Gold 68 WP` (500g/acre) |
| **Wheat (`گندم`)** | Wheat Yellow / Stripe Rust (*Puccinia striiformis*), Loose Smut, Aphid Complex | `Propiconazole 25% EC (Tilt)` (200ml in 100L water/acre) |
| **Maize (`مکئی`)** | Northern Corn Leaf Blight (*Exserohilum turcicum*), Fall Armyworm, Stalk Rot | `Azoxystrobin + Difenoconazole (Amistar Top 325 SC)` (200ml/acre) |
| **Chili (`مرچ`)** | Chili Leaf Curl Virus, Anthracnose / Fruit Rot, Cercospora Leaf Spot | `Mancozeb + Metalaxyl` or `Copper Oxychloride 50% WP` (400–500g/acre) + `Imidacloprid` for vectors |
| **Onion (`پیاز`)** | Onion Purple Blotch (*Alternaria porri*), Downy Mildew, Thrips | `Mancozeb 75% WP` or `Chlorothalonil` (500g in 100L water/acre) |

---

## 5. AI Spray Advisor & Medicine Checker (`src/components/PesticideVerifier.tsx`)

Accessible from the **Medicine (`دوائی چیک`)** tab, the Medicine Checker is designed around clear, low-literacy visual & voice verdicts:
1. **Two Verification Scopes**:
   - **Check for My Scanned Crop**: Automatically syncs with the farmer's latest scanned crop & disease (or lets the farmer pick any crop/disease) and gives a direct **Green (Matched & Genuine)** or **Red (Not Suitable / Fake / Banned)** verdict.
   - **General Bottle Check**: Checks whether a bottle is genuine and lists which crops and diseases it actually treats.
2. **Three Simple Input Modes**:
   - **📷 Scan Bottle (OCR + Vision AI)**: Tap the bottle photo box to choose **Use Camera** or **Upload from Mobile**, preview the photo, and press **Submit & Start Scanning**. Uses Gemini Vision OCR to read Brand Name, Active Ingredient, Product Type, Target Crops, and Target Diseases (with dynamic OCR fallback for bottles outside the local registry), flags counterfeit/expired bottles and herbicides (e.g., `Paraquat`), and deduplicates localized disease names.
   - **🔍 Search by Name**: Instant lookup across KP-approved fungicides, insecticides, and banned chemicals.
   - **📦 Scan Barcode**: Quick barcode lookup when bottle labels are muddy or unreadable.
3. **Minimalist Color-Coded Verdict & Voice Guidance**:
   - **Green Verdict Card**: Shows a short 1-sentence confirmation + **اردو میں سنیں** / **په پښتو واورئ** voice playback buttons (the full spoken script runs strictly via TTS audio and is never dumped onto the card) + 4 easy-to-read instruction cards (**Target Crops & Diseases**, **How to Use & Exact Dosage**, **When to Spray**, **When to Recheck & Harvest Wait**).
   - **Red Mismatch / Danger Card**: Clearly warns that the product does not match (or is a weed killer/fake), explains **what the product is actually used for** inside the red card, hides unnecessary dosage steps, and shows a **Recommended Safe Alternative** card right below.

---

## 6. Project Directory Structure

```text
KissanDost-AI/
├── server.ts                                    # Unified Port 3000 Express + Vite full-stack server
├── package.json                                 # Node.js scripts (dev, local, setup, doctor, build, lint)
├── .env.example                                 # Environment template (GEMINI_API_KEY, GOOGLE_MAPS_PLATFORM_KEY)
├── start-local.bat                              # One-click Windows launcher
├── start-local.sh                               # One-click macOS / Linux / Git Bash launcher
├── docker-compose.yml                           # Multi-container orchestration (App + FastAPI + pgvector + Redis)
├── src/
│   ├── App.tsx                                  # Main shell: Compact 56px header, Hero CTA, Weather bar, 5-tab bottom nav
│   ├── components/
│   │   ├── Header.tsx                           # Single-row top bar: Brand, اردو/پښتو/EN switcher, Voice Guide & Alerts
│   │   ├── CropScanModal.tsx                    # 3-Step Farmer Scan Modal (Photo → Select Crop → Planting Age)
│   │   ├── RecommendationView.tsx               # Minimalist Farmer View (Voice, Disease, Action Steps, Spray Time)
│   │   ├── PesticideVerifier.tsx                # Medicine Checker (Camera/Gallery OCR, Name Search, Barcode, Voice)
│   │   ├── VoiceGuideModal.tsx                  # Interactive Urdu & Mardan Pashto Voice Assistant (collapsed transcript)
│   │   ├── FarmManager.tsx                      # Farm registry & longitudinal scan history
│   │   └── CommunityIntelligence.tsx            # District outbreak alerts
│   ├── ml/
│   │   └── cropDiseaseModel.ts                  # 2-Layer MLP Neural Network + Agronomic Lesion Guards
│   ├── utils/
│   │   └── audioSpeech.ts                       # Pre-buffered WAV player with 500ms silence guard
│   └── backend/
│       ├── api/v1Router.ts                      # Express /api/v1/* REST router
│       ├── pipelines/diagnosisPipeline.ts       # Crop-locked hybrid diagnosis orchestrator
│       ├── vision/imagePipeline.ts              # Image quality gate, HSV segmentation & Top-3 crop candidates
│       ├── diagnosis/decisionEngine.ts          # Deterministic agronomy rules for 7 KP crops
│       ├── weather/weatherService.ts            # Google Weather API + Time-indexed Asia/Karachi Open-Meteo
│       ├── medicine/medicineService.ts          # Bottle OCR, Barcode, Tank-Mix & Registry verifier
│       ├── rag/ragService.ts                    # KP Agriculture Extension & ARI Tarnab vector RAG
│       └── llm/geminiService.ts                 # Crop-locked Gemini Vision & 500ms-padded WAV TTS
└── backend/                                     # Standalone Python 3.12+ FastAPI microservice mirror (Port 8000)
    ├── app/
    │   ├── main.py
    │   ├── api/v1/routes.py
    │   ├── pipelines/diagnosis_pipeline.py
    │   ├── vision/vision_pipeline.py
    │   ├── diagnosis/decision_engine.py
    │   ├── weather/weather_service.py
    │   ├── medicine/medicine_service.py
    │   ├── rag/rag_service.py
    │   └── llm/gemini_client.py
    └── tests/
        └── test_ai_pipeline.py                  # Pytest suite for API, HSV pipeline, and Decision Engine
```

---

## 7. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/diagnosis` | Runs the crop-locked hybrid diagnosis pipeline on an uploaded leaf image |
| `POST` | `/api/v1/medicine/scan-bottle` | **AI Spray Advisor**: OCR + Vision bottle scan, counterfeit/expiry check, 9-point compatibility & dosage |
| `POST` | `/api/v1/medicine/barcode` | Instant pesticide barcode database lookup |
| `POST` | `/api/v1/medicine/compare` | Side-by-side comparison of Medicine A vs Medicine B |
| `POST` | `/api/v1/medicine/mix-check` | **Conservative Tank-Mix Advisor**: Evaluates if Medicine A + B can be safely mixed |
| `GET/POST` | `/api/v1/medicine/history` | Retrieves or records farmer medicine scan & spray history |
| `POST` | `/api/v1/medicine/check` | Checks chemical trade names against the KP plant protection registry |
| `POST` | `/api/v1/voice/query` | Synthesizes Pakistani Urdu (`ur`) or Mardan Pashto (`ps`) WAV audio with 500ms leading silence |
| `GET` | `/api/v1/weather?district=Mardan` | Returns real-time district weather (Google Weather API / Time-indexed Open-Meteo) |
| `GET` | `/api/v1/community/outbreaks` | Returns village and district disease outbreak clusters |
| `GET` | `/api/v1/history?page=1&limit=20` | Returns paginated diagnosis scan history |
| `POST` | `/api/v1/feedback` | Records farmer helpfulness feedback |
| `GET` | `/api/v1/health` | Returns service health and active pipeline status |

---

## 8. Setup & Local Execution (Windows, macOS, Linux & Docker)

### 1. One-Command Local Setup
```bash
npm install
npm run setup
```
Configure your `.env` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
# Optional: Google Maps Platform Weather API key (falls back to time-indexed Open-Meteo automatically)
GOOGLE_MAPS_PLATFORM_KEY=your_google_maps_weather_api_key_here
PORT=3000
```

### 2. Run the Unified Full-Stack Server (Port 3000)
```bash
npm run dev
# Or double-click start-local.bat (Windows) / run bash start-local.sh (macOS/Linux)
```
Open **`http://localhost:3000`**. Both the React frontend and `/api/v1/*` backend routes run together on Port 3000.

### 3. Verify Build, Lint & Tests
```bash
npm run lint
npm run build
cd backend && pytest -v
```

---

## 9. Deploy to Vercel (GitHub Import or CLI)

This repository includes `vercel.json`, `api/index.js` + `src/backend/vercelApp.ts` + `scripts/build-vercel-api.mjs` (which bundles `dist-api/index.js` during `npm run build` as a zero-TS-error Vercel serverless Express adapter for `/api/v1/*`), `.vercelignore`, and client-side camera photo compression (to stay safely below Vercel's 4.5 MB request payload limit) while preserving `server.ts` on Port 3000 for local development.

1. Push the repository to **GitHub**.
2. In **Vercel**, click **Add New Project** → import your GitHub repository (Framework Preset: **Vite**, Build Command: `npm run build`, Output Directory: `dist`).
3. Add the following **Environment Variables** in Vercel Project Settings:
   - `GEMINI_API_KEY` *(Required for Vision diagnosis, bottle OCR, and Gemini TTS)*
   - `GEMINI_VISION_MODEL`=`gemini-4-hydrogen` *(Optional)*
   - `GEMINI_TTS_MODEL`=`gemini-3.8-flash-lite-tts` *(Optional)*
   - `GOOGLE_MAPS_PLATFORM_KEY` *(Optional — falls back to time-indexed Open-Meteo automatically)*
   - `NODE_ENV`=`production`
4. Click **Deploy** (or run `npx vercel --prod` from the project root).

