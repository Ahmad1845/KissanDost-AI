from typing import Dict, Any, List
from app.outbreak.cluster_detector import cluster_detector

BASE_KP_DISTRICTS: List[Dict[str, Any]] = [
    {
        "district": "Mardan",
        "activeOutbreaks": 24,
        "primaryCrop": "Tomato",
        "primaryDisease": "Early Blight (Alternaria)",
        "riskLevel": "High Risk",
    },
    {
        "district": "Swabi",
        "activeOutbreaks": 14,
        "primaryCrop": "Maize",
        "primaryDisease": "Northern Leaf Blight",
        "riskLevel": "Watch",
    },
    {
        "district": "Charsadda",
        "activeOutbreaks": 19,
        "primaryCrop": "Tomato",
        "primaryDisease": "Late Blight",
        "riskLevel": "Watch",
    },
    {
        "district": "Peshawar",
        "activeOutbreaks": 11,
        "primaryCrop": "Wheat",
        "primaryDisease": "Yellow Stripe Rust",
        "riskLevel": "Watch",
    },
    {
        "district": "Nowshera",
        "activeOutbreaks": 8,
        "primaryCrop": "Wheat",
        "primaryDisease": "Yellow Stripe Rust",
        "riskLevel": "Normal",
    },
    {
        "district": "Malakand",
        "activeOutbreaks": 6,
        "primaryCrop": "Tomato",
        "primaryDisease": "Early Blight",
        "riskLevel": "Normal",
    },
]


class CommunityOutbreakService:
    """Community outbreak aggregation service for Khyber Pakhtunkhwa districts."""

    def get_outbreak_summary(self, live_reports: List[Dict[str, Any]]) -> Dict[str, Any]:
        districts = cluster_detector.aggregate_district_clusters(BASE_KP_DISTRICTS, live_reports)
        return {
            "summary": {
                "totalDistrictsMonitored": len(districts),
                "highRiskHotspots": sum(1 for d in districts if d["riskLevel"] == "High Risk"),
                "totalAnonymousReports": 1470 + len(live_reports),
            },
            "districts": districts,
            "recentAnonymousFeed": live_reports[:10],
        }


community_outbreak_service = CommunityOutbreakService()
