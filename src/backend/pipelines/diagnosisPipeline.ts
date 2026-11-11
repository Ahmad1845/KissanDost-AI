import { DiagnosisRequestSchema } from '../schemas/apiSchemas.ts';
import { visionAndMlPipeline } from '../vision/imagePipeline.ts';
import { ragService } from '../rag/ragService.ts';
import { weatherService } from '../weather/weatherService.ts';
import { decisionEngine } from '../diagnosis/decisionEngine.ts';
import { geminiAiService } from '../llm/geminiService.ts';

/**
 * Multi-Stage Crop Diagnosis Pipeline (src/backend/pipelines/diagnosisPipeline.ts)
 * Coordinates Image Validation -> Biomarker Extraction -> Disease Classification ->
 * Weather API -> RAG Retrieval -> Rule-Based Decision Engine -> Gemini Synthesis.
 */
export class CropDiagnosisPipeline {
  async runStages(payload: DiagnosisRequestSchema) {
    const {
      imageBase64,
      sampleId = '',
      cropHint = 'Tomato',
      growthStage = 'Vegetative',
      symptoms = [],
      biomarkers: rawBiomarkers = null,
      district = 'Mardan',
      village = 'Gujar Garhi',
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

    // 3. Weather API Retrieval
    const weather = await weatherService.getDistrictWeather(district);

    // 4. Disease Prediction (MLP Classifier)
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

    // 6. Rule-Based Decision Engine (independent of the LLM)
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

    // 7. Gemini Grounded Synthesis
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

    return {
      finalRecommendation,
      weather,
      ragContext,
      mlpPrediction,
      district,
      village,
    };
  }
}

export const diagnosisPipeline = new CropDiagnosisPipeline();
