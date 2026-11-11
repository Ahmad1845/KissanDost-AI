from typing import List, Dict, Any
import numpy as np


KNOWLEDGE_CORPUS: List[Dict[str, Any]] = [
    {
        "id": "kb-tomato-early-blight",
        "crop": "Tomato",
        "disease": "Early Blight (Alternaria solani)",
        "title": "KP Agriculture Extension Manual: Tomato Early & Late Blight Management",
        "source": "Directorate General of Agriculture Extension, Khyber Pakhtunkhwa",
        "rules": [
            "Delay fungicide application if 6-hour rain probability exceeds 40% to prevent chemical washout.",
            "Apply Mancozeb 75% WP at 600-800g per 100L water per acre during calm morning hours (7:00 AM - 10:00 AM).",
            "Enforce a 7-day pre-harvest interval (PHI) before picking tomatoes.",
        ],
        "approvedTreatments": [
            {
                "name": "Mancozeb 75% WP (Dithane M-45)",
                "dosage": "600 to 800 grams in 100 litres of water for 1 Acre",
                "withholding": "Stop spraying 7 days before picking tomatoes",
                "ppe": "Cover nose and mouth with a clean cloth and wash hands with soap after spraying",
            }
        ],
        "organicAlternatives": [
            "5% Neem seed kernel water extract spray",
            "Prune and bury lower infected leaves outside the field",
        ],
    },
    {
        "id": "kb-wheat-yellow-rust",
        "crop": "Wheat",
        "disease": "Yellow Stripe Rust (Puccinia striiformis)",
        "title": "PARC & Tarnab Research Institute: Wheat Yellow Rust Advisory for KP",
        "source": "Agricultural Research Institute (ARI) Tarnab, Peshawar",
        "rules": [
            "Wait until heavy morning dew dries completely (after 9:00 AM) before spraying Propiconazole.",
            "Enforce a strict 28-day pre-harvest withholding interval before wheat harvesting.",
        ],
        "approvedTreatments": [
            {
                "name": "Tilt 250 EC (Propiconazole)",
                "dosage": "200 ml in 100 litres of water for 1 Acre",
                "withholding": "Stop spraying 28 days before harvesting wheat",
                "ppe": "Tie a clean cloth over nose and mouth and wear gloves while spraying",
            }
        ],
        "organicAlternatives": [
            "Spot-spray affected yellow patches early to prevent spore wind dispersal",
            "Clear grassy weeds along irrigation channels",
        ],
    },
    {
        "id": "kb-maize-leaf-blight",
        "crop": "Maize",
        "disease": "Northern Corn Leaf Blight (Exserohilum turcicum)",
        "title": "CCRI Pirsabak Nowshera: Maize Foliar Blight Protection Protocol",
        "source": "Cereal Crops Research Institute (CCRI) Pirsabak, Nowshera",
        "rules": [
            "Protect upper cob leaves during tasseling and silking stages.",
            "Wait 7 days after Mancozeb application before cutting maize stalks for livestock fodder.",
        ],
        "approvedTreatments": [
            {
                "name": "Mancozeb 75% WP",
                "dosage": "750 grams in 100 litres of water for 1 Acre",
                "withholding": "Wait 7 days before cutting for animal fodder",
                "ppe": "Cover nose and mouth with a clean cloth while spraying",
            }
        ],
        "organicAlternatives": [
            "Neem oil emulsion (2 ml per litre of water)",
            "Remove lower necrotic leaves touching wet soil",
        ],
    },
]


from app.embeddings.vector_scorer import vector_scorer


class AgriculturalRagService:
    """
    Retrieval-Augmented Generation (RAG) Service.
    Uses token-vector and domain similarity ranking over agricultural extension documents,
    verified medicines, and government advisories.
    """

    def retrieve_and_rank(
        self,
        crop: str,
        predicted_class: str,
        symptoms: List[str],
        district: str,
        top_k: int = 2,
    ) -> List[Dict[str, Any]]:
        query_text = f"{crop} {predicted_class.replace('_', ' ')} {' '.join(symptoms)} {district}"

        ranked: List[Dict[str, Any]] = []
        for doc in KNOWLEDGE_CORPUS:
            doc_text = f"{doc['crop']} {doc['disease']} {doc['title']} {' '.join(doc['rules'])}"
            is_crop_match = doc["crop"].lower() == crop.lower()
            score = vector_scorer.score_relevance(query_text, doc_text, is_crop_match)
            ranked.append({**doc, "relevanceScore": score})

        ranked.sort(key=lambda d: d["relevanceScore"], reverse=True)
        return ranked[:top_k]


rag_service = AgriculturalRagService()

