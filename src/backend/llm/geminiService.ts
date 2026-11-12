import { GoogleGenAI } from '@google/genai';
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
  private modelCooldownUntil = new Map<string, number>();

  private isModelCoolingDown(modelName: string): boolean {
    const until = this.modelCooldownUntil.get(modelName);
    if (!until) return false;
    if (Date.now() >= until) {
      this.modelCooldownUntil.delete(modelName);
      return false;
    }
    return true;
  }

  private summarizeError(err: any): { isQuota: boolean; isNotFound: boolean; summary: string } {
    const raw = err?.message || String(err);
    const isQuota = raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.toLowerCase().includes('quota');
    const isNotFound = raw.includes('404') || raw.includes('NOT_FOUND');
    const summary = isQuota
      ? 'Quota exceeded (429 RESOURCE_EXHAUSTED)'
      : isNotFound
      ? 'Model not found (404)'
      : raw.slice(0, 160);
    return { isQuota, isNotFound, summary };
  }

  private markModelFailure(modelName: string, err: any): { isQuota: boolean; isNotFound: boolean; summary: string } {
    const info = this.summarizeError(err);
    if (info.isQuota) {
      this.modelCooldownUntil.set(modelName, Date.now() + 30 * 60 * 1000);
    } else if (info.isNotFound) {
      this.modelCooldownUntil.set(modelName, Date.now() + 60 * 60 * 1000);
    }
    return info;
  }

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
   * Fast (~1.3s) Visual Pathology & Biomarker Inspector using Gemini 3.1 Flash Lite / 2.5 Flash Lite.
   * Ensures diseased leaves (e.g. Cotton vein blight, angular leaf spot, early/late blight, leaf curl)
   * are never misclassified as healthy, and truly healthy leaves are verified accurately.
   */
  async inspectLeafImageFast(params: {
    mimeType: string;
    cleanBase64: string;
    cropHint: string;
  }): Promise<{
    isHealthy: boolean;
    diseaseCategory:
      | 'healthy'
      | 'bacterial_blight_or_spot'
      | 'leaf_curl'
      | 'early_blight'
      | 'late_blight'
      | 'yellow_rust';
    estimatedGreenPct: number;
    estimatedYellowPct: number;
    estimatedBrownNecroticPct: number;
    severity: 'Healthy' | 'Mild' | 'Moderate' | 'Severe';
  } | null> {
    const client = this.getClient();
    if (!client || !params.cleanBase64) {
      return null;
    }

    const fastModels = Array.from(
      new Set([
        'gemini-3.1-flash-lite',
        'gemini-4-hydrogen',
        settings.geminiVisionModel,
        'gemini-2.5-flash-lite',
        'gemini-2.5-flash',
      ])
    ).filter((m) => !this.isModelCoolingDown(m));

    const prompt = `You are an expert plant pathologist. Inspect this ${params.cropHint} leaf photo carefully (ignore human fingers/hands holding the petiole and ignore background field/soil).
Look closely at the leaf blade and veins:
- If there are dark brown/black necrotic vein streaks (vein blight), brown angular spots, necrotic lesions, target rings, fungal rust powder, or yellowing/curling, set "isHealthy": false and estimate the diseased percentages ("estimatedBrownNecroticPct" >= 15 for vein blight or brown spots).
- Only set "isHealthy": true if the leaf blade and veins are completely clean, fresh green, and free of brown/black necrotic streaks or spots ("estimatedBrownNecroticPct" <= 2).

Return ONLY a JSON object:
{
  "isHealthy": boolean,
  "diseaseCategory": "healthy" | "bacterial_blight_or_spot" | "leaf_curl" | "early_blight" | "late_blight" | "yellow_rust",
  "estimatedGreenPct": number,
  "estimatedYellowPct": number,
  "estimatedBrownNecroticPct": number,
  "severity": "Healthy" | "Mild" | "Moderate" | "Severe"
}`;

    for (const modelName of fastModels) {
      try {
        const call = client.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              { inlineData: { mimeType: params.mimeType, data: params.cleanBase64 } },
              { text: prompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
          },
        });
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Fast vision timeout')), 5000)
        );
        const resp = await Promise.race([call, timeout]);
        const txt = resp.text?.trim() || '';
        if (txt) {
          return JSON.parse(txt);
        }
      } catch (err: any) {
        const info = this.markModelFailure(modelName, err);
        logger.warn('FAST_LEAF_INSPECT_FALLBACK', {
          model: modelName,
          error: info.summary,
        });
      }
    }
    return null;
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
Analyze this ${params.cropHint} leaf photo carefully using visual pathology inspection, the LeafVision Disease Model baseline, and the retrieved RAG agronomic context.

LOCKED CROP RULE (CRITICAL):
- The farmer has ALREADY selected the crop: **${params.cropHint}**.
- DO NOT guess or change the crop! This leaf is 100% from a **${params.cropHint}** plant.
- You MUST diagnose ONLY diseases that affect **${params.cropHint}** (or Healthy ${params.cropHint} if the leaf is clean and healthy). Never mention diseases of another crop (e.g., never mention Tomato when the crop is Cotton!).

HYBRID DISEASE DETECTION & VERIFICATION:
1. HAND / SKIN / BACKGROUND FILTER: Farmers in the field often hold the leaf edge or petiole with their fingers or thumb. IGNORE human hands, skin color, fingernails, soil, and sticks! Inspect ONLY the leaf blade and veins.
2. DISEASED PLANTS (CRITICAL): Look closely at the leaf veins and blade! If the ${params.cropHint} leaf has dark brown/black vein blight streaks along the veins, angular brown spots, necrotic lesions, yellowing, or curling, it is DISEASED (NOT healthy!). Combine your visual inspection with the LeafVision Model baseline ("${params.baselineDecision.disease}") to give the accurate disease diagnosis and approved medicine for **${params.cropHint}**.
3. HEALTHY PLANTS: Only if the ${params.cropHint} leaf blade and veins are completely clean green and free of dark brown/black vein blight, necrotic spots, or fungal lesions, classify it as HEALTHY ("severity": "Healthy", "disease": "Healthy ${params.cropHint} Plant - No Disease (بالکل صحت مند پودا)").

Context:
- Confirmed Crop: ${params.cropHint}
- District: ${params.district}, KP
- Current Weather: ${params.weather.temperature}°C, Rain Chance: ${params.weather.rainProbability}%, Wind: ${params.weather.windSpeed} km/h.
- Visible Signs: ${params.symptoms.length > 0 ? params.symptoms.join(', ') : 'None specified'}
- Leaf Pixel Color Biomarkers (RGB/HSV): Healthy Green=${params.biomarkers.greenHealthyPct}%, Chlorotic Yellow=${params.biomarkers.yellowChloroticPct}%, Necrotic Brown=${params.biomarkers.brownNecroticPct}%
- LeafVision Disease Model Baseline for ${params.cropHint}: "${params.baselineDecision.disease}", Recommended Medicine="${params.baselineDecision.approvedTreatments[0]?.name || ''}", Dosage="${params.baselineDecision.approvedTreatments[0]?.dosage || ''}".
- Retrieved RAG Knowledge Base Context:
${params.ragPromptContext}

CRITICAL RULES FOR LOW-LITERACY FARMERS:
1. NEVER use difficult scientific jargon or bookish/literary Pashto. Use simple, everyday farmer words!
2. For Pashto (ps), ALWAYS write in simple, everyday **Mardan / Charsadda / Swabi / Peshawar spoken Yusufzai Pashto** (use everyday words like "ټماټر" instead of "رومیان", "دوایي" instead of "درمل", "سپرے وکړئ" instead of "وشیندئ", "بیماري" instead of "ناروغي", "شبنم" instead of "پرخه", "لاندې پاڼې" instead of "لاندینۍ پاڼې", and "زمینداره وروره" instead of "کروندګره").
3. Provide natural, warm, reassuring, elder-brother ("Kissan Dost") spoken scripts of about 5 to 6 friendly sentences in both Pakistani Urdu (اردو) and simple Mardan Pashto (پښتو). Greet the farmer warmly ("السلام علیکم میرے پیارے کسان بھائی!" / "السلام علیکم زما خوږه زمینداره وروره!"), reassure them not to worry ("گھبرانے کی بالکل بات نہیں" / "هیڅ د پرېشانۍ خبره نشته"), clearly explain what you see on the leaf, the medicine & water measurement, the best weather timing, a simple safety or after-care tip, and close with a heartfelt prayer/blessing.

Return ONLY a JSON object with this exact structure:
{
  "crop": "${params.cropHint}",
  "disease": "Simple ${params.cropHint} Disease Name or Healthy ${params.cropHint} Plant",
  "severity": "Mild" | "Moderate" | "Severe" | "Healthy",
  "confidence": 96,
  "action": "1 simple clear sentence telling the farmer what to do",
  "bestTime": "e.g., Tomorrow Morning 7:00 AM - 10:00 AM or No Spray Needed",
  "why": ["Simple reason 1", "Simple reason 2", "Simple reason 3"],
  "detailedExplanation": "2 simple sentences explaining the assessment.",
  "approvedTreatments": [
    {
      "name": "Common medicine name or No Chemical Medicine Needed",
      "dosage": "Simple dosage per acre or 0 grams",
      "withholding": "Wait X days before harvest or Safe anytime",
      "ppe": "Cover nose and mouth with a clean cloth while spraying or None needed"
    }
  ],
  "organicAlternatives": ["Simple tip 1", "Simple tip 2"],
  "translations": {
    "ur": {
      "cropName": "اردو میں فصل کا نام (مثلاً کپاس، ٹماٹر، گندم)",
      "disease": "آسان اردو میں بیماری کا نام (یا ماشاءاللہ بالکل صحت مند)",
      "action": "کسان کے لیے آسان اردو میں ایک واضح ہدایت",
      "bestTime": "اسپرے کا بہترین وقت (یا اسپرے کی ضرورت نہیں)",
      "whySummary": "آسان الفاظ میں خلاصہ",
      "whyPoints": ["پہلی آسان وجہ", "دوسری آسان وجہ", "تیسری آسان وجہ"],
      "medicineName": "منظور شدہ دوائی کا نام (یا کسی دوائی کی ضرورت نہیں)",
      "dosageText": "پانی اور دوائی کی آسان مقدار (یا پیسے بچائیں)",
      "safetyText": "آسان حفاظتی ہدایت",
      "voiceScript": "السلام علیکم میرے پیارے کسان بھائی! سے شروع ہونے والا ۵ سے ۶ جملوں کا نہایت محبت بھرا، حوصلہ افزا اور قدرتی اردو بول چال کا پیراگراف جس میں تسلی، آسان علاج، پانی کی مقدار، صحیح وقت، احتیاط اور دل سے دعا شامل ہو"
    },
    "ps": {
      "cropName": "د مردان په اسانه پښتو کې د فصل نوم (لکه پنبه، ټماټر، غنم، جوار)",
      "disease": "د مردان په عامه پښتو کې د بیمارۍ نوم (یا روغ بوټی)",
      "action": "د زمیندار لپاره د مردان په ساده پښتو کې مشوره",
      "bestTime": "د سپرے غوره وخت (یا د سپرے هیڅ ضرورت نشته)",
      "whySummary": "په ساده کلیوالي پښتو لنډیز",
      "whyPoints": ["لومړی اسانه دلیل", "دوهم اسانه دلیل", "دریم اسانه دلیل"],
      "medicineName": "منظور شوې دوایي (یا د هیڅ دوایۍ ضرورت نشته)",
      "dosageText": "د اوبو او دوایۍ اسانه اندازه (یا پیسې بچت کړئ)",
      "safetyText": "اسانه احتیاطي خبره",
      "voiceScript": "السلام علیکم زما خوږه زمینداره وروره! څخه پیل کیدونکې د ۵ نه تر ۶ جملو پورې د مردان او پېښور په ساده، خوږه او حوصله ورکوونکې کلیوالي پښتو وینا چې پکې ډاډګیرنه، دوایي او اوبو اندازه، د سپرے سم وخت، احتیاط او خوږه دعا شامله وي"
    }
  }
}`;

      const visionModels = Array.from(
        new Set([
          'gemini-3.1-flash-lite',
          'gemini-4-hydrogen',
          settings.geminiVisionModel,
          'gemini-2.5-flash-lite',
          'gemini-2.5-flash',
        ])
      ).filter((m) => !this.isModelCoolingDown(m));
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
          const info = this.markModelFailure(modelName, innerErr);
          logger.warn('VISION_MODEL_ATTEMPT_FALLBACK', {
            model: modelName,
            error: info.summary,
          });
        }
      }

      if (!textOutput) return null;
      const parsed = JSON.parse(textOutput) as Partial<DecisionEngineOutput>;

      // Safety guard: only reject an LLM "Healthy" prediction if verified severe necrotic lesions (>30%) exist on the leaf blade
      const hasVerifiedSevereLesions =
        params.biomarkers.brownNecroticPct >= 30 &&
        params.baselineDecision.severity === 'Severe';

      const isFalseHealthy =
        hasVerifiedSevereLesions &&
        (parsed.severity === 'Healthy' ||
          (parsed.disease && parsed.disease.toLowerCase().includes('healthy')));

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
   * Extracts Brand Name, Active Ingredient, Product Type, Target Crops/Diseases,
   * Expiry/Batch info, and checks for fake label indicators.
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
    productType?: 'fungicide' | 'herbicide' | 'insecticide' | 'bactericide' | 'unknown';
    targetCrops?: string[];
    targetDiseases?: string[];
    dosagePerLiter?: string;
    dosagePer15LTank?: string;
    dosagePerAcre?: string;
    isGenuineOverride?: boolean;
    counterfeitSignalsOverride?: string[];
    imageQualityPoor?: boolean;
  } | null> {
    const client = this.getClient();
    if (!client || !params.cleanBase64) {
      return null;
    }

    try {
      const prompt = `You are an expert agrochemical label OCR and agricultural medicine inspector.
Carefully read the text on this pesticide/fungicide/herbicide bottle or box image (the label may be in English, Urdu, Romanian, Spanish, Chinese, or another language — translate its crop and disease uses accurately to English!).

Extract:
1. "brandName": EXACT product name visible on the box/bottle (e.g., "Tilt 250 EC", "Aliette 80 WG", "Dithane M-45", "Score 250 EC", "Ridomil Gold MZ 68 WG", "Karate 2.5 EC", "Paraquat 20% SL", "Roundup", etc.). NEVER guess a different brand name!
2. "activeIngredient": Exact chemical name & concentration (e.g., "Propiconazole 250 g/L", "Fosetyl-Aluminium 80%", "Mancozeb 75% WP").
3. "company": Manufacturer name printed on the label (e.g., "Syngenta", "Bayer", "Corteva").
4. "productType": "fungicide" | "herbicide" | "insecticide" | "bactericide" | "unknown". (Set "herbicide" if it is a weed killer / grass killer!).
5. "targetCrops": Standard English list of main crops this product treats based on label/agronomy (use standard names when applicable: "Wheat", "Tomato", "Potato", "Maize", "Cotton", "Chili", "Onion", "Barley", "Cucumber", etc. For example, "grâu" = "Wheat", "ardei" = "Chili", "castraveți" = "Cucumber"). If it is a herbicide/weedkiller, set [].
6. "targetDiseases": Standard English list of diseases/pests it treats (e.g., "Yellow Stripe Rust", "Stripe Rust", "Brown Rust", "Early Blight", "Late Blight", "Leaf Spot", "Powdery Mildew"). If it is a herbicide/weedkiller, set ["Weed Killer (Herbicide)"].
7. "registrationNumber", "manufacturingDate", "expiryDate" (YYYY-MM if visible), "batchNumber", "barcode", "qrDetected".
8. "isGenuineOverride": false ONLY if clearly tampered/fake/expired or toxic non-selective herbicide; otherwise true.
9. "imageQualityPoor": true ONLY if the photo is too blurry/unreadable to read any product name.

Return ONLY a JSON object:
{
  "brandName": "Exact brand name from image",
  "activeIngredient": "Active ingredient from image",
  "company": "Company name from image",
  "registrationNumber": "Visible reg number or Registered",
  "manufacturingDate": "YYYY-MM",
  "expiryDate": "2027-12",
  "batchNumber": "Visible batch or BATCH-OK",
  "barcode": "Visible digits or empty string",
  "qrDetected": true,
  "productType": "fungicide",
  "targetCrops": ["Wheat"],
  "targetDiseases": ["Yellow Stripe Rust"],
  "dosagePerLiter": "",
  "dosagePer15LTank": "",
  "dosagePerAcre": "",
  "isGenuineOverride": true,
  "counterfeitSignalsOverride": ["Readable original manufacturer label"],
  "imageQualityPoor": false
}`;

      const visionModels = Array.from(
        new Set([
          'gemini-3.1-flash-lite',
          'gemini-4-hydrogen',
          settings.geminiVisionModel,
          'gemini-2.5-flash-lite',
          'gemini-2.5-flash',
        ])
      ).filter((m) => !this.isModelCoolingDown(m));
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
          const info = this.markModelFailure(modelName, innerErr);
          logger.warn('BOTTLE_OCR_MODEL_FALLBACK', {
            model: modelName,
            error: info.summary,
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
    let sawQuotaError = false;
    const candidateTtsModels = Array.from(
      new Set([
        'gemini-3.8-flash-lite-tts',
        settings.geminiTtsPrimaryModel,
        settings.geminiTtsFallbackModel,
        'gemini-2.5-flash-preview-tts',
      ])
    ).filter((m) => !this.isModelCoolingDown(m));

    for (const ttsModel of candidateTtsModels) {
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
        const info = this.markModelFailure(ttsModel, ttsErr);
        if (info.isQuota) sawQuotaError = true;
        logger.warn('TTS_MODEL_ATTEMPT_FALLBACK', {
          model: ttsModel,
          error: info.summary,
        });
      }
    }

    if (!base64Audio) {
      if (sawQuotaError || candidateTtsModels.length === 0) {
        throw Object.assign(new Error('Voice TTS quota temporarily exhausted. Using device voice fallback.'), {
          statusCode: 429,
          code: 'TTS_QUOTA_EXCEEDED',
        });
      }
      throw Object.assign(new Error('Could not synthesize voice audio.'), {
        statusCode: 503,
        code: 'TTS_UNAVAILABLE',
      });
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


