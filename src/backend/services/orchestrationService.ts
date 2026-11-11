import { DiagnosisRequestSchema } from '../schemas/apiSchemas.ts';
import { visionAndMlPipeline } from '../vision/imagePipeline.ts';
import { diagnosisPipeline } from '../pipelines/diagnosisPipeline.ts';
import { scanRepository } from '../repositories/scanRepository.ts';
import { logger } from '../middleware/apiMiddleware.ts';

/**
 * AI Diagnosis Pipeline Orchestration Service
 *
 * Delegates stage execution to `diagnosisPipeline` (`pipelines/diagnosisPipeline.ts`)
 * and handles API response assembly and background outbreak logging.
 */
export class AiOrchestrationService {
  async executeDiagnosisPipeline(payload: DiagnosisRequestSchema) {
    const startTime = Date.now();
    const { consentToShare = true } = payload;

    const {
      finalRecommendation,
      weather,
      ragContext,
      mlpPrediction,
      district,
      village,
    } = await diagnosisPipeline.runStages(payload);

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
          '4_CONFIDENCE_SCORING',
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
