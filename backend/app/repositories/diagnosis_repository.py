from datetime import datetime
from typing import List, Dict, Any, Optional


class DiagnosisRepository:
    """
    Repository Pattern for Diagnosis History, Outbreak Reports, and Farmer Feedback.
    Provides async-compatible data access with pagination.
    """

    def __init__(self) -> None:
        self._history: List[Dict[str, Any]] = []
        self._outbreaks: List[Dict[str, Any]] = [
            {
                "id": "rep-001",
                "district": "Mardan",
                "village": "Gujar Garhi",
                "crop": "Tomato",
                "disease": "Early Blight",
                "severity": "Moderate",
                "timestamp": datetime.utcnow().isoformat(),
            }
        ]
        self._feedbacks: List[Dict[str, Any]] = []

    async def save_diagnosis(self, record: Dict[str, Any]) -> Dict[str, Any]:
        self._history.insert(0, record)
        return record

    async def get_paginated_history(
        self, page: int = 1, limit: int = 20, district: Optional[str] = None
    ) -> Dict[str, Any]:
        items = (
            [h for h in self._history if h.get("district", "").lower() == district.lower()]
            if district
            else self._history
        )
        start = max(0, (page - 1) * limit)
        sliced = items[start : start + limit]
        return {
            "items": sliced,
            "pagination": {
                "page": page,
                "limit": limit,
                "totalItems": len(items),
                "totalPages": max(1, (len(items) + limit - 1) // limit),
            },
        }

    async def log_outbreak(self, report: Dict[str, Any]) -> None:
        self._outbreaks.insert(0, {**report, "timestamp": datetime.utcnow().isoformat()})

    async def list_outbreaks(self) -> List[Dict[str, Any]]:
        return self._outbreaks

    async def save_feedback(self, feedback: Dict[str, Any]) -> Dict[str, Any]:
        entry = {**feedback, "createdAt": datetime.utcnow().isoformat()}
        self._feedbacks.insert(0, entry)
        return entry


diagnosis_repository = DiagnosisRepository()
