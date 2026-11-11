from typing import Dict, Any, Optional
from app.config.settings import get_settings
from app.utils.logger import logger

settings = get_settings()


class GeminiOrchestrator:
    """
    Stage 8: Google Gemini API Integration for RAG-Grounded Safe Recommendation Generation.
    """

    async def generate_safe_recommendation(
        self,
        mime_type: str,
        clean_base64: str,
        rag_context: list,
        decision_output: Dict[str, Any],
        weather: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        if not settings.gemini_api_key:
            return None

        try:
            from google import genai

            client = genai.Client(api_key=settings.gemini_api_key)
            prompt = (
                f"You are KissanDost AI. Ground your response strictly on the Decision Engine output: "
                f"{decision_output} and RAG context: {rag_context} and Weather: {weather}. "
                f"Provide simple, jargon-free advice in English, Pakistani Urdu (ur), and KP Pashto (ps)."
            )
            response = client.models.generate_content(
                model=settings.gemini_vision_model,
                contents=[prompt],
            )
            logger.info("GEMINI_RECOMMENDATION_GENERATED", model=settings.gemini_vision_model)
            return {"llmRawText": response.text}
        except Exception as exc:
            logger.warning("GEMINI_ORCHESTRATOR_FALLBACK", error=str(exc))
            return None


gemini_orchestrator = GeminiOrchestrator()
