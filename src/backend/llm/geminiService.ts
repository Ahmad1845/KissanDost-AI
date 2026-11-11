import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { settings } from '../config/settings.ts';
import { cacheService, logger } from '../middleware/apiMiddleware.ts';
import { DecisionEngineOutput, LeafBiomarkersSchema } from '../schemas/apiSchemas.ts';
import { DistrictWeatherSnapshot } from '../weather/weatherService.ts';
import { ModelPredictionResult } from '../../ml/cropDiseaseModel.ts';

/**
 * Dedicated Gemini LLM & Multimodal TTS Service
 * Implements Stage 8 (Safe Recommendation Generation) and Stage 9 (Voice Response Generation)
 */
export class GeminiAiService {
  private ai: GoogleGenAI | null = null;
  private initializedKey = '';

  private getApiKey(): string {
    const raw = (process.env.GEMINI_API_KEY || settings.geminiApiKey || '').trim();
    if (!raw || raw === 'your_gemini_api_key_here' || raw === 'YOUR_GEMINI_API_KEY') {
      return '';
    }
    return raw;
  }

  isConfigured(): boolean {
    return Boolean(this.getApiKey());
  }

  private getClient(): GoogleGenAI | null {
    const key = this.getApiKey();
    if (!key) {
      return null;
    }
    if (!this.ai || this.initializedKey !== key) {
      this.ai = new GoogleGenAI({
        apiKey: key,
        apiVersion: 'v1beta',
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      this.initializedKey = key;
    }
    return this.ai;
  }

  /**
   * Stage 8: Safe Recommendation Generation grounded on RAG context & Decision Engine baselines
   */
  async generateGroundedRecommendation(params: {
    mimeType: string;
    cleanBase64: string;
    cropHint: string;
    district: string;
    weather: DistrictWeatherSnapshot;
    symptoms: string[];
    biomarkers: LeafBiomarkersSchema;
    mlpPrediction: ModelPredictionResult;
    modelVersion: string;
    ragPromptContext: string;
    baselineDecision: DecisionEngineOutput;
  }): Promise<Partial<DecisionEngineOutput> | null> {
    const client = this.getClient();
    if (!client || !params.cleanBase64) {
      return null;
    }

    try {
      const prompt = `You are KissanDost, a warm, caring village agricultural advisor helping low-literacy farmers in Khyber Pakhtunkhwa (KP), Pakistan.
Analyze this crop leaf photo carefully using visual pathology inspection, multi-signal calibration, and the retrieved RAG agronomic context.

CRITICAL VISUAL PATHOLOGY RULE:
- Look closely at the leaf in the image for ANY necrotic brown/tan wedges, burnt leaf tips/edges, concentric target rings, dark water-soaked blight blotches, yellow chlorotic halos, or powdery yellow stripes.
- Even if 60%–75% of the leaf or background foliage is green, if ANY part of the leaf has a brown, tan, black, or yellow lesion/blight wedge, the plant is DISEASED (e.g., Early Blight or Late Blight on Tomato, Yellow Stripe Rust on Wheat, or Leaf Blight on Maize) and MUST NEVER be classified as "Healthy"!

Context:
- Crop: ${params.cropHint}
- District: ${params.district}, KP
- Current Weather: ${params.weather.temperature}°C, Rain Chance: ${params.weather.rainProbability}%, Wind: ${params.weather.windSpeed} km/h.
- Farmer Reported Visible Signs: ${params.symptoms.length > 0 ? params.symptoms.join(', ') : 'None specified'}
- Leaf Pixel Color Biomarkers (RGB/HSV): Healthy Green=${params.biomarkers.greenHealthyPct}%, Chlorotic Yellow=${params.biomarkers.yellowChloroticPct}%, Necrotic Brown=${params.biomarkers.brownNecroticPct}%
- Trained Neural Network (MLP ${params.modelVersion}) Prediction: Class=${params.mlpPrediction.predictedClassId} (${params.mlpPrediction.confidence}% confidence), Severity=${params.mlpPrediction.severity}, SprayDecision=${params.mlpPrediction.sprayDecision}.
- Retrieved RAG Knowledge Base Context:
${params.ragPromptContext}

CRITICAL RULES FOR LOW-LITERACY FARMERS:
1. NEVER use difficult scientific jargon or bookish/literary Pashto. Use simple, everyday farmer words!
2. For Pashto (ps), ALWAYS write in simple, everyday **Mardan / Charsadda / Swabi / Peshawar spoken Yusufzai Pashto** (use everyday words like "ټماټر" instead of "رومیان", "دوایي" instead of "درمل", "سپرے وکړئ" instead of "وشیندئ", "بیماري" instead of "ناروغي", "شبنم" instead of "پرخه", "لاندې پاڼې" instead of "لاندینۍ پاڼې", and "زمینداره وروره" instead of "کروندګره").
3. Provide natural, warm, human-sounding spoken scripts in both Pakistani Urdu (اردو) and simple Mardan Pashto (پښتو) as if an elder brother ("Kissan Dost") is speaking directly to the farmer in the field, starting with "السلام علیکم کسان بھائی!" in Urdu and "السلام علیکم زما خوږه زمینداره وروره!" in Pashto.

Return ONLY a JSON object with this exact structure:
{
  "crop": "${params.cropHint}",
  "disease": "Simple Disease Name",
  "severity": "Mild" | "Moderate" | "Severe" | "Healthy",
  "confidence": 96,
  "action": "1 simple clear sentence telling the farmer what to do",
  "bestTime": "e.g., Tomorrow Morning 7:00 AM - 10:00 AM",
  "why": ["Simple reason 1", "Simple reason 2", "Simple reason 3"],
  "detailedExplanation": "2 simple sentences explaining the problem and why waiting for rain/dew saves money.",
  "approvedTreatments": [
    {
      "name": "Common medicine name",
      "dosage": "Simple dosage per acre in 100 litres of water",
      "withholding": "Wait X days before harvest",
      "ppe": "Cover nose and mouth with a clean cloth while spraying"
    }
  ],
  "organicAlternatives": ["Simple home/desi method 1", "Simple method 2"],
  "translations": {
    "ur": {
      "cropName": "اردو میں فصل کا نام",
      "disease": "آسان اردو میں بیماری کا نام",
      "action": "کسان کے لیے آسان اردو میں ایک واضح ہدایت",
      "bestTime": "اسپرے کا بہترین وقت (مثلاً کل صبح ۷ سے ۱۰ بجے)",
      "whySummary": "آسان الفاظ میں خلاصہ",
      "whyPoints": ["پہلی آسان وجہ", "دوسری آسان وجہ", "تیسری آسان وجہ"],
      "medicineName": "منظور شدہ دوائی کا نام",
      "dosageText": "پانی اور دوائی کی آسان مقدار (فی ایکڑ)",
      "safetyText": "آسان حفاظتی ہدایت",
      "voiceScript": "السلام علیکم کسان بھائی! سے شروع ہونے والا مکمل، محبت بھرا اور قدرتی اردو بول چال کا پیراگراف"
    },
    "ps": {
      "cropName": "د مردان په اسانه پښتو کې د فصل نوم (لکه ټماټر، غنم، جوار)",
      "disease": "د مردان په عامه پښتو کې د بیمارۍ نوم",
      "action": "د زمیندار لپاره د مردان په ساده پښتو کې مشوره (د دوایي او سپرے توري وکاروئ)",
      "bestTime": "د سپرے غوره وخت (لکه سبا سهار له ۷ تر ۱۰ بجو)",
      "whySummary": "په ساده کلیوالي پښتو لنډیز",
      "whyPoints": ["لومړی اسانه دلیل", "دوهم اسانه دلیل", "دریم اسانه دلیل"],
      "medicineName": "منظور شوې دوایي",
      "dosageText": "د اوبو او دوایۍ اسانه اندازه",
      "safetyText": "اسانه احتیاطي خبره",
      "voiceScript": "السلام علیکم زما خوږه زمینداره وروره! څخه پیل کیدونکې د مردان او پېښور په ساده، خوږه او عامه کلیوالي پښتو وینا"
    }
  }
}`;

      const visionModels = Array.from(
        new Set([settings.geminiVisionModel, 'gemini-2.5-flash'])
      );
      let textOutput = '';

      for (const modelName of visionModels) {
        try {
          const geminiCall = client.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: params.mimeType,
                    data: params.cleanBase64,
                  },
                },
                { text: prompt },
              ],
            },
            config: {
              responseMimeType: 'application/json',
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
            },
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Gemini Vision timeout after ${settings.geminiTimeoutMs}ms`)),
              settings.geminiTimeoutMs
            )
          );

          const response = await Promise.race([geminiCall, timeoutPromise]);
          textOutput = response.text?.trim() || '';
          if (textOutput) break;
        } catch (innerErr: any) {
          logger.warn('VISION_MODEL_ATTEMPT_FALLBACK', {
            model: modelName,
            error: innerErr?.message || String(innerErr),
          });
        }
      }

      if (!textOutput) return null;
      const parsed = JSON.parse(textOutput) as Partial<DecisionEngineOutput>;

      // Safety guard: never allow an LLM hallucination of "Healthy" when biomarkers/DecisionEngine show disease
      const isFalseHealthy =
        params.baselineDecision.severity !== 'Healthy' &&
        (parsed.severity === 'Healthy' ||
          (parsed.disease && parsed.disease.toLowerCase().includes('healthy')) ||
          (parsed.translations?.ur?.disease &&
            parsed.translations.ur.disease.includes('صحت مند')));

      if (isFalseHealthy) {
        logger.warn('REJECTED_FALSE_HEALTHY_LLM_OUTPUT', {
          baselineDisease: params.baselineDecision.disease,
          biomarkers: params.biomarkers,
        });
        return null;
      }

      return parsed;
    } catch (err: any) {
      logger.warn('GEMINI_VISION_FALLBACK_TO_DECISION_ENGINE', {
        reason: err?.message || String(err),
      });
      return null;
    }
  }

  /**
   * OCR + Vision AI for Pesticide Bottle Label Extraction & Counterfeit Inspection
   * Extracts Brand Name, Active Ingredient, Company, Registration Number, Mfg/Expiry Dates,
   * Batch Number, QR/Barcode presence, and checks for blurry print / fake label indicators.
   */
  async analyzeMedicineBottleImage(params: {
    mimeType: string;
    cleanBase64: string;
  }): Promise<{
    brandName?: string;
    activeIngredient?: string;
    company?: string;
    registrationNumber?: string;
    manufacturingDate?: string;
    expiryDate?: string;
    batchNumber?: string;
    barcode?: string;
    qrDetected?: boolean;
    isGenuineOverride?: boolean;
    counterfeitSignalsOverride?: string[];
    imageQualityPoor?: boolean;
  } | null> {
    const client = this.getClient();
    if (!client || !params.cleanBase64) {
      return null;
    }

    try {
      const prompt = `You are an expert agrochemical OCR and counterfeit detection inspector for Khyber Pakhtunkhwa (KP) Agriculture Extension in Pakistan.
Inspect this pesticide/fungicide bottle or packet image and extract all visible label text and authenticity cues.

Look for:
1. Brand Name (e.g., "Aliette 80 WG", "Dithane M-45", "Ridomil Gold MZ 68 WG", "Tilt 250 EC", "Score 250 EC", "Karate 2.5 EC", "Paraquat")
2. Active Ingredient (e.g., "Fosetyl-Aluminium 80%", "Mancozeb 75% WP", "Propiconazole 25% EC")
3. Company (e.g., "Bayer", "Syngenta", "Corteva", "Swat Agro")
4. Registration Number (e.g., "PAK-DPP-10482-F")
5. Manufacturing Date (YYYY-MM) and Expiry Date (YYYY-MM)
6. Batch Number
7. Barcode digits or QR Code presence
8. Counterfeit / Fake Signals: check for blurry printing, misspelled chemical names, missing registration number, or tampered seal.
9. Image Quality: set "imageQualityPoor": true ONLY if the image is completely unreadable/blurry.

Return ONLY a JSON object with this structure:
{
  "brandName": "Extracted brand name",
  "activeIngredient": "Extracted active ingredient",
  "company": "Manufacturer name",
  "registrationNumber": "Registration number or MISSING",
  "manufacturingDate": "2026-01",
  "expiryDate": "2027-01",
  "batchNumber": "Batch code",
  "barcode": "8964001254890",
  "qrDetected": true,
  "isGenuineOverride": true,
  "counterfeitSignalsOverride": ["Clear manufacturer logo and registration code"],
  "imageQualityPoor": false
}`;

      const visionModels = Array.from(
        new Set([settings.geminiVisionModel, 'gemini-2.5-flash'])
      );
      let textOutput = '';

      for (const modelName of visionModels) {
        try {
          const geminiCall = client.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: params.mimeType,
                    data: params.cleanBase64,
                  },
                },
                { text: prompt },
              ],
            },
            config: {
              responseMimeType: 'application/json',
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
            },
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Gemini Bottle OCR timeout after ${settings.geminiTimeoutMs}ms`)),
              settings.geminiTimeoutMs
            )
          );

          const response = await Promise.race([geminiCall, timeoutPromise]);
          textOutput = response.text?.trim() || '';
          if (textOutput) break;
        } catch (innerErr: any) {
          logger.warn('BOTTLE_OCR_MODEL_FALLBACK', {
            model: modelName,
            error: innerErr?.message || String(innerErr),
          });
        }
      }

      if (!textOutput) return null;
      return JSON.parse(textOutput);
    } catch (err: any) {
      logger.warn('GEMINI_BOTTLE_OCR_FALLBACK_TO_CATALOG', {
        reason: err?.message || String(err),
      });
      return null;
    }
  }

  /**
   * Prepend 500ms of digital PCM silence right after the 44-byte RIFF WAV header
   * so browser/OS audio hardware wakes up before the first syllable of speech begins.
   * Prevents the first 1–2 words from sounding faded or clipped.
   */
  private prependLeadingSilenceToWav(wavBase64: string, silenceMs = 500): string {
    try {
      const buf = Buffer.from(wavBase64, 'base64');
      if (buf.length <= 44 || buf.toString('ascii', 0, 4) !== 'RIFF') {
        return wavBase64;
      }

      // Read byteRate from standard WAV fmt chunk (offset 28, uint32LE) and blockAlign (offset 32, uint16LE)
      const byteRate = buf.readUInt32LE(28) || 48000; // 24000 Hz * 2 bytes = 48000 bytes/sec
      const blockAlign = buf.readUInt16LE(32) || 2;
      const rawSilenceBytes = Math.floor((byteRate * silenceMs) / 1000);
      const silenceByteCount = rawSilenceBytes - (rawSilenceBytes % blockAlign);

      const header = Buffer.from(buf.subarray(0, 44));
      const pcmData = buf.subarray(44);
      const silencePad = Buffer.alloc(silenceByteCount, 0); // Pure digital zero PCM samples

      const totalDataBytes = pcmData.length + silenceByteCount;
      // Update RIFF chunk size at offset 4 (36 + Subchunk2Size)
      header.writeUInt32LE(36 + totalDataBytes, 4);
      // Update data Subchunk2Size at offset 40
      if (header.toString('ascii', 36, 40) === 'data') {
        header.writeUInt32LE(totalDataBytes, 40);
      }

      return Buffer.concat([header, silencePad, pcmData]).toString('base64');
    } catch (err) {
      logger.warn('WAV_SILENCE_PAD_SKIPPED', { error: String(err) });
      return wavBase64;
    }
  }

  /**
   * Stage 9: Voice Response Generation (Urdu / Pashto / English)
   * Uses gemini-3.8-flash-tts and gemini-3.8-flash-lite-tts with speechMetadata style direction
   * (plus automatic fallback to gemini-2.5-flash-preview-tts on external local networks)
   * for authentic, human-sounding Pakistani Urdu and everyday Mardan Yusufzai Pashto voices.
   */
  async synthesizeSpeech(params: {
    text: string;
    lang: 'ur' | 'ps' | 'en';
    voicePersona: 'elder' | 'female';
  }): Promise<{ audioBase64: string; mimeType: string; cached: boolean }> {
    const { text, lang = 'ur', voicePersona = 'elder' } = params;

    const client = this.getClient();
    if (!client) {
      throw Object.assign(new Error('GEMINI_API_KEY is not configured on the server.'), {
        statusCode: 503,
        code: 'TTS_UNAVAILABLE',
      });
    }

    const cacheKey = `tts-mardan-v5:${lang}:${voicePersona}:${text.trim().slice(0, 300)}`;
    const cachedAudio = cacheService.get<string>(cacheKey);
    if (cachedAudio) {
      return {
        audioBase64: cachedAudio,
        mimeType: 'audio/wav',
        cached: true,
      };
    }

    const voiceName = voicePersona === 'female' ? 'Kore' : 'Charon';
    let styleInstruction = '';
    if (lang === 'ps') {
      styleInstruction =
        'Warm, friendly Pashtun village farmer and elder brother from Mardan, Khyber Pakhtunkhwa speaking simple, everyday conversational Mardan Yusufzai Pashto (پښتو). Start speaking at full, clear volume from the very first word without fading in. Speak naturally, warmly, and simply as a local Mardan farmer talking to his neighbor in the field.';
    } else if (lang === 'ur') {
      styleInstruction =
        'Warm, caring, trustworthy Pakistani agricultural elder (Kissan Dost) speaking natural, conversational Pakistani Urdu (اردو) with an authentic native Pakistani accent. Start speaking at full, clear volume from the very first word without fading in. Speak gently, respectfully, and clearly so a village farmer can easily understand every word.';
    } else {
      styleInstruction =
        'Warm, friendly Pakistani agricultural advisor speaking clear, simple, encouraging English at full volume from the very first word.';
    }

    let base64Audio: string | undefined;
    const ttsModels = Array.from(
      new Set([
        settings.geminiTtsPrimaryModel,
        settings.geminiTtsFallbackModel,
        'gemini-2.5-flash-preview-tts',
      ])
    );

    for (const ttsModel of ttsModels) {
      try {
        const useSpeechMetadata = ttsModel.includes('3.8');
        const response = await client.models.generateContent({
          model: ttsModel,
          contents: [
            {
              role: 'user',
              parts: [
                useSpeechMetadata
                  ? ({
                      text,
                      speechMetadata: {
                        style: styleInstruction,
                      },
                    } as any)
                  : {
                      text: `${styleInstruction}\n\nSpeak the following text clearly:\n${text}`,
                    },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        });
        base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) break;
      } catch (ttsErr: any) {
        logger.warn('TTS_MODEL_ATTEMPT_FALLBACK', {
          model: ttsModel,
          error: ttsErr?.message || String(ttsErr),
        });
      }
    }

    if (!base64Audio) {
      throw new Error('Could not synthesize voice audio.');
    }

    // Prepend 500ms of clean digital PCM silence so browser/OS audio start never clips or fades the first 2 words
    const paddedWavBase64 = this.prependLeadingSilenceToWav(base64Audio, 500);

    cacheService.set(cacheKey, paddedWavBase64, 1800);
    return {
      audioBase64: paddedWavBase64,
      mimeType: 'audio/wav',
      cached: false,
    };
  }
}

export const geminiAiService = new GeminiAiService();


