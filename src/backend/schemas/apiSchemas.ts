// Domain Contracts & API Schemas (src/backend/schemas/apiSchemas.ts)
export interface ImageQualityMetricsSchema {
  blurScore: number; // 0..100 (higher = sharper)
  lightingScore: number; // 0..100 (optimal 35..85)
  resolutionValid: boolean;
  leafVisibilityPct: number; // 0..100
  overlappingLeaves: boolean;
  isAcceptable: boolean;
  rejectionReasons: string[];
}

export interface TopDiseasePredictionSchema {
  diseaseId: string;
  diseaseName: string;
  diseaseNameUr: string;
  diseaseNamePs: string;
  confidence: number;
}

export interface HybridConsensusResultSchema {
  agreementLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceTier: 'High Confidence' | 'Medium Confidence' | 'Low Confidence';
  finalConfidence: number;
  geminiPrediction: string;
  geminiConfidence: number;
  leafVisionTop1: string;
  leafVisionTop1Confidence: number;
  matchedModelRank: 1 | 2 | 3 | null;
  withholdTreatment: boolean;
  requiresAdditionalImage: boolean;
  consensusExplanation: string;
  consensusExplanationUr: string;
  consensusExplanationPs: string;
}

export interface LeafBiomarkersSchema {
  greenHealthyPct: number;
  yellowChloroticPct: number;
  brownNecroticPct: number;
}

export interface DiagnosisRequestSchema {
  imageBase64: string;
  secondaryImages?: {
    wholePlantBase64?: string;
    stemBase64?: string;
    fruitBase64?: string;
  };
  sampleId?: string;
  cropHint?: string;
  consensusTestMode?: 'AUTO' | 'HIGH' | 'MEDIUM' | 'LOW';
  plantingDate?: string;
  daysSincePlanting?: number;
  recentlySprayedPesticide?: boolean;
  recentPesticideName?: string;
  growthStage?: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvest';
  symptoms?: string[];
  biomarkers?: LeafBiomarkersSchema | null;
  imageQuality?: ImageQualityMetricsSchema | null;
  district?: string;
  village?: string;
  consentToShare?: boolean;
}

export interface RankedRagDocument {
  id: string;
  title: string;
  source: string;
  crop: string;
  disease: string;
  relevanceScore: number;
  decisionRules: string[];
  approvedTreatments: Array<{
    name: string;
    dosage: string;
    withholding: string;
    ppe: string;
  }>;
  organicAlternatives: string[];
}

export interface DecisionEngineInput {
  predictedClassId: string;
  confidenceScore: number;
  crop: string;
  growthStage: string;
  weather: {
    district: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    rainProbability: number;
    condition: string;
    spraySuitability: string;
    weatherAdvice: string;
  };
  farmerLocation: {
    district: string;
    village: string;
  };
  ragDocuments: RankedRagDocument[];
  symptoms: string[];
  biomarkers: LeafBiomarkersSchema;
}

export interface DecisionEngineOutput {
  crop: string;
  disease: string;
  severity: 'Healthy' | 'Mild' | 'Moderate' | 'Severe';
  confidence: number;
  action: string;
  bestTime: string;
  warnings: string[];
  irrigationAdvice: string;
  confidenceExplanation: string;
  why: string[];
  detailedExplanation: string;
  approvedTreatments: Array<{
    name: string;
    dosage: string;
    withholding: string;
    ppe: string;
  }>;
  organicAlternatives: string[];
  nextReviewDays: number;
  consultOfficer: boolean;
  translations: {
    ur: {
      cropName: string;
      disease: string;
      action: string;
      bestTime: string;
      whySummary: string;
      whyPoints: string[];
      medicineName: string;
      dosageText: string;
      safetyText: string;
      voiceScript: string;
    };
    ps: {
      cropName: string;
      disease: string;
      action: string;
      bestTime: string;
      whySummary: string;
      whyPoints: string[];
      medicineName: string;
      dosageText: string;
      safetyText: string;
      voiceScript: string;
    };
  };
}
