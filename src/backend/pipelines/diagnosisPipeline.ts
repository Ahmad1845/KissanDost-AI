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
      secondaryImages,
      sampleId = '',
      cropHint,
      consensusTestMode = 'AUTO',
      plantingDate,
      daysSincePlanting,
      recentlySprayedPesticide = false,
      recentPesticideName = '',
      growthStage: explicitGrowthStage,
      symptoms: explicitSymptoms = [],
      biomarkers: rawBiomarkers = null,
      imageQuality: rawImageQuality = null,
      district = 'Mardan',
      village = 'Gujar Garhi',
    } = payload;

    // 1A. Image Payload Validation
    const validation = visionAndMlPipeline.validateImagePayload(imageBase64);
    if (!validation.isValid) {
      throw Object.assign(new Error(validation.error || 'Invalid crop leaf image.'), {
        statusCode: 400,
        code: 'INVALID_IMAGE',
      });
    }

    // 1B. Image Quality Check (Blur, Lighting, Resolution, Leaf Visibility, Overlapping Leaves)
    const qualityEvaluation = visionAndMlPipeline.evaluateImageQuality(rawImageQuality);
    if (!qualityEvaluation.isAcceptable) {
      throw Object.assign(
        new Error(
          qualityEvaluation.rejectionReasons[0] ||
            'Image quality is too poor for reliable diagnosis. Please retake a clearer photo of the leaf.'
        ),
        {
          statusCode: 400,
          code: 'POOR_IMAGE_QUALITY',
        }
      );
    }

    // 2. Image Preprocessing & Biomarker Extraction
    let normalizedBiomarkers = visionAndMlPipeline.preprocessBiomarkers(
      rawBiomarkers,
      sampleId,
      explicitSymptoms
    );

    const isSynthetic = validation.isSyntheticSample || Boolean(sampleId);
    let calibratedExplicitSymptoms = [...explicitSymptoms];

    // 2B. Fast Visual Pathology Calibration (Gemini 3.1 Flash Lite / 2.5 Flash Lite)
    // Ensures real photos with dark vein blight, angular leaf spots, or leaf curl are never misclassified as healthy,
    // and truly clean healthy leaves are verified accurately.
    if (!isSynthetic && geminiAiService.isConfigured()) {
      const fastInspection = await geminiAiService.inspectLeafImageFast({
        mimeType: validation.mimeType,
        cleanBase64: validation.cleanBase64,
        cropHint: cropHint || 'Cotton',
      });

      if (fastInspection) {
        if (fastInspection.isPlantLeaf === false || fastInspection.diseaseCategory === 'not_a_leaf') {
          throw Object.assign(
            new Error(
              'No plant leaf detected in this photo. Please take a clear photo of a crop leaf.'
            ),
            {
              statusCode: 400,
              code: 'NOT_A_PLANT_LEAF',
            }
          );
        }
        if (!fastInspection.isHealthy || fastInspection.severity !== 'Healthy') {
          const isCurl = fastInspection.diseaseCategory === 'leaf_curl';
          const brown = Math.max(
            normalizedBiomarkers.brownNecroticPct,
            fastInspection.estimatedBrownNecroticPct || 0,
            isCurl ? 6 : 18
          );
          const yellow = Math.max(
            normalizedBiomarkers.yellowChloroticPct,
            fastInspection.estimatedYellowPct || 0,
            isCurl ? 28 : 10
          );
          const green = Math.max(0, 100 - brown - yellow);
          normalizedBiomarkers = {
            greenHealthyPct: green,
            yellowChloroticPct: yellow,
            brownNecroticPct: brown,
          };
          calibratedExplicitSymptoms = calibratedExplicitSymptoms.filter(
            (s) => s !== 'healthy_green'
          );
          if (!isCurl && !calibratedExplicitSymptoms.includes('brown_spots')) {
            calibratedExplicitSymptoms.push('brown_spots');
          }
        } else if (
          fastInspection.isHealthy &&
          (fastInspection.estimatedBrownNecroticPct ?? 0) <= 4 &&
          normalizedBiomarkers.brownNecroticPct <= 10
        ) {
          normalizedBiomarkers = {
            greenHealthyPct: 95,
            yellowChloroticPct: 4,
            brownNecroticPct: 1,
          };
          calibratedExplicitSymptoms = ['healthy_green'];
        }
      }
    }

    // 3. Weather API Retrieval
    const weather = await weatherService.getDistrictWeather(district);

    // 4. LeafVision Model Analysis (Farmer-Selected Crop + Top-3 Diseases + Severity + Planting-Date Growth Stage)
    const { mlpPrediction, visionAnalysis } = visionAndMlPipeline.analyzeLeafImageAutomatically({
      biomarkers: normalizedBiomarkers,
      sampleId,
      cropHint,
      plantingDate,
      daysSincePlanting,
      secondaryImages,
      weather,
    });

    const resolvedCrop = cropHint || visionAnalysis.detectedCrop;
    const resolvedGrowthStage = explicitGrowthStage || visionAnalysis.estimatedGrowthStage;
    const resolvedSymptomKeys =
      calibratedExplicitSymptoms.length > 0
        ? calibratedExplicitSymptoms
        : visionAnalysis.internalSymptomKeys;

    // 5. RAG Knowledge Retrieval
    const ragContext = ragService.retrieveAndRankContext({
      crop: resolvedCrop,
      predictedClassId: mlpPrediction.predictedClassId,
      symptoms: resolvedSymptomKeys,
      district,
      topK: 3,
    });

    // 6. Rule-Based Decision Engine (independent of the LLM)
    const deterministicDecision = decisionEngine.evaluate({
      predictedClassId: mlpPrediction.predictedClassId,
      confidenceScore: visionAnalysis.diseaseConfidence,
      crop: resolvedCrop,
      growthStage: resolvedGrowthStage,
      weather,
      farmerLocation: { district, village },
      ragDocuments: ragContext.rankedDocuments,
      symptoms: resolvedSymptomKeys,
      biomarkers: normalizedBiomarkers,
    });

    // If pesticide was recently sprayed, append a resistance/interval warning
    if (recentlySprayedPesticide) {
      const sprayNote = recentPesticideName
        ? `Note: ${recentPesticideName} was recently sprayed. Avoid repeating the same chemical class within 7 days to prevent resistance and leaf burn.`
        : 'Note: Pesticides were recently sprayed on this crop. Observe a minimum 7-day interval before re-spraying.';
      if (!deterministicDecision.warnings.includes(sprayNote)) {
        deterministicDecision.warnings = [sprayNote, ...deterministicDecision.warnings];
      }
    }

    // 7. Gemini Grounded Synthesis (Hybrid Vision Partner verifying LeafVision Top-3 for the selected crop)
    let finalRecommendation = deterministicDecision;
    let geminiRawDisease: string | undefined = undefined;
    let geminiRawSeverity: 'Healthy' | 'Mild' | 'Moderate' | 'Severe' | undefined = undefined;
    let geminiRawConfidence: number | undefined = undefined;

    if (!isSynthetic && geminiAiService.isConfigured()) {
      const modelStatus = visionAndMlPipeline.getModelStatus();
      const llmRefinement = await geminiAiService.generateGroundedRecommendation({
        mimeType: validation.mimeType,
        cleanBase64: validation.cleanBase64,
        cropHint: resolvedCrop,
        district,
        weather,
        symptoms: visionAnalysis.detectedSymptoms,
        biomarkers: normalizedBiomarkers,
        mlpPrediction,
        modelVersion: modelStatus.model.modelVersion,
        ragPromptContext: ragContext.promptContextBlock,
        baselineDecision: deterministicDecision,
      });

      if (llmRefinement && llmRefinement.disease && llmRefinement.action) {
        const allOtherCrops = [
          { en: 'tomato', ur: 'ٹماٹر' },
          { en: 'wheat', ur: 'گندم' },
          { en: 'maize', ur: 'مکئی' },
          { en: 'potato', ur: 'آلو' },
          { en: 'chili', ur: 'مرچ' },
          { en: 'cotton', ur: 'کپاس' },
          { en: 'onion', ur: 'پیاز' },
        ].filter((c) => c.en !== resolvedCrop.toLowerCase());

        const combinedDiseaseText = `${llmRefinement.disease} ${llmRefinement.translations?.ur?.disease || ''}`.toLowerCase();
        const wrongCropMentioned = allOtherCrops.some(
          (other) => combinedDiseaseText.includes(other.en) || combinedDiseaseText.includes(other.ur)
        );

        const geminiSaysHealthy =
          llmRefinement.severity === 'Healthy' ||
          combinedDiseaseText.includes('healthy') ||
          combinedDiseaseText.includes('صحت مند') ||
          combinedDiseaseText.includes('روغ');

        if (geminiSaysHealthy && normalizedBiomarkers.brownNecroticPct <= 5) {
          const healthyDecision = decisionEngine.evaluate({
            predictedClassId: 'Healthy_Crop',
            confidenceScore: 97,
            crop: resolvedCrop,
            growthStage: resolvedGrowthStage,
            weather,
            farmerLocation: { district, village },
            ragDocuments: ragContext.rankedDocuments,
            symptoms: ['healthy_green'],
            biomarkers: { greenHealthyPct: 95, yellowChloroticPct: 4, brownNecroticPct: 1 },
          });
          finalRecommendation = healthyDecision;
          geminiRawDisease = healthyDecision.disease;
          geminiRawSeverity = 'Healthy';
          geminiRawConfidence = 97;
        } else if (!wrongCropMentioned) {
          geminiRawDisease = llmRefinement.disease;
          geminiRawSeverity = llmRefinement.severity;
          geminiRawConfidence = llmRefinement.confidence;
          finalRecommendation = {
            ...deterministicDecision,
            ...llmRefinement,
            crop: resolvedCrop,
            warnings: deterministicDecision.warnings,
            irrigationAdvice: deterministicDecision.irrigationAdvice,
            confidenceExplanation: deterministicDecision.confidenceExplanation,
            translations: {
              ur: {
                ...(deterministicDecision.translations?.ur || {
                  disease: llmRefinement.disease,
                  action: llmRefinement.action,
                  bestTime: llmRefinement.bestTime || deterministicDecision.bestTime,
                  whySummary: deterministicDecision.detailedExplanation,
                }),
                ...(llmRefinement.translations?.ur || {}),
                cropName: deterministicDecision.translations?.ur?.cropName || resolvedCrop,
              },
              ps: {
                ...(deterministicDecision.translations?.ps || {
                  disease: llmRefinement.disease,
                  action: llmRefinement.action,
                  bestTime: llmRefinement.bestTime || deterministicDecision.bestTime,
                  whySummary: deterministicDecision.detailedExplanation,
                }),
                ...(llmRefinement.translations?.ps || {}),
                cropName: deterministicDecision.translations?.ps?.cropName || resolvedCrop,
              },
            },
          };
        }
      }
    }

    // 8. Hybrid Consensus Engine (Combines LeafVision Top-3 + Gemini into the single best decision)
    const hybridConsensus = visionAndMlPipeline.evaluateHybridConsensus({
      crop: resolvedCrop,
      top3Predictions: visionAnalysis.top3Predictions,
      geminiDisease: geminiRawDisease || finalRecommendation.disease,
      geminiSeverity: geminiRawSeverity || finalRecommendation.severity,
      geminiConfidence: geminiRawConfidence || finalRecommendation.confidence,
      consensusTestMode,
    });

    finalRecommendation.confidence = hybridConsensus.finalConfidence;
    finalRecommendation.confidenceExplanation = `${hybridConsensus.consensusExplanation} | ${finalRecommendation.confidenceExplanation}`;

    return {
      finalRecommendation,
      visionAnalysis,
      hybridConsensus,
      recentlySprayedPesticide,
      weather,
      ragContext,
      mlpPrediction,
      district,
      village,
    };
  }
}

export const diagnosisPipeline = new CropDiagnosisPipeline();
