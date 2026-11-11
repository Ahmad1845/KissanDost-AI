import time
from datetime import datetime
from typing import Dict, Any
from fastapi import BackgroundTasks
from app.schemas.domain import DiagnosisRequest
from app.pipelines.diagnosis_pipeline import diagnosis_pipeline
from app.repositories.diagnosis_repository import diagnosis_repository


class DiagnosisOrchestrationService:
    """
    Orchestrates the CropDiagnosisPipeline (`pipelines/diagnosis_pipeline.py`)
    and schedules async background persistence and outbreak logging.
    """

    async def run_pipeline(
        self, payload: DiagnosisRequest, background_tasks: BackgroundTasks
    ) -> Dict[str, Any]:
        t0 = time.perf_counter()

        pipeline_out = await diagnosis_pipeline.execute(payload)
        decision = pipeline_out["decision"]
        weather = pipeline_out["weather"]
        rag_docs = pipeline_out["rag_docs"]
        ml_result = pipeline_out["ml_result"]

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
