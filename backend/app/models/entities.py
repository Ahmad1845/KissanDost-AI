from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base


class FarmerUser(Base):
    __tablename__ = "farmer_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    phone_or_email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    preferred_language: Mapped[str] = mapped_column(String(10), default="ur")
    district: Mapped[str] = mapped_column(String(80), default="Mardan")
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DiagnosisRecord(Base):
    __tablename__ = "diagnosis_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    scan_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    farmer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("farmer_users.id"), nullable=True)
    district: Mapped[str] = mapped_column(String(80), index=True)
    village: Mapped[str] = mapped_column(String(120))
    crop: Mapped[str] = mapped_column(String(64), index=True)
    predicted_disease: Mapped[str] = mapped_column(String(160))
    severity: Mapped[str] = mapped_column(String(32))
    confidence: Mapped[float] = mapped_column(Float)
    biomarkers_json: Mapped[dict] = mapped_column(JSON)
    weather_snapshot_json: Mapped[dict] = mapped_column(JSON)
    recommendation_json: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class OutbreakReport(Base):
    __tablename__ = "outbreak_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    report_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    district: Mapped[str] = mapped_column(String(80), index=True)
    village: Mapped[str] = mapped_column(String(120))
    crop: Mapped[str] = mapped_column(String(64))
    disease: Mapped[str] = mapped_column(String(160))
    severity: Mapped[str] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class FeedbackRecord(Base):
    __tablename__ = "feedback_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    scan_id: Mapped[str] = mapped_column(String(64), index=True)
    rating: Mapped[int] = mapped_column(Integer, default=5)
    helpful: Mapped[bool] = mapped_column(Boolean, default=True)
    comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
