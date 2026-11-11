from typing import List, Dict, Any


class OutbreakClusterDetector:
    """Epidemiological cluster detector for district-level crop disease outbreaks."""

    def evaluate_risk_level(self, active_count: int) -> str:
        if active_count >= 20:
            return "High Risk"
        if active_count >= 10:
            return "Watch"
        return "Normal"

    def aggregate_district_clusters(
        self, base_districts: List[Dict[str, Any]], live_reports: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        counts: Dict[str, int] = {}
        for rep in live_reports:
            dist = rep.get("district", "Mardan")
            counts[dist] = counts.get(dist, 0) + 1

        results: List[Dict[str, Any]] = []
        for d in base_districts:
            live = counts.get(d["district"], 0)
            total = d["activeOutbreaks"] + live
            results.append(
                {
                    **d,
                    "activeOutbreaks": total,
                    "recentLiveReports": live,
                    "riskLevel": self.evaluate_risk_level(total),
                }
            )
        return results


cluster_detector = OutbreakClusterDetector()
