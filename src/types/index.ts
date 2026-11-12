// Frontend Domain Types (src/types/index.ts)
export type Language = 'en' | 'ur' | 'ps';
export type UserRole = 'farmer' | 'officer';
export type VoicePersona = 'elder' | 'female';

export type SeverityLevel = 'Healthy' | 'Mild' | 'Moderate' | 'Severe';

export interface Farm {
  id: string;
  name: string;
  district: string;
  village: string;
  cropType: string;
  areaAcres: number;
  plantingDate: string;
  createdAt: string;
}

export interface WeatherSnapshot {
  district: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  rainProbability: number;
  condition: string;
  spraySuitability: string;
  weatherAdvice: string;
}

export interface ApprovedTreatment {
  name: string;
  dosage: string;
  withholding: string;
  ppe: string;
}

export interface LocalizedRecommendationContent {
  cropName?: string;
  disease: string;
  action: string;
  bestTime: string;
  whySummary: string;
  whyPoints?: string[];
  medicineName?: string;
  dosageText?: string;
  safetyText?: string;
  voiceScript?: string;
}

export interface MLPredictionSummary {
  modelVersion: string;
  predictedClassId: string;
  confidence: number;
  severity: SeverityLevel;
  sprayDecision: 'NO_SPRAY_NEEDED' | 'DELAY_FOR_RAIN' | 'SPRAY_TOMORROW_MORNING' | 'EMERGENCY_MORNING_SPRAY';
  probabilities: {
    classId: string;
    nameEn: string;
    nameUr: string;
    probability: number;
  }[];
  featureVector: number[];
}

export interface HybridConsensusSummary {
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

export interface RecommendationResult {
  scanId: string;
  crop: string;
  cropConfidence?: number;
  disease: string;
  diseaseConfidence?: number;
  top3Predictions?: {
    diseaseId: string;
    diseaseName: string;
    diseaseNameUr: string;
    diseaseNamePs: string;
    confidence: number;
  }[];
  hybridConsensus?: HybridConsensusSummary;
  pathogen?: string;
  severity: SeverityLevel;
  affectedLeafPct?: number;
  detectedSymptoms?: string[];
  cropAgeDays?: number;
  estimatedGrowthStage?: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvest';
  recentlySprayedPesticide?: boolean;
  predictionExplanation?: string;
  confidence: number;
  action: string;
  bestTime: string;
  why: string[];
  detailedExplanation: string;
  weatherSnapshot: WeatherSnapshot;
  approvedTreatments: ApprovedTreatment[];
  organicAlternatives: string[];
  nextReviewDays: number;
  consultOfficer: boolean;
  officerContactReason?: string;
  groundedSources?: { title: string; source: string }[];
  scanTimestamp: string;
  imageUrl?: string;
  district: string;
  mlPrediction?: MLPredictionSummary;
  translations?: {
    ur?: LocalizedRecommendationContent;
    ps?: LocalizedRecommendationContent;
  };
}

export interface TimelineEvent {
  id: string;
  farmId: string;
  dayLabel: string;
  title: string;
  date: string;
  status: 'detected' | 'treated' | 'recovering' | 'healthy';
  description: string;
  crop: string;
  disease?: string;
  severity?: SeverityLevel;
  pesticideUsed?: string;
}
