import { Language, VoicePersona } from '../types';

// Client-Side Audio Pre-Buffering & Web Speech Fallback Controller (src/utils/audioSpeech.ts)
export class VoiceAssistant {
  private static currentAudio: HTMLAudioElement | null = null;
  private static clientCache = new Map<string, { audioBase64: string; mimeType: string }>();
  private static activeAbortController: AbortController | null = null;

  static async speak(
    text: string,
    lang: Language,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: any) => void,
    voicePersona: VoicePersona = 'elder',
    onLoading?: (loading: boolean) => void
  ) {
    // Stop any currently playing audio
    this.stop();

    const cacheKey = `mardan-v5:${lang}:${voicePersona}:${text.trim().slice(0, 300)}`;

    try {
      let cachedItem = this.clientCache.get(cacheKey);

      if (!cachedItem) {
        if (onLoading) onLoading(true);
        this.activeAbortController = new AbortController();

        const response = await fetch('/api/v1/voice/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            lang,
            voicePersona,
          }),
          signal: this.activeAbortController.signal,
        });

        const data = await response.json();
        if (onLoading) onLoading(false);

        if (response.ok && data.success && data.audioBase64) {
          cachedItem = {
            audioBase64: data.audioBase64,
            mimeType: data.mimeType || 'audio/wav',
          };
          this.clientCache.set(cacheKey, cachedItem);
        } else {
          throw new Error(data.message || 'Server TTS unavailable');
        }
      }

      if (cachedItem) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = 1.0;
        audio.src = `data:${cachedItem.mimeType};base64,${cachedItem.audioBase64}`;
        this.currentAudio = audio;

        // Wait until the browser has decoded the WAV buffer before starting playback
        await new Promise<void>((resolve) => {
          let settled = false;
          const finish = () => {
            if (!settled) {
              settled = true;
              resolve();
            }
          };
          audio.addEventListener('canplaythrough', finish, { once: true });
          audio.addEventListener('loadeddata', finish, { once: true });
          setTimeout(finish, 180);
          audio.load();
        });

        audio.onplay = () => {
          if (onStart) onStart();
        };

        audio.onended = () => {
          this.currentAudio = null;
          if (onEnd) onEnd();
        };

        audio.onerror = (err) => {
          this.currentAudio = null;
          if (onEnd) onEnd();
          if (onError) onError(err);
        };

        await audio.play();
        return;
      }
    } catch (err: any) {
      if (onLoading) onLoading(false);
      if (err?.name === 'AbortError') {
        if (onEnd) onEnd();
        return;
      }
      console.warn('Gemini TTS fallback to browser speech:', err);
      this.fallbackBrowserSpeak(text, lang, onStart, onEnd, onError);
    }
  }

  private static fallbackBrowserSpeak(
    text: string,
    lang: Language,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: any) => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onError) onError('Audio playback unavailable');
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ur' ? 'ur-PK' : lang === 'ps' ? 'ps-AF' : 'en-US';
    utterance.rate = 0.9;

    utterance.onstart = () => {
      if (onStart) onStart();
    };
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
      if (onEnd) onEnd();
      if (onError) onError(e);
    };

    window.speechSynthesis.speak(utterance);
  }

  static stop() {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  static isSpeaking(): boolean {
    return !!this.currentAudio && !this.currentAudio.paused;
  }
}
