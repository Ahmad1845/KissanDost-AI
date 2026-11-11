import pytest
from app.vision.vision_pipeline import vision_pipeline
from app.rag.rag_service import rag_service
from app.diagnosis.decision_engine import decision_engine
from app.medicine.medicine_service import medicine_service


def test_stage_1_and_2_image_validation_and_biomarkers():
    sample_b64 = "data:image/svg+xml;base64," + ("A" * 64)
    meta = vision_pipeline.validate_image(sample_b64)
    assert meta["is_valid"] is True
    assert meta["is_synthetic_sample"] is True

    biomarkers = vision_pipeline.preprocess_and_extract_biomarkers(
        clean_base64=meta["clean_base64"],
        sample_id="wheat_rust_sample",
        symptoms=["yellow_powder"],
    )
    assert biomarkers.greenHealthyPct == 62.0
    assert biomarkers.yellowChloroticPct == 31.0


def test_stage_5_rag_ranking():
    docs = rag_service.retrieve_and_rank(
        crop="Wheat",
        predicted_class="Wheat_Yellow_Rust",
        symptoms=["yellow_powder"],
        district="Mardan",
    )
    assert len(docs) > 0
    assert docs[0]["crop"] == "Wheat"
    assert docs[0]["relevanceScore"] > 0.4


def test_stage_7_decision_engine_rain_delay_rule():
    weather = {
        "district": "Mardan",
        "temperature": 24,
        "humidity": 82,
        "windSpeed": 8,
        "rainProbability": 65,
    }
    output = decision_engine.evaluate(
        predicted_class="Tomato_Early_Blight",
        confidence_score=95,
        crop="Tomato",
        growth_stage="Fruiting",
        weather=weather,
        district="Mardan",
        rag_docs=[],
        biomarkers={"greenHealthyPct": 68.0, "yellowChloroticPct": 18.0, "brownNecroticPct": 14.0},
    )
    assert output["severity"] == "Moderate"
    assert "Do NOT spray today" in output["action"]
    assert len(output["warnings"]) >= 1


def test_medicine_verification_service():
    banned = medicine_service.check_medicine("Paraquat")
    assert banned["status"] == "Restricted / Banned"

    valid = medicine_service.check_medicine("Mancozeb")
    assert valid["status"] == "Suitable"
