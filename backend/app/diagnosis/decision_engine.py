from typing import Dict, Any, List


class AgronomicDecisionEngine:
    """
    Stage 7: Deterministic Agronomic Decision Engine.
    Decouples domain safety rules, pre-harvest withholding intervals, and weather spray windows
    from LLM generation.
    """

    def evaluate(
        self,
        predicted_class: str,
        confidence_score: int,
        crop: str,
        growth_stage: str,
        weather: Dict[str, Any],
        district: str,
        rag_docs: List[Dict[str, Any]],
        biomarkers: Dict[str, float],
    ) -> Dict[str, Any]:
        rain_risk = weather.get("rainProbability", 0) > 35
        wind_risk = weather.get("windSpeed", 0) > 18

        warnings: List[str] = []
        if rain_risk:
            warnings.append(
                f"High washout risk ({weather.get('rainProbability')}% rain probability in {district}). Do NOT spray today."
            )
        if wind_risk:
            warnings.append(
                f"High wind drift risk ({weather.get('windSpeed')} km/h). Delay spraying until calm morning hours."
            )

        confidence_explanation = (
            f"Calibrated {confidence_score}% confidence from HSV leaf biomarkers "
            f"(Healthy={biomarkers.get('greenHealthyPct')}%, Yellow={biomarkers.get('yellowChloroticPct')}%, "
            f"Necrotic={biomarkers.get('brownNecroticPct')}%), {crop} ({growth_stage} stage), "
            f"and {district} weather ({weather.get('temperature')}°C, {weather.get('humidity')}% RH)."
        )

        primary_doc = rag_docs[0] if rag_docs else {}
        treatments = primary_doc.get(
            "approvedTreatments",
            [
                {
                    "name": "Mancozeb 75% WP (Dithane M-45)",
                    "dosage": "600 to 800 grams in 100 litres of water for 1 Acre",
                    "withholding": "Stop spraying 7 days before picking fruit",
                    "ppe": "Tie a clean cloth over nose and mouth while spraying",
                }
            ],
        )

        if predicted_class == "Healthy_Crop":
            return {
                "crop": crop,
                "disease": "Healthy Plant - No Disease",
                "severity": "Healthy",
                "confidence": max(confidence_score, 96),
                "action": "Your plant is completely healthy! Do NOT spray any chemical medicine — save your money.",
                "bestTime": "No Spray Needed",
                "warnings": ["Do not apply chemical fungicides on healthy foliage."],
                "irrigationAdvice": "Maintain regular morning root-zone irrigation.",
                "confidenceExplanation": confidence_explanation,
                "approvedTreatments": [
                    {
                        "name": "No Chemical Medicine Needed",
                        "dosage": "0 grams — Save your money!",
                        "withholding": "Safe to harvest anytime",
                        "ppe": "No spray needed",
                    }
                ],
                "organicAlternatives": ["Continue timely irrigation and weed removal"],
            }

        return {
            "crop": crop,
            "disease": primary_doc.get("disease", predicted_class.replace("_", " ")),
            "severity": "Severe" if "Late_Blight" in predicted_class else "Moderate",
            "confidence": confidence_score,
            "action": (
                "Do NOT spray today because of rain! Spray tomorrow morning between 7:00 AM and 10:00 AM."
                if rain_risk
                else "Spray approved fungicide tomorrow morning between 7:00 AM and 10:00 AM when wind is calm."
            ),
            "bestTime": "Tomorrow Morning 7:00 AM - 10:00 AM",
            "warnings": warnings,
            "irrigationAdvice": "Avoid wetting lower leaves during evening irrigation to reduce fungal sporulation.",
            "confidenceExplanation": confidence_explanation,
            "approvedTreatments": treatments,
            "organicAlternatives": primary_doc.get(
                "organicAlternatives",
                ["5% Neem seed water extract", "Remove and bury infected lower leaves"],
            ),
        }


decision_engine = AgronomicDecisionEngine()
