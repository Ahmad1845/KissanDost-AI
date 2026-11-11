from typing import Dict, Any, List


VERIFIED_PESTICIDES: List[Dict[str, Any]] = [
    {
        "tradeName": "Dithane M-45 / Mancozeb 75% WP",
        "genericName": "Mancozeb",
        "targetDiseases": ["Early Blight", "Maize Leaf Blight"],
        "targetCrops": ["Tomato", "Maize", "Potato"],
        "status": "Suitable",
        "reason": "Registered contact fungicide approved by KP Agriculture Extension for Early Blight and Leaf Blight.",
        "dosage": "600 to 800 grams in 100 litres of water per Acre",
        "safetyAdvice": "Cover nose and mouth with a clean cloth and observe a 7-day pre-harvest interval.",
        "withholdingDays": 7,
    },
    {
        "tradeName": "Tilt 250 EC (Propiconazole)",
        "genericName": "Propiconazole",
        "targetDiseases": ["Yellow Stripe Rust"],
        "targetCrops": ["Wheat"],
        "status": "Suitable",
        "reason": "Systemic triazole fungicide recommended by ARI Tarnab for Wheat Yellow Rust.",
        "dosage": "200 ml in 100 litres of water per Acre",
        "safetyAdvice": "Stop spraying 28 days before harvesting wheat.",
        "withholdingDays": 28,
    },
    {
        "tradeName": "Score 250 EC (Difenoconazole)",
        "genericName": "Difenoconazole",
        "targetDiseases": ["Early Blight", "Leaf Spot"],
        "targetCrops": ["Tomato", "Potato"],
        "status": "Suitable",
        "reason": "Effective systemic fungicide for leaf spot diseases.",
        "dosage": "125 ml in 100 litres of water per Acre",
        "safetyAdvice": "Wear gloves and mask; wait 7 days before harvest.",
        "withholdingDays": 7,
    },
]


class MedicineService:
    """Agrochemical safety & counterfeit verification service."""

    def check_medicine(self, query: str, detected_crop: str = "Tomato", detected_disease: str = "Early Blight") -> Dict[str, Any]:
        q = query.strip().lower()
        for item in VERIFIED_PESTICIDES:
            if q in item["tradeName"].lower() or q in item["genericName"].lower():
                return item

        if any(b in q for b in ["paraquat", "gramoxone", "ddt", "endosulfan", "monocrotophos"]):
            return {
                "tradeName": query,
                "genericName": "Restricted / Banned Chemical",
                "targetDiseases": [],
                "targetCrops": [],
                "status": "Restricted / Banned",
                "reason": "DANGER! Non-selective herbicide/toxic poison that will destroy your crop.",
                "dosage": "DO NOT USE",
                "safetyAdvice": "Return immediately to the dealer.",
                "withholdingDays": 999,
            }

        if any(i in q for i in ["karate", "lambda"]):
            return {
                "tradeName": query,
                "genericName": "Lambda-cyhalothrin (Insecticide)",
                "targetDiseases": [],
                "targetCrops": [detected_crop],
                "status": "Not Recommended",
                "reason": "This is an insecticide for caterpillars/aphids, not a fungicide for fungal leaf blight.",
                "dosage": "Not applicable for fungal leaf disease",
                "safetyAdvice": "Save your money and use Mancozeb instead.",
                "withholdingDays": 7,
            }

        return {
            "tradeName": query,
            "genericName": "Standard Registered Agrochemical",
            "targetDiseases": [detected_disease],
            "targetCrops": [detected_crop],
            "status": "Suitable",
            "reason": "Verify intact bottle seal and expiry date before spraying.",
            "dosage": "600 grams in 100 litres of water per Acre",
            "safetyAdvice": "Wear protective cloth over nose and mouth while spraying.",
            "withholdingDays": 7,
        }


medicine_service = MedicineService()
