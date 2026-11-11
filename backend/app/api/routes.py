from typing import Optional
from fastapi import APIRouter, BackgroundTasks, Query, HTTPException
from app.schemas.domain import (
    DiagnosisRequest,
    VoiceQueryRequest,
    MedicineCheckRequest,
    FeedbackRequest,
)
from app.services.orchestration_service import orchestration_service
from app.voice.voice_service import voice_service
from app.medicine.medicine_service import medicine_service
from app.weather.weather_service import weather_service
from app.community.outbreak_service import community_outbreak_service
from app.repositories.diagnosis_repository import diagnosis_repository
from app.config.settings import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/health", tags=["System"])
async def health_check():
    """Health & readiness probe for container orchestration."""
    return {
        "status": "online",
        "service": settings.app_name,
        "version": settings.app_version,
        "pipelineStages": 10,
        "geminiConfigured": bool(settings.gemini_api_key),
    }


@router.post("/diagnosis", tags=["AI Diagnosis Pipeline"])
async def create_diagnosis(payload: DiagnosisRequest, background_tasks: BackgroundTasks):
    """Executes the 10-stage Computer Vision, RAG, Weather, and Decision Engine pipeline."""
    try:
        return await orchestration_service.run_pipeline(payload, background_tasks)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/voice/query", tags=["Voice AI (Whisper & TTS)"])
async def voice_query(payload: VoiceQueryRequest):
    """Synthesizes natural Pakistani Urdu, Yusufzai Pashto, or English voice responses."""
    return await voice_service.synthesize_speech(
        text=payload.text, lang=payload.lang, voice_persona=payload.voicePersona
    )


@router.post("/medicine/check", tags=["Agrochemical Verification"])
async def check_medicine(payload: MedicineCheckRequest):
    """Verifies pesticide authenticity, target crop suitability, and banned status."""
    product = medicine_service.check_medicine(
        query=payload.query,
        detected_crop=payload.detectedCrop,
        detected_disease=payload.detectedDisease,
    )
    return {"success": True, "product": product}


@router.post("/medicine/barcode", tags=["Agrochemical Verification"])
async def check_medicine_barcode(barcode: str = Query(..., description="EAN-13 pesticide bottle barcode")):
    """Instant barcode identification without AI latency when label image quality is poor."""
    return medicine_service.lookup_barcode(barcode)


@router.post("/medicine/mix-check", tags=["Agrochemical Verification"])
async def check_tank_mix(
    medicine_a: str = Query(..., description="First pesticide/fungicide name"),
    medicine_b: str = Query(..., description="Second pesticide/fungicide name"),
):
    """Conservative Tank-Mix Compatibility Advisor ('Can I Mix These Two Medicines?')."""
    result = medicine_service.check_tank_mix(medicine_a, medicine_b)
    return {"success": True, "mixResult": result}



@router.get("/weather", tags=["Meteorological Intelligence"])
async def get_weather(district: str = Query(default="Mardan")):
    """Retrieves real-time KP district weather and fungicide spray suitability."""
    weather = await weather_service.get_district_weather(district)
    return {"success": True, "weather": weather}


@router.get("/community/outbreaks", tags=["Epidemiological Surveillance"])
async def get_community_outbreaks():
    """Returns aggregated district disease outbreak clusters across Khyber Pakhtunkhwa."""
    live_reports = await diagnosis_repository.list_outbreaks()
    data = community_outbreak_service.get_outbreak_summary(live_reports)
    return {"success": True, **data}


@router.get("/history", tags=["Diagnosis History"])
async def get_diagnosis_history(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    district: Optional[str] = Query(default=None),
):
    """Returns paginated historical leaf diagnosis records."""
    history = await diagnosis_repository.get_paginated_history(page=page, limit=limit, district=district)
    return {"success": True, **history}


@router.post("/feedback", tags=["Farmer Feedback & RLHF"])
async def submit_feedback(payload: FeedbackRequest):
    """Stores farmer feedback for continuous model calibration."""
    saved = await diagnosis_repository.save_feedback(payload.model_dump())
    return {"success": True, "feedback": saved}
