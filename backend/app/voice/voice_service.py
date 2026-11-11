import base64
from typing import Dict, Any
from app.config.settings import get_settings
from app.utils.logger import logger

settings = get_settings()

EDGE_TTS_VOICE_MAP = {
    ("ur", "elder"): "ur-PK-AsadNeural",
    ("ur", "female"): "ur-PK-UzmaNeural",
    ("ps", "elder"): "ps-AF-GulNawazNeural",
    ("ps", "female"): "ps-AF-LatifaNeural",
    ("en", "elder"): "en-US-GuyNeural",
    ("en", "female"): "en-US-AriaNeural",
}


class VoiceService:
    """
    Stage 9: Speech-to-Text (Whisper) & Text-to-Speech (Gemini TTS / Edge-TTS) Service.
    """

    async def synthesize_speech(
        self, text: str, lang: str = "ur", voice_persona: str = "elder"
    ) -> Dict[str, Any]:
        voice_id = EDGE_TTS_VOICE_MAP.get((lang, voice_persona), "ur-PK-AsadNeural")
        try:
            import edge_tts  # type: ignore

            communicate = edge_tts.Communicate(text, voice_id)
            audio_chunks = bytearray()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_chunks.extend(chunk["data"])

            if audio_chunks:
                return {
                    "success": True,
                    "engine": "edge-tts",
                    "voice": voice_id,
                    "mimeType": "audio/mp3",
                    "audioBase64": base64.b64encode(bytes(audio_chunks)).decode("utf-8"),
                }
        except Exception as exc:
            logger.info("EDGE_TTS_FALLBACK", reason=str(exc))

        return {
            "success": True,
            "engine": "script-only",
            "voice": voice_id,
            "text": text,
            "lang": lang,
        }


voice_service = VoiceService()
