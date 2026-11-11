"""Multi-Stage Crop Diagnosis Pipeline (backend/app/pipelines/diagnosis_pipeline.py)."""
from typing import Dict, Any
from app.schemas.domain import DiagnosisRequest
from app.vision.vision_pipeline import vision_pipeline
from app.rag.rag_service import rag_service
from app.weather.weather_service import weather_service
from app.diagnosis.decision_engine import decision_engine
from app.llm.gemini_client import gemini_orchestrator


class CropDiagnosisPipeline:
    """
    Executes the multi-stage crop diagnosis pipeline:
      1. Image Validation
      2. OpenCV Preprocessing & Biomarker Extraction
      3. Disease Detection
      4. Weather API Retrieval
      5. RAG Knowledge Retrieval
      6. Rule-Based Decision Engine
      7. Gemini Grounded Synthesis
    """

    async def execute(self, payload: DiagnosisRequest) -> Dict[str, Any]:
        img_meta = vision_pipeline.validate_image(payload.imageBase64)

        biomarkers = vision_pipeline.preprocess_and_extract_biomarkers(
            clean_base64=img_meta["clean_base64"],
            provided_biomarkers=payload.biomarkers,
            sample_id=payload.sampleId or "",
            symptoms=payload.symptoms,
        )

        weather = await weather_service.get_district_weather(payload.district)

        ml_result = vision_pipeline.detect_disease_and_score_confidence(
            crop_hint=payload.cropHint,
            biomarkers=biomarkers,
            symptoms=payload.symptoms,
            weather=weather,
            sample_id=payload.sampleId or "",
        )

        rag_docs = rag_service.retrieve_and_rank(
            crop=payload.cropHint,
            predicted_class=ml_result["predictedClassId"],
            symptoms=payload.symptoms,
            district=payload.district,
        )

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

        if not img_meta["is_synthetic_sample"]:
            await gemini_orchestrator.generate_safe_recommendation(
                mime_type=img_meta["mime_type"],
                clean_base64=img_meta["clean_base64"],
                rag_context=rag_docs,
                decision_output=decision,
                weather=weather,
            )

        return {
            "decision": decision,
            "weather": weather,
            "rag_docs": rag_docs,
            "ml_result": ml_result,
        }


diagnosis_pipeline = CropDiagnosisPipeline()
