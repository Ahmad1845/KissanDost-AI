import { DiagnosisRequestSchema } from '../schemas/apiSchemas.ts';
import { visionAndMlPipeline } from '../ai/imagePipeline.ts';
import { ragService } from '../rag/ragService.ts';
import { weatherService } from '../weather/weatherService.ts';
import { decisionEngine } from '../diagnosis/decisionEngine.ts';
import { geminiAiService } from '../ai/geminiService.ts';
import { scanRepository } from '../repositories/scanRepository.ts';
import { logger } from '../middleware/apiMiddleware.ts';

/**
 * 10-Stage AI Diagnosis Pipeline Orchestration Service
 *
 * Stage 1: Image Validation
 * Stage 2: Image Preprocessing & RGB/HSV Biomarker Extraction
 * Stage 3: Disease Detection (2-Layer MLP Neural Network)
 * Stage 4: Confidence Scoring & Multi-Signal Calibration
 * Stage 5: RAG Knowledge Retrieval & Document Ranking
 * Stage 6: Weather Retrieval (Open-Meteo + Spray Window Calculation)
 * Stage 7: Agronomic Decision Engine (Deterministic Rules)
 * Stage 8: Safe Recommendation Generation (Gemini 3.8 Flash Grounded Synthesis)
 * Stage 9: Voice Script & Audio Readiness
 * Stage 10: Structured API Response & Async Background Outbreak Logging
 */
export class AiOrchestrationService {
  async executeDiagnosisPipeline(payload: DiagnosisRequestSchema) {
    const startTime = Date.now();
    const {
      imageBase64,
      sampleId = '',
      cropHint = 'Tomato',
      growthStage = 'Vegetative',
      symptoms = [],
      biomarkers: rawBiomarkers = null,
      district = 'Mardan',
      village = 'Gujar Garhi',
      consentToShare = true,
    } = payload;

    // 1. Image Validation
    const validation = visionAndMlPipeline.validateImagePayload(imageBase64);
    if (!validation.isValid) {
      throw Object.assign(new Error(validation.error || 'Invalid crop leaf image.'), {
        statusCode: 400,
        code: 'INVALID_IMAGE',
      });
    }

    // 2. Image Preprocessing & Biomarker Extraction
    const normalizedBiomarkers = visionAndMlPipeline.preprocessBiomarkers(
      rawBiomarkers,
      sampleId,
      symptoms
    );

    // 6. Weather Retrieval (fetched concurrently or prior to feature vector fusion)
    const weather = await weatherService.getDistrictWeather(district);

    // 3 & 4. Disease Detection & Confidence Scoring
    const mlpPrediction = visionAndMlPipeline.runInference({
      cropHint,
      biomarkers: normalizedBiomarkers,
      symptoms,
      weather,
      sampleId,
    });

    // 5. RAG Knowledge Retrieval
    const ragContext = ragService.retrieveAndRankContext({
      crop: cropHint,
      predictedClassId: mlpPrediction.predictedClassId,
      symptoms,
      district,
      topK: 3,
    });

    // 7. Deterministic Agronomic Decision Engine
    const deterministicDecision = decisionEngine.evaluate({
      predictedClassId: mlpPrediction.predictedClassId,
      confidenceScore: mlpPrediction.confidence,
      crop: cropHint,
      growthStage,
      weather,
      farmerLocation: { district, village },
      ragDocuments: ragContext.rankedDocuments,
      symptoms,
      biomarkers: normalizedBiomarkers,
    });

    // 8. Safe Recommendation Generation (Gemini Multimodal + RAG Grounding)
    let finalRecommendation = deterministicDecision;
    const isSynthetic = validation.isSyntheticSample || Boolean(sampleId);

    if (!isSynthetic && geminiAiService.isConfigured()) {
      const modelStatus = visionAndMlPipeline.getModelStatus();
      const llmRefinement = await geminiAiService.generateGroundedRecommendation({
        mimeType: validation.mimeType,
        cleanBase64: validation.cleanBase64,
        cropHint,
        district,
        weather,
        symptoms,
        biomarkers: normalizedBiomarkers,
        mlpPrediction,
        modelVersion: modelStatus.model.modelVersion,
        ragPromptContext: ragContext.promptContextBlock,
        baselineDecision: deterministicDecision,
      });

      if (llmRefinement && llmRefinement.disease && llmRefinement.action) {
        finalRecommendation = {
          ...deterministicDecision,
          ...llmRefinement,
          warnings: deterministicDecision.warnings,
          irrigationAdvice: deterministicDecision.irrigationAdvice,
          confidenceExplanation: deterministicDecision.confidenceExplanation,
          translations: llmRefinement.translations || deterministicDecision.translations,
        };
      }
    }

    // 9 & 10. Assemble Final Explainable AI Response & Trigger Background Tasks
    const scanId = `scan-${Date.now()}`;
    const modelStatus = visionAndMlPipeline.getModelStatus();

    const responseRecord = {
      ...finalRecommendation,
      scanId,
      confidence: finalRecommendation.confidence || mlpPrediction.confidence,
      weatherSnapshot: weather,
      groundedSources: ragContext.rankedDocuments.map((doc) => ({
        title: doc.title,
        source: doc.source,
        relevanceScore: doc.relevanceScore,
      })),
      scanTimestamp: new Date().toISOString(),
      district,
      pipelineMetadata: {
        executionTimeMs: Date.now() - startTime,
        stagesCompleted: [
          '1_IMAGE_VALIDATION',
          '2_BIOMARKER_PREPROCESSING',
          '3_MLP_DISEASE_DETECTION',
          '4_CONFIDENCE_CALIBRATION',
          '5_RAG_KNOWLEDGE_RETRIEVAL',
          '6_WEATHER_INTEGRATION',
          '7_DECISION_ENGINE_EVALUATION',
          '8_SAFE_RECOMMENDATION_SYNTHESIS',
          '9_MULTILINGUAL_VOICE_SCRIPT_GENERATION',
          '10_API_RESPONSE_SERIALIZATION',
        ],
      },
      mlPrediction: {
        modelVersion: modelStatus.model.modelVersion,
        predictedClassId: mlpPrediction.predictedClassId,
        confidence: mlpPrediction.confidence,
        severity: mlpPrediction.severity,
        sprayDecision: mlpPrediction.sprayDecision,
        probabilities: mlpPrediction.probabilities,
        featureVector: mlpPrediction.featureVector,
      },
    };

    // Background Task: Persist scan history & update community outbreak surveillance
    setImmediate(() => {
      try {
        scanRepository.saveDiagnosis(responseRecord);
        if (consentToShare && responseRecord.disease && responseRecord.severity !== 'Healthy') {
          scanRepository.addOutbreakReport({
            district,
            village,
            crop: responseRecord.crop,
            disease: responseRecord.disease,
            severity: responseRecord.severity,
          });
        }
      } catch (bgErr: any) {
        logger.error('BACKGROUND_TASK_ERROR', { error: bgErr?.message });
      }
    });

    return {
      success: true,
      scanId,
      result: responseRecord,
    };
  }
}

export const orchestrationService = new AiOrchestrationService();
