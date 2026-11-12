import { Router, Request, Response, NextFunction } from 'express';
import { settings } from '../config/settings.ts';
import { cacheService } from '../middleware/apiMiddleware.ts';
import { visionAndMlPipeline } from '../vision/imagePipeline.ts';
import { geminiAiService } from '../llm/geminiService.ts';
import { weatherService, KP_COORDINATES } from '../weather/weatherService.ts';
import { medicineService } from '../medicine/medicineService.ts';
import { outbreakService } from '../community/outbreakService.ts';
import { scanRepository } from '../repositories/scanRepository.ts';
import { orchestrationService } from '../services/orchestrationService.ts';

export const v1Router = Router();

// ==================== 1. HEALTH & SYSTEM TELEMETRY ====================
const healthHandler = (_req: Request, res: Response) => {
  const mlStatus = visionAndMlPipeline.getModelStatus();
  res.json({
    status: 'online',
    service: settings.appName,
    architecture: 'Modular AI Backend Architecture (FastAPI / Express)',
    version: settings.version,
    geminiConfigured: geminiAiService.isConfigured(),
    mlModelVersion: mlStatus.model.modelVersion,
    districtCount: Object.keys(KP_COORDINATES).length,
    cache: cacheService.stats(),
  });
};

v1Router.get('/health', healthHandler);
v1Router.get('/v1/health', healthHandler);

// ==================== 2. 10-STAGE AI CROP DIAGNOSIS ====================
const diagnosisHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await orchestrationService.executeDiagnosisPipeline(req.body || {});
    res.json(response);
  } catch (err) {
    next(err);
  }
};

v1Router.post('/v1/diagnosis', diagnosisHandler);
v1Router.post('/v1/scans/analyze', diagnosisHandler); // Backward-compatible alias

// ==================== 3. MULTILINGUAL VOICE SYNTHESIS & QUERY ====================
const voiceQueryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, lang = 'ur', voicePersona = 'elder' } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Text is required for speech generation.',
      });
    }

    const result = await geminiAiService.synthesizeSpeech({
      text,
      lang,
      voicePersona,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

v1Router.post('/v1/voice/query', voiceQueryHandler);
v1Router.post('/v1/tts', voiceQueryHandler); // Backward-compatible alias

// ==================== 4. AI SPRAY ADVISOR & MEDICINE ASSISTANT ====================
const medicineCheckHandler = (req: Request, res: Response) => {
  const { query, detectedCrop = 'Tomato', detectedDisease = 'Early Blight' } = req.body || {};
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Please choose or enter a medicine name.',
    });
  }

  const product = medicineService.verifyMedicine({
    query,
    detectedCrop,
    detectedDisease,
  });

  res.json({
    success: true,
    product,
  });
};

v1Router.post('/v1/medicine/check', medicineCheckHandler);
v1Router.post('/v1/products/verify', medicineCheckHandler); // Backward-compatible alias

// 4A. Bottle Image Scan -> OCR + Gemini Vision -> Medicine Database -> Weather API -> Decision Engine
v1Router.post('/v1/medicine/scan-bottle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      imageBase64 = '',
      bottleHint = '',
      barcode = '',
      crop = 'Tomato',
      disease = 'Early Blight',
      growthStage = 'Flowering / Fruiting',
      district = 'Mardan',
      previousSpray = 'None',
    } = req.body || {};

    const weather = await weatherService.getDistrictWeather(district);

    let ocrOverride: any = undefined;
    if (
      imageBase64 &&
      typeof imageBase64 === 'string' &&
      imageBase64.startsWith('data:image/') &&
      !imageBase64.startsWith('data:image/svg+xml')
    ) {
      const validated = visionAndMlPipeline.validateImagePayload(imageBase64);
      if (validated.cleanBase64) {
        const visionResult = await geminiAiService.analyzeMedicineBottleImage({
          mimeType: validated.mimeType,
          cleanBase64: validated.cleanBase64,
        });
        if (visionResult) {
          ocrOverride = visionResult;
        }
      }
    }

    const hasUploadedImage = Boolean(
      imageBase64 &&
        typeof imageBase64 === 'string' &&
        imageBase64.startsWith('data:image/') &&
        !imageBase64.startsWith('data:image/svg+xml')
    );

    const analysis = medicineService.analyzeBottleScan({
      queryOrBottleId: hasUploadedImage
        ? ocrOverride?.brandName || ocrOverride?.activeIngredient || bottleHint || ''
        : bottleHint || ocrOverride?.brandName || 'Aliette 80 WG',
      barcode,
      ocrOverride,
      hasUploadedImage,
      crop,
      disease,
      growthStage,
      previousSpray,
      weather,
    });

    res.json({
      success: true,
      analysis,
    });
  } catch (err) {
    next(err);
  }
});

// 4B. Instant Barcode Database Lookup (No AI latency needed)
v1Router.post('/v1/medicine/barcode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      barcode = '8964001254890',
      crop = 'Tomato',
      disease = 'Early Blight',
      growthStage = 'Flowering / Fruiting',
      district = 'Mardan',
      previousSpray = 'None',
    } = req.body || {};

    const weather = await weatherService.getDistrictWeather(district);
    const analysis = medicineService.analyzeBottleScan({
      barcode,
      crop,
      disease,
      growthStage,
      previousSpray,
      weather,
    });

    res.json({
      success: true,
      instantBarcodeMatch: true,
      analysis,
    });
  } catch (err) {
    next(err);
  }
});

// 4C. Medicine A vs Medicine B Comparison
v1Router.post('/v1/medicine/compare', (req: Request, res: Response) => {
  const {
    medicineA = 'Aliette 80 WG',
    medicineB = 'Karate 2.5 EC',
    crop = 'Tomato',
    disease = 'Early Blight',
  } = req.body || {};

  const comparison = medicineService.compareMedicines({
    medicineAQuery: medicineA,
    medicineBQuery: medicineB,
    crop,
    disease,
  });

  res.json({
    success: true,
    comparison,
  });
});

// 4D. Conservative Tank-Mix Compatibility ("Can I Mix These Two Medicines?")
v1Router.post('/v1/medicine/mix-check', (req: Request, res: Response) => {
  const {
    medicineA = 'Mancozeb 75% WP',
    medicineB = 'Aliette 80 WG',
    crop = 'Tomato',
  } = req.body || {};

  const mixResult = medicineService.checkTankMixCompatibility({
    medicineAQuery: medicineA,
    medicineBQuery: medicineB,
    crop,
  });

  res.json({
    success: true,
    mixResult,
  });
});

// 4E. Saved Medicine & Spray History
v1Router.get('/v1/medicine/history', (_req: Request, res: Response) => {
  res.json({
    success: true,
    history: medicineService.getHistory(),
  });
});

v1Router.post('/v1/medicine/history', (req: Request, res: Response) => {
  const {
    medicineName = 'Aliette 80 WG',
    activeIngredient = 'Fosetyl-Aluminium 80%',
    crop = 'Tomato',
    disease = 'Early Blight',
    district = 'Mardan',
    resultStatus = 'Suitable & Genuine',
    dosageUsed = '2g / Liter (30g in 15L tank)',
    phiDays = 7,
  } = req.body || {};

  const entry = medicineService.saveHistory({
    medicineName,
    activeIngredient,
    crop,
    disease,
    district,
    resultStatus,
    dosageUsed,
    phiDays: Number(phiDays) || 7,
  });

  res.json({
    success: true,
    entry,
    history: medicineService.getHistory(),
  });
});

// ==================== 5. HYPER-LOCAL METEOROLOGICAL WEATHER ====================
v1Router.get('/v1/weather', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const district = (req.query.district as string) || 'Mardan';
    const weather = await weatherService.getDistrictWeather(district);
    res.json({ success: true, weather });
  } catch (err) {
    next(err);
  }
});

// ==================== 6. COMMUNITY EPIDEMIOLOGICAL OUTBREAKS ====================
const outbreaksHandler = (_req: Request, res: Response) => {
  const data = outbreakService.getOutbreakHotspots();
  res.json({
    success: true,
    ...data,
  });
};

v1Router.get('/v1/community/outbreaks', outbreaksHandler);
v1Router.get('/v1/community/hotspots', outbreaksHandler); // Backward-compatible alias

// ==================== 7. PAGINATED DIAGNOSIS HISTORY ====================
v1Router.get('/v1/history', (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const district = req.query.district as string | undefined;

  const history = scanRepository.getPaginatedHistory(page, limit, district);
  res.json({
    success: true,
    ...history,
  });
});

// ==================== 8. FARMER FEEDBACK COLLECTION ====================
v1Router.post('/v1/feedback', (req: Request, res: Response) => {
  const { scanId = 'unknown', rating = 5, helpful = true, comments = '' } = req.body || {};
  const saved = scanRepository.saveFeedback({
    scanId,
    rating: Number(rating),
    helpful: Boolean(helpful),
    comments: String(comments),
  });
  res.json({
    success: true,
    message: 'Feedback saved.',
    feedback: saved,
  });
});

// ==================== 9. ML MODEL TRAINING & INFERENCE ENDPOINTS ====================
v1Router.get('/v1/ml/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    ...visionAndMlPipeline.getModelStatus(),
  });
});

v1Router.post('/v1/ml/train', (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = visionAndMlPipeline.retrainModel(req.body || {});
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

v1Router.post('/v1/ml/predict', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      cropHint = 'Tomato',
      biomarkers = { greenHealthyPct: 62, yellowChloroticPct: 22, brownNecroticPct: 16 },
      symptoms = ['brown_spots'],
      district = 'Mardan',
      weatherOverride = null,
    } = req.body || {};

    const weather = weatherOverride || (await weatherService.getDistrictWeather(district));
    const prediction = visionAndMlPipeline.runInference({
      cropHint,
      biomarkers,
      symptoms,
      weather,
    });
    const modelStatus = visionAndMlPipeline.getModelStatus();

    res.json({
      success: true,
      modelVersion: modelStatus.model.modelVersion,
      prediction,
      weather,
    });
  } catch (err) {
    next(err);
  }
});

v1Router.post('/v1/ml/sample', (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = visionAndMlPipeline.addVerifiedSample(req.body || {});
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});
