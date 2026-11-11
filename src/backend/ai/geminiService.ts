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
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: settings.geminiApiKey,
      apiVersion: 'v1beta',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  isConfigured(): boolean {
    return Boolean(settings.geminiApiKey);
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
    if (!this.isConfigured() || !params.cleanBase64) {
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
1. NEVER use difficult scientific jargon. Use simple, everyday farmer words!
2. Provide natural, warm, human-sounding spoken scripts in both Pakistani Urdu (اردو) and KP Pashto (پښتو) as if an elder brother ("Kissan Dost") is speaking directly to the farmer in the field, starting with "السلام علیکم کسان بھائی!" in Urdu and "السلام علیکم زمینداره وروره!" in Pashto.

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
      "cropName": "په پښتو کې د فصل نوم",
      "disease": "په اسانه پښتو کې د ناروغۍ نوم",
      "action": "د کروندګر لپاره په اسانه پښتو کې روښانه مشوره",
      "bestTime": "د سپرې غوره وخت (د بېلګې په توګه سبا سهار له ۷ تر ۱۰ بجو)",
      "whySummary": "په اسانه پښتو لنډیز",
      "whyPoints": ["لومړی اسانه دلیل", "دوهم اسانه دلیل", "دریم اسانه دلیل"],
      "medicineName": "منل شوی درمل",
      "dosageText": "د اوبو او درملو اسانه اندازه",
      "safetyText": "اسانه احتیاطي لارښوونه",
      "voiceScript": "السلام علیکم زما ګرانه زمینداره وروره! څخه پیل کیدونکې بشپړه، خوږه او طبیعي پښتو وینا"
    }
  }
}`;

      const geminiCall = this.ai.models.generateContent({
        model: settings.geminiVisionModel,
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
      const textOutput = response.text?.trim() || '';
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
   * Stage 9: Voice Response Generation (Urdu / Pashto / English)
   */
  async synthesizeSpeech(params: {
    text: string;
    lang: 'ur' | 'ps' | 'en';
    voicePersona: 'elder' | 'female';
  }): Promise<{ audioBase64: string; mimeType: string; cached: boolean }> {
    const { text, lang = 'ur', voicePersona = 'elder' } = params;

    if (!this.isConfigured()) {
      throw Object.assign(new Error('GEMINI_API_KEY is not configured on the server.'), {
        statusCode: 503,
        code: 'TTS_UNAVAILABLE',
      });
    }

    const cacheKey = `tts:${lang}:${voicePersona}:${text.trim().slice(0, 300)}`;
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
        'Warm, respectful, caring Pashtun elder farmer and agricultural advisor from Mardan, Khyber Pakhtunkhwa speaking natural, authentic Pashto (پښتو) with a genuine native Yusufzai Pashto accent. Speak clearly, warmly, and at a comfortable, unhurried pace as if talking face-to-face to a fellow villager in the field.';
    } else if (lang === 'ur') {
      styleInstruction =
        'Warm, caring, trustworthy Pakistani agricultural elder (Kissan Dost) speaking natural, conversational Pakistani Urdu (اردو) with an authentic native Pakistani accent. Speak gently, respectfully, and clearly so a village farmer can easily understand every word.';
    } else {
      styleInstruction =
        'Warm, friendly Pakistani agricultural advisor speaking clear, simple, encouraging English at a measured pace for farmers.';
    }

    let base64Audio: string | undefined;

    try {
      const response = await this.ai.models.generateContent({
        model: settings.geminiTtsPrimaryModel,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text,
                speechMetadata: {
                  style: styleInstruction,
                },
              } as any,
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
    } catch (primaryErr: any) {
      logger.warn('PRIMARY_TTS_FALLBACK', { error: primaryErr?.message });
      const fallbackResponse = await this.ai.models.generateContent({
        model: settings.geminiTtsFallbackModel,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text,
                speechMetadata: {
                  style: styleInstruction,
                },
              } as any,
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
      base64Audio = fallbackResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }

    if (!base64Audio) {
      throw new Error('Could not synthesize voice audio.');
    }

    cacheService.set(cacheKey, base64Audio, 1800);
    return {
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      cached: false,
    };
  }
}

export const geminiAiService = new GeminiAiService();
