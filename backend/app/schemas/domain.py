from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field


class LeafBiomarkers(BaseModel):
    greenHealthyPct: float = Field(default=68.0, ge=0, le=100)
    yellowChloroticPct: float = Field(default=18.0, ge=0, le=100)
    brownNecroticPct: float = Field(default=14.0, ge=0, le=100)


class DiagnosisRequest(BaseModel):
    imageBase64: str = Field(..., description="Base64-encoded leaf image or data URL")
    sampleId: Optional[str] = ""
    cropHint: str = "Tomato"
    growthStage: Literal["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest"] = "Vegetative"
    symptoms: List[str] = Field(default_factory=list)
    biomarkers: Optional[LeafBiomarkers] = None
    district: str = "Mardan"
    village: str = "Gujar Garhi"
    consentToShare: bool = True


class ApprovedTreatmentSchema(BaseModel):
    name: str
    dosage: str
    withholding: str
    ppe: str


class WeatherSnapshotSchema(BaseModel):
    district: str
    temperature: int
    humidity: int
    windSpeed: int
    precipitation: float
    rainProbability: int
    condition: str
    spraySuitability: str
    weatherAdvice: str


class DecisionEngineOutputSchema(BaseModel):
    crop: str
    disease: str
    severity: Literal["Healthy", "Mild", "Moderate", "Severe"]
    confidence: int
    action: str
    bestTime: str
    warnings: List[str]
    irrigationAdvice: str
    confidenceExplanation: str
    why: List[str]
    detailedExplanation: str
    approvedTreatments: List[ApprovedTreatmentSchema]
    organicAlternatives: List[str]
    nextReviewDays: int
    consultOfficer: bool
    translations: Dict[str, Any]


class VoiceQueryRequest(BaseModel):
    text: str = Field(..., min_length=2)
    lang: Literal["ur", "ps", "en"] = "ur"
    voicePersona: Literal["elder", "female"] = "elder"


class MedicineCheckRequest(BaseModel):
    query: str = Field(..., min_length=1)
    detectedCrop: str = "Tomato"
    detectedDisease: str = "Early Blight"


class FeedbackRequest(BaseModel):
    scanId: str
    rating: int = Field(default=5, ge=1, le=5)
    helpful: bool = True
    comments: Optional[str] = ""
