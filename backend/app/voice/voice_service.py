from typing import Dict, Any
from app.config.settings import get_settings
from app.utils.logger import logger

settings = get_settings()


class VoiceService:
    """
    Multilingual Voice Synthesis Service using Google Gemini TTS API
    for Urdu (اردو), Pashto (پښتو), and English farmer audio guidance.
    """

    async def synthesize_speech(
        self, text: str, lang: str = "ur", voice_persona: str = "elder"
    ) -> Dict[str, Any]:
        voice_name = "Kore" if voice_persona == "female" else "Charon"
        if settings.gemini_api_key:
            try:
                from google import genai  # type: ignore

                client = genai.Client(api_key=settings.gemini_api_key)
                response = client.models.generate_content(
                    model=settings.gemini_tts_model,
                    contents=text,
                    config={
                        "response_modalities": ["AUDIO"],
                        "speech_config": {
                            "voice_config": {
                                "prebuilt_voice_config": {"voice_name": voice_name}
                            }
                        },
                    },
                )
                part = response.candidates[0].content.parts[0]
                if getattr(part, "inline_data", None) and part.inline_data.data:
                    return {
                        "success": True,
                        "engine": "gemini-tts",
                        "voice": voice_name,
                        "mimeType": "audio/wav",
                        "audioBase64": part.inline_data.data,
                    }
            except Exception as exc:
                logger.info("GEMINI_TTS_FALLBACK", reason=str(exc))

        return {
            "success": True,
            "engine": "script-only",
            "voice": voice_name,
            "text": text,
            "lang": lang,
        }


voice_service = VoiceService()
