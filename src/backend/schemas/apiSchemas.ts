export interface LeafBiomarkersSchema {
  greenHealthyPct: number;
  yellowChloroticPct: number;
  brownNecroticPct: number;
}

export interface DiagnosisRequestSchema {
  imageBase64: string;
  sampleId?: string;
  cropHint?: string;
  growthStage?: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvest';
  symptoms?: string[];
  biomarkers?: LeafBiomarkersSchema | null;
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
