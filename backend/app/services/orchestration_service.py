import time
from datetime import datetime
from typing import Dict, Any
from fastapi import BackgroundTasks
from app.schemas.domain import DiagnosisRequest
from app.ai.vision_pipeline import vision_pipeline
from app.rag.rag_service import rag_service
from app.weather.weather_service import weather_service
from app.diagnosis.decision_engine import decision_engine
from app.ai.gemini_orchestrator import gemini_orchestrator
from app.repositories.diagnosis_repository import diagnosis_repository


class DiagnosisOrchestrationService:
    """
    10-Stage AI Pipeline Orchestrator:
      1. Image Validation
      2. Image Preprocessing (OpenCV CLAHE & HSV Segmentation)
      3. Disease Detection (MLP Classifier)
      4. Confidence Scoring (Multi-Signal Calibration)
      5. RAG Knowledge Retrieval (Cosine Similarity Ranking)
      6. Weather Retrieval (Open-Meteo + Spray Window)
      7. Decision Engine (Deterministic Agronomic Rules)
      8. Safe Recommendation Generation (Gemini Grounded Synthesis)
      9. Voice Response Readiness
      10. API Response & Background Tasks
    """

    async def run_pipeline(
        self, payload: DiagnosisRequest, background_tasks: BackgroundTasks
    ) -> Dict[str, Any]:
        t0 = time.perf_counter()

        # Stage 1: Image Validation
        img_meta = vision_pipeline.validate_image(payload.imageBase64)

        # Stage 2: Image Preprocessing & Biomarker Extraction
        biomarkers = vision_pipeline.preprocess_and_extract_biomarkers(
            clean_base64=img_meta["clean_base64"],
            provided_biomarkers=payload.biomarkers,
            sample_id=payload.sampleId or "",
            symptoms=payload.symptoms,
        )

        # Stage 6: Weather Retrieval
        weather = await weather_service.get_district_weather(payload.district)

        # Stages 3 & 4: Disease Detection & Confidence Scoring
        ml_result = vision_pipeline.detect_disease_and_score_confidence(
            crop_hint=payload.cropHint,
            biomarkers=biomarkers,
            symptoms=payload.symptoms,
            weather=weather,
            sample_id=payload.sampleId or "",
        )

        # Stage 5: RAG Knowledge Retrieval
        rag_docs = rag_service.retrieve_and_rank(
            crop=payload.cropHint,
            predicted_class=ml_result["predictedClassId"],
            symptoms=payload.symptoms,
            district=payload.district,
        )

        # Stage 7: Decision Engine
        decision = decision_engine.evaluate(
            predicted_class=ml_result["predictedClassId"],
            confidence_score=ml_result["confidence"],
            crop=payload.cropHint,
            growth_stage=payload.growthStage,
            weather=weather,
            district=payload.district,
            rag_docs=rag_docs,
            biomarkers=biomarkers.model_dump(),
        )

        # Stage 8: Safe Recommendation Generation via Gemini
        if not img_meta["is_synthetic_sample"]:
            await gemini_orchestrator.generate_safe_recommendation(
                mime_type=img_meta["mime_type"],
                clean_base64=img_meta["clean_base64"],
                rag_context=rag_docs,
                decision_output=decision,
                weather=weather,
            )

        scan_id = f"scan-{int(time.time() * 1000)}"
        elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)

        result_record = {
            **decision,
            "scanId": scan_id,
            "district": payload.district,
            "weatherSnapshot": weather,
            "groundedSources": [
                {"title": d["title"], "source": d["source"], "relevanceScore": d["relevanceScore"]}
                for d in rag_docs
            ],
            "scanTimestamp": datetime.utcnow().isoformat(),
            "pipelineExecutionMs": elapsed_ms,
            "mlPrediction": ml_result,
        }

        # Stage 10: Schedule Async Background Persistence
        background_tasks.add_task(diagnosis_repository.save_diagnosis, result_record)
        if payload.consentToShare and decision["severity"] != "Healthy":
            background_tasks.add_task(
                diagnosis_repository.log_outbreak,
                {
                    "district": payload.district,
                    "village": payload.village,
                    "crop": decision["crop"],
                    "disease": decision["disease"],
                    "severity": decision["severity"],
                },
            )

        return {
            "success": True,
            "scanId": scan_id,
            "result": result_record,
        }


orchestration_service = DiagnosisOrchestrationService()
