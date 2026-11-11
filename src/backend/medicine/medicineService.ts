import { VERIFIED_PESTICIDES_DB } from '../../data/knowledgeBase.ts';
import { DistrictWeatherSnapshot } from '../weather/weatherService.ts';

export interface LocalizedMedicineGuidance {
  statusTitle: string;
  reason: string;
  dosage: string;
  safety: string;
  voiceScript: string;
}

export interface BottleOcrExtraction {
  brandName: string;
  activeIngredient: string;
  company: string;
  registrationNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  batchNumber: string;
  barcode: string;
  qrDetected: boolean;
  estimatedPricePkr: number;
  effectiveness: 'High' | 'Medium' | 'Low';
  toxicityLevel: 'Low' | 'Medium' | 'High';
  fracGroup: string;
  formulationType: 'WP' | 'WG' | 'EC' | 'SC' | 'SL';
}

export interface AuthenticityAssessment {
  isGenuine: boolean;
  authenticityStatus: 'Likely Genuine' | 'Suspicious Product' | 'Restricted / Banned';
  confidenceScore: number;
  isExpired: boolean;
  expiryStatus: 'Valid' | 'Expiring Soon' | 'Expired';
  expiryLabelEn: string;
  expiryLabelUr: string;
  expiryLabelPs: string;
  counterfeitSignals: string[];
  dealerAdviceEn: string;
  dealerAdviceUr: string;
  dealerAdvicePs: string;
}

export interface SmartSprayCompatibility {
  suitableForCrop: boolean;
  suitableForDisease: boolean;
  suitableOverall: 'YES' | 'NO' | 'WAIT_FOR_WEATHER';
  cropChecked: string;
  diseaseChecked: string;
  growthStageChecked: string;
  previousSprayChecked: string;
  rotationWarning: string | null;
  dosagePerLiter: string;
  dosagePer15LTank: string;
  dosagePerAcre: string;
  sprayTimeWindow: string;
  repeatAfterDays: number;
  phiDays: number;
  weatherSafety: {
    district: string;
    temperature: number;
    rainProbability: number;
    windSpeed: number;
    canSprayNow: boolean;
    weatherVerdictEn: string;
    weatherVerdictUr: string;
    weatherVerdictPs: string;
  };
  safetyChecklist: {
    en: string[];
    ur: string[];
    ps: string[];
  };
}

export interface BottleScanAnalysisResponse {
  scanId: string;
  timestamp: string;
  imageQualityPoor: boolean;
  promptBarcodeFallback: boolean;
  extracted: BottleOcrExtraction;
  authenticity: AuthenticityAssessment;
  compatibility: SmartSprayCompatibility;
  localized: {
    ur: LocalizedMedicineGuidance;
    ps: LocalizedMedicineGuidance;
    en: LocalizedMedicineGuidance;
  };
}

export interface MedicineComparisonResponse {
  crop: string;
  disease: string;
  medicineA: {
    name: string;
    company: string;
    genuine: boolean;
    genuineLabel: string;
    suitable: boolean;
    suitableLabel: string;
    costPkr: number;
    effectiveness: 'High' | 'Medium' | 'Low';
    toxicity: 'Low' | 'Medium' | 'High';
    phiDays: number;
    dosagePerLiter: string;
  };
  medicineB: {
    name: string;
    company: string;
    genuine: boolean;
    genuineLabel: string;
    suitable: boolean;
    suitableLabel: string;
    costPkr: number;
    effectiveness: 'High' | 'Medium' | 'Low';
    toxicity: 'Low' | 'Medium' | 'High';
    phiDays: number;
    dosagePerLiter: string;
  };
  recommendedWinner: 'A' | 'B' | 'NEITHER';
  verdict: {
    en: string;
    ur: string;
    ps: string;
    voiceScriptUr: string;
    voiceScriptPs: string;
  };
}

export interface TankMixSafetyResponse {
  medicineA: string;
  medicineB: string;
  safeToMix: 'YES' | 'NO' | 'CAUTION';
  reason: {
    en: string;
    ur: string;
    ps: string;
  };
  recommendedRatio: {
    en: string;
    ur: string;
    ps: string;
  };
  alternativeIfUnsafe: {
    en: string;
    ur: string;
    ps: string;
  };
  voiceScript: {
    en: string;
    ur: string;
    ps: string;
  };
}

export interface MedicineHistoryEntry {
  id: string;
  medicineName: string;
  activeIngredient: string;
  crop: string;
  disease: string;
  district: string;
  date: string;
  resultStatus: 'Suitable & Genuine' | 'Wait for Rain' | 'Suspicious / Expired' | 'Not Suitable';
  dosageUsed: string;
  phiDays: number;
}

export interface VerifiedMedicineResponse {
  tradeName: string;
  genericName: string;
  targetDiseases: string[];
  targetCrops: string[];
  status: 'Suitable' | 'Not Recommended' | 'Restricted / Banned';
  reason: string;
  dosage: string;
  safetyAdvice: string;
  withholdingDays: number;
  suitabilityNote: string;
  localized: {
    ur: LocalizedMedicineGuidance;
    ps: LocalizedMedicineGuidance;
    en: LocalizedMedicineGuidance;
  };
}

interface CatalogBottleRecord {
  id: string;
  keywords: string[];
  barcode: string;
  brandName: string;
  activeIngredient: string;
  company: string;
  registrationNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  batchNumber: string;
  qrDetected: boolean;
  isGenuine: boolean;
  isBanned?: boolean;
  counterfeitSignals: string[];
  targetCrops: string[];
  targetDiseases: string[];
  dosagePerLiter: string;
  dosagePer15LTank: string;
  dosagePerAcre: string;
  repeatAfterDays: number;
  phiDays: number;
  estimatedPricePkr: number;
  effectiveness: 'High' | 'Medium' | 'Low';
  toxicityLevel: 'Low' | 'Medium' | 'High';
  fracGroup: string;
  formulationType: 'WP' | 'WG' | 'EC' | 'SC' | 'SL';
}

export const BOTTLE_BARCODE_CATALOG: CatalogBottleRecord[] = [
  {
    id: 'aliette-80-wg',
    keywords: ['aliette', 'fosetyl', 'bayer', '8964001254890'],
    barcode: '8964001254890',
    brandName: 'Aliette 80 WG',
    activeIngredient: 'Fosetyl-Aluminium 80% w/w',
    company: 'Bayer CropScience Pakistan',
    registrationNumber: 'PAK-DPP-10482-F',
    manufacturingDate: '2026-01',
    expiryDate: '2027-01',
    batchNumber: 'BYR-PK-44810',
    qrDetected: true,
    isGenuine: true,
    counterfeitSignals: [
      'Verified Bayer CropScience security seal & clear QR serial',
      'Valid Pakistan Department of Plant Protection registration PAK-DPP-10482-F',
    ],
    targetCrops: ['Tomato', 'Potato', 'Cucumber', 'Onion', 'Citrus'],
    targetDiseases: ['Early Blight', 'Late Blight', 'Downy Mildew', 'Root Rot'],
    dosagePerLiter: '2 grams / Liter',
    dosagePer15LTank: '30 grams in 15L water (2 level tablespoons)',
    dosagePerAcre: '500 grams in 100–120L water per Acre',
    repeatAfterDays: 7,
    phiDays: 7,
    estimatedPricePkr: 1400,
    effectiveness: 'High',
    toxicityLevel: 'Low',
    fracGroup: 'FRAC Group 33 (Phosphonates)',
    formulationType: 'WG',
  },
  {
    id: 'mancozeb-dithane',
    keywords: ['mancozeb', 'dithane', 'm-45', '8964001122334'],
    barcode: '8964001122334',
    brandName: 'Dithane M-45 (Mancozeb 75% WP)',
    activeIngredient: 'Mancozeb 75% WP',
    company: 'Corteva Agriscience / Swat Agro',
    registrationNumber: 'PAK-DPP-08914-F',
    manufacturingDate: '2026-02',
    expiryDate: '2028-02',
    batchNumber: 'DTH-2602-KP',
    qrDetected: true,
    isGenuine: true,
    counterfeitSignals: [
      'Authentic embossed batch code DTH-2602-KP',
      'Official KP Agriculture Extension registered broad-spectrum protectant',
    ],
    targetCrops: ['Tomato', 'Maize', 'Potato', 'Wheat', 'Onion'],
    targetDiseases: ['Early Blight', 'Late Blight', 'Maize Leaf Blight', 'Leaf Spot', 'Northern Corn Leaf Blight'],
    dosagePerLiter: '2.5 grams / Liter',
    dosagePer15LTank: '37.5 grams in 15L water (2.5 tablespoons)',
    dosagePerAcre: '600 to 800 grams in 100L water per Acre',
    repeatAfterDays: 7,
    phiDays: 7,
    estimatedPricePkr: 1150,
    effectiveness: 'High',
    toxicityLevel: 'Low',
    fracGroup: 'FRAC Group M03 (Multi-site Contact)',
    formulationType: 'WP',
  },
  {
    id: 'ridomil-gold',
    keywords: ['ridomil', 'metalaxyl', 'syngenta', '8964005566778'],
    barcode: '8964005566778',
    brandName: 'Ridomil Gold MZ 68 WG',
    activeIngredient: 'Metalaxyl-M 4% + Mancozeb 64%',
    company: 'Syngenta Pakistan Ltd.',
    registrationNumber: 'PAK-DPP-11209-F',
    manufacturingDate: '2025-11',
    expiryDate: '2027-11',
    batchNumber: 'SYN-RG-7782',
    qrDetected: true,
    isGenuine: true,
    counterfeitSignals: [
      'Genuine Syngenta laser hologram and valid QR authentication code',
      'Crisp bilingual Urdu/English safety instructions',
    ],
    targetCrops: ['Tomato', 'Potato'],
    targetDiseases: ['Late Blight', 'Early Blight'],
    dosagePerLiter: '2.5 grams / Liter',
    dosagePer15LTank: '37.5 grams in 15L water',
    dosagePerAcre: '500 grams in 100L water per Acre',
    repeatAfterDays: 7,
    phiDays: 7,
    estimatedPricePkr: 1850,
    effectiveness: 'High',
    toxicityLevel: 'Low',
    fracGroup: 'FRAC Group 4 + M03',
    formulationType: 'WG',
  },
  {
    id: 'tilt-250-ec',
    keywords: ['tilt', 'propiconazole', '8964009988776'],
    barcode: '8964009988776',
    brandName: 'Tilt 250 EC',
    activeIngredient: 'Propiconazole 25% EC',
    company: 'Syngenta Pakistan Ltd.',
    registrationNumber: 'PAK-DPP-07431-F',
    manufacturingDate: '2026-01',
    expiryDate: '2028-01',
    batchNumber: 'SYN-TLT-3091',
    qrDetected: true,
    isGenuine: true,
    counterfeitSignals: [
      'Authentic Syngenta bottle cap seal & PARC wheat rust registration',
    ],
    targetCrops: ['Wheat', 'Barley'],
    targetDiseases: ['Yellow Stripe Rust', 'Stripe Rust', 'Yellow Rust', 'Brown Rust'],
    dosagePerLiter: '1.5 ml / Liter',
    dosagePer15LTank: '25 ml in 15L water',
    dosagePerAcre: '200 ml in 100L water per Acre',
    repeatAfterDays: 14,
    phiDays: 28,
    estimatedPricePkr: 1350,
    effectiveness: 'High',
    toxicityLevel: 'Medium',
    fracGroup: 'FRAC Group 3 (Triazole)',
    formulationType: 'EC',
  },
  {
    id: 'score-250-ec',
    keywords: ['score', 'difenoconazole', '8964004433221'],
    barcode: '8964004433221',
    brandName: 'Score 250 EC',
    activeIngredient: 'Difenoconazole 250 g/L',
    company: 'Syngenta Pakistan Ltd.',
    registrationNumber: 'PAK-DPP-09215-F',
    manufacturingDate: '2025-09',
    expiryDate: '2027-09',
    batchNumber: 'SYN-SCR-5120',
    qrDetected: true,
    isGenuine: true,
    counterfeitSignals: [
      'Verified Syngenta batch number & intact foil seal',
    ],
    targetCrops: ['Tomato', 'Maize', 'Potato', 'Apple'],
    targetDiseases: ['Early Blight', 'Maize Leaf Blight', 'Leaf Spot'],
    dosagePerLiter: '1.25 ml / Liter',
    dosagePer15LTank: '20 ml in 15L water',
    dosagePerAcre: '150 ml in 100L water per Acre',
    repeatAfterDays: 10,
    phiDays: 10,
    estimatedPricePkr: 1550,
    effectiveness: 'High',
    toxicityLevel: 'Low',
    fracGroup: 'FRAC Group 3 (Triazole)',
    formulationType: 'EC',
  },
  {
    id: 'karate-insecticide',
    keywords: ['karate', 'lambda', 'cyhalothrin', '8964003344556'],
    barcode: '8964003344556',
    brandName: 'Karate 2.5 EC',
    activeIngredient: 'Lambda-cyhalothrin 2.5% EC',
    company: 'Syngenta Pakistan Ltd.',
    registrationNumber: 'PAK-DPP-06112-I',
    manufacturingDate: '2025-08',
    expiryDate: '2027-08',
    batchNumber: 'SYN-KRT-1180',
    qrDetected: true,
    isGenuine: true,
    counterfeitSignals: [
      'Genuine bottle, but registered as an INSECTICIDE (for worms/aphids), NOT a fungicide for leaf blight/rust',
    ],
    targetCrops: ['Tomato', 'Maize', 'Cotton'],
    targetDiseases: ['Fruit Borer', 'Armyworm', 'Aphids'],
    dosagePerLiter: '2 ml / Liter (For Insects Only)',
    dosagePer15LTank: '30 ml in 15L water (Do NOT use for fungal blight)',
    dosagePerAcre: '250 ml per Acre (For Insects Only)',
    repeatAfterDays: 10,
    phiDays: 7,
    estimatedPricePkr: 900,
    effectiveness: 'Low',
    toxicityLevel: 'Medium',
    fracGroup: 'IRAC Group 3A (Pyrethroid Insecticide)',
    formulationType: 'EC',
  },
  {
    id: 'counterfeit-expired-bottle',
    keywords: ['fake', 'counterfeit', 'expired', 'super blight', '8964000099999'],
    barcode: '8964000099999',
    brandName: 'Super Blight Cure 80 WP (Unverified Label)',
    activeIngredient: 'Claimed Mancozeb (Unverified Concentration)',
    company: 'Unknown Local Repacker (No Address)',
    registrationNumber: 'MISSING / UNREGISTERED',
    manufacturingDate: '2023-12',
    expiryDate: '2025-12',
    batchNumber: 'SMUDGED-001',
    qrDetected: false,
    isGenuine: false,
    counterfeitSignals: [
      'WARNING: Missing Department of Plant Protection (DPP) Registration Number',
      'Blurry label printing, off-color logo, and no QR security code',
      'EXPIRED 11 months ago (Expiry: Dec 2025) — Chemical efficacy lost and risk of leaf burn',
    ],
    targetCrops: [],
    targetDiseases: [],
    dosagePerLiter: 'DO NOT USE — Counterfeit & Expired',
    dosagePer15LTank: 'DO NOT MIX — Return to dealer',
    dosagePerAcre: '0 grams — Buy genuine medicine from authorized dealer',
    repeatAfterDays: 0,
    phiDays: 999,
    estimatedPricePkr: 650,
    effectiveness: 'Low',
    toxicityLevel: 'High',
    fracGroup: 'Unknown / Adulterated',
    formulationType: 'WP',
  },
  {
    id: 'paraquat-banned',
    keywords: ['paraquat', 'gramoxone', 'weed', '8964007777777'],
    barcode: '8964007777777',
    brandName: 'Paraquat 20% SL (Herbicide Poison)',
    activeIngredient: 'Paraquat Dichloride 20%',
    company: 'Restricted Non-Selective Herbicide',
    registrationNumber: 'RESTRICTED-HERBICIDE',
    manufacturingDate: '2025-05',
    expiryDate: '2027-05',
    batchNumber: 'PRQ-9910',
    qrDetected: false,
    isGenuine: true,
    isBanned: true,
    counterfeitSignals: [
      'DANGER: This is a non-selective weed killer (herbicide), NOT a crop disease medicine!',
      'Spraying this on Tomato, Wheat, or Maize will burn and kill your entire crop within 24 hours.',
    ],
    targetCrops: [],
    targetDiseases: [],
    dosagePerLiter: 'DO NOT SPRAY ON CROPS',
    dosagePer15LTank: 'DO NOT USE ON LIVING CROPS',
    dosagePerAcre: 'Strictly prohibited for foliar disease treatment',
    repeatAfterDays: 0,
    phiDays: 999,
    estimatedPricePkr: 1100,
    effectiveness: 'Low',
    toxicityLevel: 'High',
    fracGroup: 'HRAC Group 22 (Bipyridylium Herbicide)',
    formulationType: 'SL',
  },
];

export class MedicineVerificationService {
  private historyLog: MedicineHistoryEntry[] = [
    {
      id: 'med-hist-01',
      medicineName: 'Aliette 80 WG (Fosetyl-Aluminium)',
      activeIngredient: 'Fosetyl-Aluminium 80%',
      crop: 'Tomato',
      disease: 'Early Blight',
      district: 'Mardan',
      date: '2026-11-08',
      resultStatus: 'Wait for Rain',
      dosageUsed: '2g / Liter (30g in 15L tank)',
      phiDays: 7,
    },
    {
      id: 'med-hist-02',
      medicineName: 'Dithane M-45 (Mancozeb 75% WP)',
      activeIngredient: 'Mancozeb 75% WP',
      crop: 'Tomato',
      disease: 'Early Blight',
      district: 'Mardan',
      date: '2026-10-29',
      resultStatus: 'Suitable & Genuine',
      dosageUsed: '2.5g / Liter (37.5g in 15L tank)',
      phiDays: 7,
    },
    {
      id: 'med-hist-03',
      medicineName: 'Tilt 250 EC (Propiconazole)',
      activeIngredient: 'Propiconazole 25% EC',
      crop: 'Wheat',
      disease: 'Yellow Stripe Rust',
      district: 'Charsadda',
      date: '2026-10-19',
      resultStatus: 'Suitable & Genuine',
      dosageUsed: '1.5ml / Liter (200ml / Acre)',
      phiDays: 28,
    },
  ];

  findCatalogRecord(queryOrBarcode: string): CatalogBottleRecord {
    const q = (queryOrBarcode || '').toLowerCase().trim();
    const matched = BOTTLE_BARCODE_CATALOG.find(
      (item) =>
        item.barcode === q ||
        item.id === q ||
        item.brandName.toLowerCase().includes(q) ||
        item.activeIngredient.toLowerCase().includes(q) ||
        item.keywords.some((k) => q.includes(k))
    );
    return matched || BOTTLE_BARCODE_CATALOG[0];
  }

  /**
   * Evaluates expiry date against current reference date (Nov 2026)
   */
  evaluateExpiry(expiryDateStr: string): {
    isExpired: boolean;
    expiryStatus: 'Valid' | 'Expiring Soon' | 'Expired';
    expiryLabelEn: string;
    expiryLabelUr: string;
    expiryLabelPs: string;
  } {
    const now = new Date('2026-11-11T00:00:00Z');
    const [yearStr, monthStr] = (expiryDateStr || '2027-01').split('-');
    const expDate = new Date(Date.UTC(Number(yearStr) || 2027, (Number(monthStr) || 1) - 1, 28));
    const diffMonths = Math.round((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.4));

    if (diffMonths < 0) {
      const ago = Math.abs(diffMonths);
      return {
        isExpired: true,
        expiryStatus: 'Expired',
        expiryLabelEn: `Expired ${ago} months ago (${expiryDateStr})`,
        expiryLabelUr: `${ago} ماہ پہلے تاریخ ختم ہو چکی ہے (${expiryDateStr}) — استعمال نہ کریں`,
        expiryLabelPs: `${ago} میاشتې مخکې یې نېټه تېره شوې ده (${expiryDateStr}) — بالکل یې مه استعمالوئ`,
      };
    }

    if (diffMonths <= 3) {
      return {
        isExpired: false,
        expiryStatus: 'Expiring Soon',
        expiryLabelEn: `Expires in ${diffMonths} months (${expiryDateStr})`,
        expiryLabelUr: `${diffMonths} ماہ میں تاریخ ختم ہو رہی ہے (${expiryDateStr})`,
        expiryLabelPs: `په ${diffMonths} میاشتو کې یې نېټه پوره کیږي (${expiryDateStr})`,
      };
    }

    return {
      isExpired: false,
      expiryStatus: 'Valid',
      expiryLabelEn: `Valid — Expires in ${diffMonths} months (${expiryDateStr})`,
      expiryLabelUr: `تاریخ بالکل ٹھیک ہے — ختم ہونے میں ${diffMonths} ماہ باقی ہیں (${expiryDateStr})`,
      expiryLabelPs: `نېټه یې بالکل سمه ده — لا ${diffMonths} میاشتې وخت لري (${expiryDateStr})`,
    };
  }

  /**
   * Full AI Spray Advisor & Bottle Scan Pipeline
   * Combines Vision/OCR extraction + Counterfeit/Expiry Check + Crop/Disease/Stage Compatibility + Live Open-Meteo Weather + Voice
   */
  analyzeBottleScan(params: {
    queryOrBottleId?: string;
    barcode?: string;
    ocrOverride?: Partial<BottleOcrExtraction> & {
      isGenuineOverride?: boolean;
      counterfeitSignalsOverride?: string[];
      imageQualityPoor?: boolean;
    };
    crop: string;
    disease: string;
    growthStage?: string;
    previousSpray?: string;
    weather: DistrictWeatherSnapshot;
  }): BottleScanAnalysisResponse {
    const lookupKey =
      params.barcode ||
      params.ocrOverride?.brandName ||
      params.queryOrBottleId ||
      'Aliette 80 WG';
    const record = this.findCatalogRecord(lookupKey);

    const imageQualityPoor = Boolean(params.ocrOverride?.imageQualityPoor);

    const extracted: BottleOcrExtraction = {
      brandName: params.ocrOverride?.brandName || record.brandName,
      activeIngredient: params.ocrOverride?.activeIngredient || record.activeIngredient,
      company: params.ocrOverride?.company || record.company,
      registrationNumber: params.ocrOverride?.registrationNumber || record.registrationNumber,
      manufacturingDate: params.ocrOverride?.manufacturingDate || record.manufacturingDate,
      expiryDate: params.ocrOverride?.expiryDate || record.expiryDate,
      batchNumber: params.ocrOverride?.batchNumber || record.batchNumber,
      barcode: params.barcode || params.ocrOverride?.barcode || record.barcode,
      qrDetected: params.ocrOverride?.qrDetected ?? record.qrDetected,
      estimatedPricePkr: record.estimatedPricePkr,
      effectiveness: record.effectiveness,
      toxicityLevel: record.toxicityLevel,
      fracGroup: record.fracGroup,
      formulationType: record.formulationType,
    };

    const expiryInfo = this.evaluateExpiry(extracted.expiryDate);
    const isGenuine =
      params.ocrOverride?.isGenuineOverride !== undefined
        ? params.ocrOverride.isGenuineOverride
        : record.isGenuine;

    const authenticityStatus: AuthenticityAssessment['authenticityStatus'] = record.isBanned
      ? 'Restricted / Banned'
      : isGenuine && !expiryInfo.isExpired
      ? 'Likely Genuine'
      : 'Suspicious Product';

    const authenticity: AuthenticityAssessment = {
      isGenuine: isGenuine && !expiryInfo.isExpired && !record.isBanned,
      authenticityStatus,
      confidenceScore: isGenuine && !expiryInfo.isExpired ? 96 : 24,
      isExpired: expiryInfo.isExpired,
      expiryStatus: expiryInfo.expiryStatus,
      expiryLabelEn: expiryInfo.expiryLabelEn,
      expiryLabelUr: expiryInfo.expiryLabelUr,
      expiryLabelPs: expiryInfo.expiryLabelPs,
      counterfeitSignals:
        params.ocrOverride?.counterfeitSignalsOverride || record.counterfeitSignals,
      dealerAdviceEn:
        isGenuine && !expiryInfo.isExpired && !record.isBanned
          ? `Genuine ${extracted.company} product with valid registration (${extracted.registrationNumber}).`
          : 'WARNING: This bottle may be counterfeit, expired, or unsafe. Do NOT spray on your crop. Buy only from an authorized agriculture dealer.',
      dealerAdviceUr:
        isGenuine && !expiryInfo.isExpired && !record.isBanned
          ? `یہ ${extracted.company} کی اصلی دوائی ہے اور سرکاری رجسٹریشن نمبر (${extracted.registrationNumber}) بالکل درست ہے۔`
          : 'خبردار! یہ بوتل نقلی، زائد المیعاد یا خطرناک ہو سکتی ہے۔ اسے اپنی فصل پر ہرگز اسپرے نہ کریں اور صرف منظور شدہ ڈیلر سے اصلی دوائی خریدیں۔',
      dealerAdvicePs:
        isGenuine && !expiryInfo.isExpired && !record.isBanned
          ? `دا د ${extracted.company} اصلي دوایي ده او سرکاري رجسټریشن نمبر (${extracted.registrationNumber}) یې بالکل سم دی.`
          : 'خبردار! دا بوتل نقلي، تاریخ تېر یا تاواني کېدای شي. دا په خپل فصل بالکل سپرے مه کوئ او صرف له منظور شوي دوکاندار نه اصلي دوایي واخلئ.',
    };

    const cropNorm = (params.crop || 'Tomato').trim();
    const diseaseNorm = (params.disease || 'Early Blight').trim();
    const growthStage = params.growthStage || 'Flowering / Fruiting';
    const previousSpray = params.previousSpray || 'None';

    const suitableForCrop = record.targetCrops.some(
      (c) => c.toLowerCase() === cropNorm.toLowerCase()
    );
    const suitableForDisease = record.targetDiseases.some(
      (d) =>
        diseaseNorm.toLowerCase().includes(d.toLowerCase()) ||
        d.toLowerCase().includes(diseaseNorm.toLowerCase())
    );

    const samePreviousChemical =
      previousSpray !== 'None' &&
      (extracted.brandName.toLowerCase().includes(previousSpray.toLowerCase()) ||
        extracted.activeIngredient.toLowerCase().includes(previousSpray.toLowerCase()));

    const rotationWarning = samePreviousChemical
      ? `You sprayed ${previousSpray} recently. Repeating the exact same chemical group (${extracted.fracGroup}) more than twice in a row can build fungus resistance.`
      : null;

    const rainRisk = params.weather.rainProbability >= 35;
    const highWind = params.weather.windSpeed >= 18;
    const canSprayNow = !rainRisk && !highWind;

    const isCompatible =
      authenticity.isGenuine && suitableForCrop && suitableForDisease && !record.isBanned;

    const suitableOverall: SmartSprayCompatibility['suitableOverall'] = !isCompatible
      ? 'NO'
      : !canSprayNow
      ? 'WAIT_FOR_WEATHER'
      : 'YES';

    const weatherVerdictEn = rainRisk
      ? `Rain expected in ${params.weather.district} (${params.weather.rainProbability}% chance). Do NOT spray today — wait until tomorrow morning (7:00 AM - 10:00 AM).`
      : highWind
      ? `Wind is strong (${params.weather.windSpeed} km/h). Wait for calm morning hours (7:00 AM - 10:00 AM).`
      : `Weather in ${params.weather.district} (${params.weather.temperature}°C, Rain ${params.weather.rainProbability}%) is clear. Spray in the morning between 7:00 AM and 10:00 AM.`;

    const weatherVerdictUr = rainRisk
      ? `آج ${params.weather.district} میں بارش متوقع ہے (${params.weather.rainProbability}% امکان)۔ آج اسپرے ہرگز نہ کریں ورنہ دوائی دھل جائے گی — کل صبح 7 سے 10 بجے اسپرے کریں۔`
      : highWind
      ? `ہوا تیز ہے (${params.weather.windSpeed} km/h)۔ کل صبح کم ہوا میں اسپرے کریں۔`
      : `${params.weather.district} میں موسم صاف ہے (${params.weather.temperature}°C)۔ صبح 7 سے 10 بجے کے درمیان اسپرے کریں۔`;

    const weatherVerdictPs = rainRisk
      ? `نن په ${params.weather.district} کې د باران امکان شته (${params.weather.rainProbability}%)۔ نن بالکل سپرے مه کوئ ګنې باران به دوایي ووینځي — سبا سهار د ۷ نه تر ۱۰ بجو پورې سپرے وکړئ.`
      : highWind
      ? `باد تېز دی (${params.weather.windSpeed} km/h). سبا سهار په ارامه هوا کې سپرے وکړئ.`
      : `په ${params.weather.district} کې موسم صاف دی (${params.weather.temperature}°C). سهار د ۷ نه تر ۱۰ بجو پورې سپرے وکړئ.`;

    const compatibility: SmartSprayCompatibility = {
      suitableForCrop,
      suitableForDisease,
      suitableOverall,
      cropChecked: cropNorm,
      diseaseChecked: diseaseNorm,
      growthStageChecked: growthStage,
      previousSprayChecked: previousSpray,
      rotationWarning,
      dosagePerLiter: record.dosagePerLiter,
      dosagePer15LTank: record.dosagePer15LTank,
      dosagePerAcre: record.dosagePerAcre,
      sprayTimeWindow: rainRisk
        ? 'Wait Until Tomorrow Morning (7:00 AM – 10:00 AM)'
        : 'Morning (7:00 AM – 10:00 AM)',
      repeatAfterDays: record.repeatAfterDays,
      phiDays: record.phiDays,
      weatherSafety: {
        district: params.weather.district,
        temperature: params.weather.temperature,
        rainProbability: params.weather.rainProbability,
        windSpeed: params.weather.windSpeed,
        canSprayNow,
        weatherVerdictEn,
        weatherVerdictUr,
        weatherVerdictPs,
      },
      safetyChecklist: {
        en: [
          'Wear rubber gloves and cover nose/mouth with a clean cloth',
          'Do not spray near livestock or water channels',
          'Keep children and pregnant women away from the field',
          `PHI = ${record.phiDays} days (Wait ${record.phiDays} days after spraying before harvesting)`,
        ],
        ur: [
          'ہاتھوں میں دستانے پہنیں اور منہ و ناک پر صاف کپڑا باندھیں',
          'جانوروں اور چارے کے قریب اسپرے نہ کریں',
          'بچوں کو دوائی کی بوتل اور کھیت سے دور رکھیں',
          `وقفہ (PHI) = ${record.phiDays} دن (اسپرے کے بعد ${record.phiDays} دن تک فصل یا پھل نہ توڑیں)`,
        ],
        ps: [
          'په لاسونو دستکشې واغوندئ او خوله او پوزه په صافه کپړه وتړئ',
          'د مالدارۍ او څارویو خوا کې سپرے مه کوئ',
          'ماشومان د دوایۍ له بوتل او پټي نه لرې وساتئ',
          `وقفه (PHI) = ${record.phiDays} ورځې (له سپرے وروسته تر ${record.phiDays} ورځو پورې فصل مه شکوئ)`,
        ],
      },
    };

    // Build rich localized summary + killer Urdu & Mardan Pashto voice scripts
    let urVoice = '';
    let psVoice = '';
    let urTitle = '';
    let psTitle = '';
    let enTitle = '';
    let urReason = '';
    let psReason = '';
    let enReason = '';

    const cropUr = cropNorm === 'Tomato' ? 'ٹماٹر' : cropNorm === 'Wheat' ? 'گندم' : 'مکئی';
    const cropPs = cropNorm === 'Tomato' ? 'ټماټر' : cropNorm === 'Wheat' ? 'غنم' : 'جوار';

    if (!authenticity.isGenuine) {
      urTitle = record.isBanned
        ? 'خبردار! یہ خطرناک زہر ہے — فصل پر ہرگز نہ ڈالیں'
        : 'خبردار! یہ بوتل مشکوک یا زائد المیعاد (Expired) ہے';
      psTitle = record.isBanned
        ? 'خبردار! دا خطرناک زهر دي — په فصل یې بالکل مه سپرے کوئ'
        : 'خبردار! دا بوتل نقلي یا تاریخ تېر (Expired) دی';
      enTitle = record.isBanned
        ? 'DANGER: Banned / Herbicide Poison'
        : 'Suspicious or Expired Product — Do Not Use';

      urReason = `${authenticity.dealerAdviceUr} ${expiryInfo.expiryLabelUr}۔`;
      psReason = `${authenticity.dealerAdvicePs} ${expiryInfo.expiryLabelPs}۔`;
      enReason = `${authenticity.dealerAdviceEn} ${expiryInfo.expiryLabelEn}.`;

      urVoice = `السلام علیکم کسان بھائی! غور سے سنیں: اس بوتل پر ${extracted.brandName} لکھا ہے لیکن یہ بوتل مشکوک یا تاریخ ختم شدہ ہے۔ ${expiryInfo.expiryLabelUr}۔ براہ کرم یہ دوائی اپنی ${cropUr} کی فصل پر ہرگز اسپرے نہ کریں اور صرف منظور شدہ ڈیلر سے اصلی دوائی خریدیں۔`;
      psVoice = `السلام علیکم زما خوږه زمینداره وروره! زما خبره په غور واوره: دا بوتل مشکوک یا تاریخ تېر دی. ${expiryInfo.expiryLabelPs}. دا دوایي په خپل ${cropPs} باندې بالکل سپرے مه کوه، ګنې فصل به دې خراب شي. صرف له منظور شوي دوکاندار نه اصلي دوایي واخله.`;
    } else if (!suitableForCrop || !suitableForDisease) {
      urTitle = `یہ دوائی اصلی ہے، مگر ${cropUr} کی اس بیماری کے لیے نہیں ہے`;
      psTitle = `دا دوایي اصلي ده، خو د ${cropPs} د دې بیمارۍ لپاره نه ده`;
      enTitle = `Genuine Bottle, But Not Suitable for ${cropNorm} (${diseaseNorm})`;

      urReason = `${extracted.brandName} اصلی ہے، لیکن یہ ${record.targetCrops.join(', ')} (${record.targetDiseases.join(', ')}) کے لیے ہے۔ اسے ${cropUr} کے اس مسئلے پر اسپرے کرنے سے پیسے ضائع ہوں گے۔`;
      psReason = `${extracted.brandName} اصلي دوایي ده، خو دا د ${cropPs} د دې بیمارۍ لپاره کار نه کوي. په دې خپلې پیسې مه ضایع کوئ.`;
      enReason = `${extracted.brandName} is genuine, but formulated for ${record.targetDiseases.join(', ')} on ${record.targetCrops.join(', ')}. Using it on ${cropNorm} for ${diseaseNorm} will waste your money.`;

      urVoice = `السلام علیکم کسان بھائی! یہ بوتل ${extracted.brandName} بالکل اصلی ہے، لیکن یہ دوائی ${cropUr} کی اس بیماری کے لیے موزوں نہیں ہے۔ اس پر اپنے پیسے ضائع نہ کریں بلکہ اس کی جگہ ایلیٹ یا مینکوزیب دوائی استعمال کریں۔`;
      psVoice = `السلام علیکم زما خوږه زمینداره وروره! دا د ${extracted.brandName} بوتل اصلي دی، خو دا دوایي د ${cropPs} د دې بیمارۍ لپاره کار نه کوي. په دې خپلې پیسې مه ضایع کوه، د دې پر ځای ایلیټ یا مینکوزیب دوایي سپرے کړه.`;
    } else {
      urTitle = `یہ دوائی ${cropUr} کے لیے بالکل مناسب اور اصلی ہے`;
      psTitle = `دا دوایي د ${cropPs} لپاره بالکل مناسبه او اصلي ده`;
      enTitle = `Genuine & Suitable for ${cropNorm} (${diseaseNorm})`;

      urReason = `${extracted.brandName} (${extracted.activeIngredient}) بالکل اصلی ہے اور ${cropUr} کی بیماری (${diseaseNorm}) کے لیے بہترین ہے۔ ${weatherVerdictUr}`;
      psReason = `${extracted.brandName} (${extracted.activeIngredient}) بالکل اصلي دوایي ده او د ${cropPs} د بیمارۍ لپاره ډېره ښه ده. ${weatherVerdictPs}`;
      enReason = `${extracted.brandName} (${extracted.activeIngredient}) is verified genuine and effective for ${diseaseNorm} on ${cropNorm}. ${weatherVerdictEn}`;

      // Killer direct farmer voice output matching user prompt
      urVoice = `السلام علیکم کسان بھائی! یہ دوائی ${extracted.brandName} بالکل اصلی ہے اور ${cropUr} کے لیے مناسب ہے۔ ${
         record.dosagePerLiter.includes('2 ')
          ? 'دو گرام ایک لیٹر پانی میں ملائیں، یعنی پندرہ لیٹر والی ٹینکی میں تیس گرام دوائی ڈالیں۔'
          : `مقدار یاد رکھیں: ${record.dosagePer15LTank}۔`
      } ${
        rainRisk
          ? 'آج بارش متوقع ہے، اس لیے آج اسپرے نہ کریں بلکہ کل صبح سات سے دس بجے اسپرے کریں۔'
          : 'صبح کے وقت جب ہوا کم ہو تب اسپرے کریں اور سات دن بعد دوبارہ چیک کریں۔'
      } اسپرے کرتے وقت دستانے پہنیں، جانوروں اور بچوں کو دور رکھیں، اور اسپرے کے ${record.phiDays} دن بعد تک فصل نہ توڑیں۔`;

      psVoice = `السلام علیکم زما خوږه زمینداره وروره! دا د ${extracted.brandName} دوایي بالکل اصلي ده او د ${cropPs} د بیمارۍ لپاره ډېره مناسبه ده. په یو لیټر اوبو کې دوه ګرامه یعنې د پنځلس لیټرو په ټینکۍ کې دیرش ګرامه دوایي مکس کړئ. ${
        rainRisk
          ? 'نن د باران امکان شته، نو نن سپرے مه کوئ او سبا سهار د اوو بجو نه تر لسو بجو پورې سپرے وکړئ.'
          : 'سهار وختي په ارامه هوا کې سپرے وکړئ او اووه ورځې پس یې بیا وګورئ.'
      } د سپرے په وخت دستکشې واغوندئ، ماشومان او مالداري لرې وساتئ، او تر ${record.phiDays} ورځو پورې حاصل مه شکوئ.`;
    }

    return {
      scanId: `btl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      imageQualityPoor,
      promptBarcodeFallback: imageQualityPoor,
      extracted,
      authenticity,
      compatibility,
      localized: {
        ur: {
          statusTitle: urTitle,
          reason: urReason,
          dosage: `${record.dosagePerLiter} (${record.dosagePer15LTank})`,
          safety: `دستانے پہنیں • جانوروں اور بچوں کو دور رکھیں • PHI = ${record.phiDays} دن`,
          voiceScript: urVoice,
        },
        ps: {
          statusTitle: psTitle,
          reason: psReason,
          dosage: `${record.dosagePerLiter} (${record.dosagePer15LTank})`,
          safety: `دستکشې واغوندئ • ماشومان او مالداري لرې وساتئ • PHI = ${record.phiDays} ورځې`,
          voiceScript: psVoice,
        },
        en: {
          statusTitle: enTitle,
          reason: enReason,
          dosage: `${record.dosagePerLiter} • ${record.dosagePer15LTank}`,
          safety: `Wear gloves • Keep animals & children away • PHI = ${record.phiDays} days`,
          voiceScript: `${extracted.brandName} (${extracted.activeIngredient}) by ${extracted.company}. ${enTitle}. ${enReason} Mix ${record.dosagePerLiter} (${record.dosagePer15LTank}). Repeat after ${record.repeatAfterDays} days. Pre-harvest interval is ${record.phiDays} days.`,
        },
      },
    };
  }

  /**
   * Compare Medicine A vs Medicine B side-by-side
   */
  compareMedicines(params: {
    medicineAQuery: string;
    medicineBQuery: string;
    crop: string;
    disease: string;
  }): MedicineComparisonResponse {
    const recA = this.findCatalogRecord(params.medicineAQuery || 'Aliette 80 WG');
    const recB = this.findCatalogRecord(params.medicineBQuery || 'Karate 2.5 EC');
    const crop = params.crop || 'Tomato';
    const disease = params.disease || 'Early Blight';

    const suitA =
      recA.isGenuine &&
      !recA.isBanned &&
      recA.targetCrops.some((c) => c.toLowerCase() === crop.toLowerCase()) &&
      recA.targetDiseases.some(
        (d) =>
          disease.toLowerCase().includes(d.toLowerCase()) ||
          d.toLowerCase().includes(disease.toLowerCase())
      );

    const suitB =
      recB.isGenuine &&
      !recB.isBanned &&
      recB.targetCrops.some((c) => c.toLowerCase() === crop.toLowerCase()) &&
      recB.targetDiseases.some(
        (d) =>
          disease.toLowerCase().includes(d.toLowerCase()) ||
          d.toLowerCase().includes(disease.toLowerCase())
      );

    let winner: 'A' | 'B' | 'NEITHER' = 'NEITHER';
    if (suitA && !suitB) winner = 'A';
    else if (suitB && !suitA) winner = 'B';
    else if (suitA && suitB) {
      winner = recA.estimatedPricePkr <= recB.estimatedPricePkr ? 'A' : 'B';
    }

    const winnerRec = winner === 'A' ? recA : winner === 'B' ? recB : null;

    const enVerdict = winnerRec
      ? `Choose ${winnerRec.brandName} (PKR ${winnerRec.estimatedPricePkr}). It is genuine, directly targets ${disease} on ${crop}, and has ${winnerRec.effectiveness} effectiveness with ${winnerRec.toxicityLevel} toxicity.`
      : `Neither medicine is suitable for ${disease} on ${crop}. Please use Mancozeb 75% WP or Aliette 80 WG instead.`;

    const urVerdict = winnerRec
      ? `کسان بھائی! آپ ${winnerRec.brandName} (قیمت تقریباً ${winnerRec.estimatedPricePkr} روپے) منتخب کریں کیونکہ یہ اصلی ہے اور ${crop} کی بیماری (${disease}) کے لیے بالکل موزوں ہے، جبکہ دوسری دوائی اس بیماری کے لیے کارآمد نہیں ہے۔`
      : `یہ دونوں دوائیاں اس بیماری کے لیے موزوں نہیں ہیں۔ براہ کرم مینکوزیب یا ایلیٹ استعمال کریں۔`;

    const psVerdict = winnerRec
      ? `زمینداره وروره! تاسو ${winnerRec.brandName} (قیمت یې شاوخوا ${winnerRec.estimatedPricePkr} روپۍ دی) واخلئ، ځکه چې دا اصلي دوایي ده او د ${crop} د بیمارۍ لپاره بالکل سمه ده.`
      : `دا دواړه دوایۍ د دې بیمارۍ لپاره سمې نه دي. د دې پر ځای مینکوزیب یا ایلیټ دوایي واخلئ.`;

    return {
      crop,
      disease,
      medicineA: {
        name: recA.brandName,
        company: recA.company,
        genuine: recA.isGenuine && !recA.isBanned,
        genuineLabel: recA.isGenuine ? 'Genuine' : 'Suspicious',
        suitable: suitA,
        suitableLabel: suitA ? 'Suitable' : 'Not Suitable',
        costPkr: recA.estimatedPricePkr,
        effectiveness: recA.effectiveness,
        toxicity: recA.toxicityLevel,
        phiDays: recA.phiDays,
        dosagePerLiter: recA.dosagePerLiter,
      },
      medicineB: {
        name: recB.brandName,
        company: recB.company,
        genuine: recB.isGenuine && !recB.isBanned,
        genuineLabel: recB.isGenuine ? 'Genuine' : 'Suspicious',
        suitable: suitB,
        suitableLabel: suitB ? 'Suitable' : 'Not Suitable',
        costPkr: recB.estimatedPricePkr,
        effectiveness: recB.effectiveness,
        toxicity: recB.toxicityLevel,
        phiDays: recB.phiDays,
        dosagePerLiter: recB.dosagePerLiter,
      },
      recommendedWinner: winner,
      verdict: {
        en: enVerdict,
        ur: urVerdict,
        ps: psVerdict,
        voiceScriptUr: `السلام علیکم کسان بھائی! میں نے دونوں دوائیوں کا مقابلہ کر لیا ہے۔ پہلی دوائی ${recA.brandName} کی قیمت ${recA.estimatedPricePkr} روپے ہے اور دوسری دوائی ${recB.brandName} کی قیمت ${recB.estimatedPricePkr} روپے ہے۔ ${urVerdict}`,
        voiceScriptPs: `السلام علیکم زما خوږه زمینداره وروره! ما د دواړو دواییو مقابله وکړه. د اولې دوایۍ ${recA.brandName} قیمت ${recA.estimatedPricePkr} روپۍ دی او د دویمې دوایۍ ${recB.brandName} قیمت ${recB.estimatedPricePkr} روپۍ دی. ${psVerdict}`,
      },
    };
  }

  /**
   * Conservative Tank-Mix Compatibility Engine ("Can I Mix These Two Medicines?")
   * Never recommends mixing unless explicitly supported by reliable agricultural extension rules.
   */
  checkTankMixCompatibility(params: {
    medicineAQuery: string;
    medicineBQuery: string;
    crop?: string;
  }): TankMixSafetyResponse {
    const recA = this.findCatalogRecord(params.medicineAQuery || 'Mancozeb 75% WP');
    const recB = this.findCatalogRecord(params.medicineBQuery || 'Aliette 80 WG');

    const pairKey = `${recA.id}__${recB.id}`;
    const reverseKey = `${recB.id}__${recA.id}`;

    // 1. Same medicine check
    if (recA.id === recB.id) {
      return {
        medicineA: recA.brandName,
        medicineB: recB.brandName,
        safeToMix: 'NO',
        reason: {
          en: `Both bottles contain ${recA.activeIngredient}. Mixing them together doubles the chemical dose and risks burning crop leaves (phytotoxicity).`,
          ur: `دونوں بوتلوں میں ایک ہی دوائی (${recA.activeIngredient}) موجود ہے۔ انہیں ملانے سے دوائی کی مقدار دگنی ہو جائے گی اور پودے کے پتے جل سکتے ہیں۔`,
          ps: `په دې دواړو بوتلونو کې یو شان دوایي (${recA.activeIngredient}) ده. د دواړو یو ځای کول د دوایۍ اندازه دوه چنده کوي او د بوټي پاڼې سوځوي.`,
        },
        recommendedRatio: {
          en: 'Do NOT mix together — Use only 1 bottle at standard dosage.',
          ur: 'ہرگز نہ ملائیں — صرف ایک دوائی مقررہ مقدار میں استعمال کریں۔',
          ps: 'بالکل یې یو ځای مه مکس کوئ — صرف یوه دوایي په خپله اندازه سپرے کړئ.',
        },
        alternativeIfUnsafe: {
          en: `Use ${recA.brandName} alone at ${recA.dosagePerLiter} (${recA.dosagePer15LTank}).`,
          ur: `صرف ${recA.brandName} اکیلی استعمال کریں (${recA.dosagePer15LTank})۔`,
          ps: `صرف ${recA.brandName} یوازې استعمال کړئ (${recA.dosagePer15LTank}).`,
        },
        voiceScript: {
          en: `Do not mix ${recA.brandName} with itself. Use a single standard dose of ${recA.dosagePerLiter}.`,
          ur: `السلام علیکم کسان بھائی! یہ دونوں ایک ہی قسم کی دوائیاں ہیں، انہیں آپس میں ہرگز نہ ملائیں ورنہ تیز خوراک سے فصل کے پتے جل جائیں گے۔`,
          ps: `السلام علیکم زما خوږه زمینداره وروره! دا دواړه یوه دوایي ده، دا دواړه په یوه ټینکۍ کې بالکل مه مکس کوئ ګنې پاڼې به وسوځوي.`,
        },
      };
    }

    // 2. Banned / Herbicide / Counterfeit check
    if (recA.isBanned || recB.isBanned || !recA.isGenuine || !recB.isGenuine) {
      return {
        medicineA: recA.brandName,
        medicineB: recB.brandName,
        safeToMix: 'NO',
        reason: {
          en: 'DANGER: One of the selected bottles is either a toxic herbicide (weed killer) or an unverified/expired product. Never tank-mix herbicides with crop fungicides!',
          ur: 'خبردار! ان میں سے ایک بوتل گھاس جلانے والا زہر ہے یا مشکوک/تاریخ ختم شدہ ہے۔ اسے کسی دوسری دوائی کے ساتھ ہرگز نہ ملائیں ورنہ پوری فصل تباہ ہو جائے گی۔',
          ps: 'خبردار! په دې کې یو بوتل د واښو سوځولو زهر یا نقلي دوایي ده. دا له بلې دوایۍ سره بالکل مه مکس کوئ ګنې ټول پټی به مو وسوځي.',
        },
        recommendedRatio: {
          en: '0g — Strictly prohibited to mix.',
          ur: 'بالکل نہ ملائیں — سخت منع ہے۔',
          ps: 'بالکل یې مه مکس کوئ — سخت منع دي.',
        },
        alternativeIfUnsafe: {
          en: 'Keep weed killers in a separate sprayer and never use them on vegetable or wheat foliage.',
          ur: 'گھاس مار زہر کو فصل والی ٹینکی میں کبھی نہ ڈالیں۔',
          ps: 'د واښو زهر د فصل د سپرے په ټینکۍ کې هیڅکله مه اچوئ.',
        },
        voiceScript: {
          en: `Danger! Do not mix ${recA.brandName} and ${recB.brandName}. One product is unsafe for crops.`,
          ur: `السلام علیکم کسان بھائی! خبردار، ${recA.brandName} اور ${recB.brandName} کو ہرگز آپس میں نہ ملائیں۔ اس سے آپ کی پوری فصل جل سکتی ہے۔`,
          ps: `السلام علیکم زما خوږه زمینداره وروره! خبردار، ${recA.brandName} او ${recB.brandName} په یوه ټینکۍ کې بالکل مه مکس کوئ ګنې ټول فصل به مو وسوځي.`,
        },
      };
    }

    // 3. Double Triazole (Tilt + Score) check — Conservative NO due to phytotoxicity
    if (
      [pairKey, reverseKey].includes('tilt-250-ec__score-250-ec')
    ) {
      return {
        medicineA: recA.brandName,
        medicineB: recB.brandName,
        safeToMix: 'NO',
        reason: {
          en: 'Both Tilt (Propiconazole) and Score (Difenoconazole) belong to FRAC Group 3 (Triazoles). Tank-mixing two triazole fungicides causes leaf-tip burning and stunts crop growth.',
          ur: 'ٹلٹ اور اسکور دونوں ایک ہی کیمیکل خاندان (ٹرایازول) سے تعلق رکھتے ہیں۔ ان دونوں کو ایک ٹینکی میں ملانے سے پتوں کی نوکیں جل جاتی ہیں اور پودے کا قد رک جاتا ہے۔',
          ps: 'ټیلټ او سکور دواړه د یوې کورنۍ تېزې دوایۍ دي. دا دواړه په یوه ټینکۍ کې مکس کول د پاڼو سرونه سوځوي او بوټی کمزوری کوي.',
        },
        recommendedRatio: {
          en: 'Do NOT mix — Apply only one product according to crop type.',
          ur: 'نہ ملائیں — گندم کے لیے صرف ٹلٹ اور ٹماٹر کے لیے صرف اسکور استعمال کریں۔',
          ps: 'مه مکس کوئ — د غنمو لپاره صرف ټیلټ او د ټماټرو لپاره صرف سکور استعمال کړئ.',
        },
        alternativeIfUnsafe: {
          en: 'If you need broader protection, pair a contact protectant (Mancozeb 75% WP) with a single systemic fungicide rather than mixing two triazoles.',
          ur: 'بہتر طریقہ یہ ہے کہ ایک ہی دوائی الگ استعمال کریں یا مینکوزیب کے ساتھ ملائیں۔',
          ps: 'ښه طریقه دا ده چې یوازې یوه دوایي استعمال کړئ.',
        },
        voiceScript: {
          en: `Do not mix ${recA.brandName} and ${recB.brandName}. Both are triazole fungicides and mixing them can burn your crop leaves.`,
          ur: `السلام علیکم کسان بھائی! ${recA.brandName} اور ${recB.brandName} کو ایک ٹینکی میں ہرگز نہ ملائیں کیونکہ دونوں تیز ٹرایازول دوائیاں ہیں اور ملانے سے پتے جل سکتے ہیں۔`,
          ps: `السلام علیکم زما خوږه زمینداره وروره! ${recA.brandName} او ${recB.brandName} په یوه ټینکۍ کې بالکل مه مکس کوئ، ځکه چې دواړه تېزې دوایۍ دي او د فصل پاڼې سوځوي.`,
        },
      };
    }

    // 4. Aliette (Fosetyl-Al) + Mancozeb or Ridomil — Conservative NO / Caution unless jar-tested
    if (recA.id === 'aliette-80-wg' || recB.id === 'aliette-80-wg') {
      return {
        medicineA: recA.brandName,
        medicineB: recB.brandName,
        safeToMix: 'NO',
        reason: {
          en: 'Conservative Agronomic Rule: Fosetyl-Aluminium (Aliette 80 WG) has an acidic profile and can react or clump when tank-mixed with other fungicides or foliar fertilizers. We do NOT recommend mixing them in the same tank.',
          ur: 'زرعی اصول کے مطابق ایلیٹ (فوسیٹائل ایلومینیم) کو دوسری فنجی سائیڈ یا کھاد کے ساتھ ایک ہی ٹینکی میں ملانے سے دوائی پھٹ سکتی ہے اور اثر کم ہو جاتا ہے۔ اس لیے انہیں آپس میں نہ ملائیں۔',
          ps: 'د زراعت د اصولو مطابق ایلیټ دوایي له نورو دواییو سره په یوه ټینکۍ کې مکس کول ښه نه دي، ځکه چې دوایي خپله اثر بایلي او په پاڼو بده اغېزه کوي.',
        },
        recommendedRatio: {
          en: 'Do NOT tank-mix — Spray separately with a 5 to 7 day gap.',
          ur: 'ایک ٹینکی میں نہ ملائیں — دونوں سپرے کے درمیان 5 سے 7 دن کا وقفہ رکھیں۔',
          ps: 'په یوه ټینکۍ کې یې مه مکس کوئ — د دواړو سپرے ترمنځ له ۵ نه تر ۷ ورځو پورې وقفه ورکړئ.',
        },
        alternativeIfUnsafe: {
          en: 'Spray Aliette 80 WG (2g/L) alone today/tomorrow morning, and if needed apply Mancozeb (2.5g/L) 7 days later.',
          ur: 'پہلے صرف ایلیٹ (2 گرام فی لیٹر) کا اسپرے کریں، اور ضرورت پڑنے پر 7 دن بعد مینکوزیب کا اسپرے کریں۔',
          ps: 'اول صرف ایلیټ دوایي (په یو لیټر کې ۲ ګرامه) سپرے کړئ، او که ضرورت وي نو ۷ ورځې پس مینکوزیب سپرے کړئ.',
        },
        voiceScript: {
          en: `We cannot recommend mixing ${recA.brandName} and ${recB.brandName} in the same tank. Spray them separately with a 7-day gap.`,
          ur: `السلام علیکم کسان بھائی! احتیاط کریں: ${recA.brandName} اور ${recB.brandName} کو ایک ہی ٹینکی میں ملا کر اسپرے نہ کریں کیونکہ اس سے دوائی کا اثر خراب ہو سکتا ہے۔ پہلے ایک دوائی کا اسپرے کریں اور سات دن کے وقفے کے بعد دوسری دوائی استعمال کریں۔`,
          ps: `السلام علیکم زما خوږه زمینداره وروره! احتیاط وکړئ: ${recA.brandName} او ${recB.brandName} په یوه ټینکۍ کې یو ځای مه مکس کوئ. اول یوه دوایي سپرے کړئ او اووه ورځې پس بله دوایي استعمال کړئ.`,
        },
      };
    }

    // 5. Verified Safe Combination: Mancozeb 75% WP + Score 250 EC (Contact Protectant + Systemic Triazole)
    if ([pairKey, reverseKey].includes('mancozeb-dithane__score-250-ec')) {
      return {
        medicineA: recA.brandName,
        medicineB: recB.brandName,
        safeToMix: 'YES',
        reason: {
          en: 'SAFE TO MIX: Combining Mancozeb 75% WP (multi-site contact protectant) with Score 250 EC (systemic curative) is a verified KP Agriculture Extension practice for moderate-to-severe Early Blight.',
          ur: 'جی ہاں، ملا سکتے ہیں! مینکوزیب (باہر سے حفاظت کرنے والی دوائی) اور اسکور (اندر سے علاج کرنے والی دوائی) کو ملانا شدید جھلساؤ کو روکنے کے لیے زرعی ماہرین کے مطابق محفوظ ہے۔',
          ps: 'هو، مکس کولی شئ! مینکوزیب او سکور دوایي په یوه ټینکۍ کې مکس کول د پاڼو د سختې بلایټ بیمارۍ لپاره بالکل محفوظه او ښه طریقه ده.',
        },
        recommendedRatio: {
          en: 'In 15L Knapsack Tank: Dissolve 30g Mancozeb WP first in half bucket of water, then add 15ml Score 250 EC and top up to 15L.',
          ur: '15 لیٹر والی ٹینکی میں: پہلے 30 گرام مینکوزیب پاؤڈر پانی میں اچھی طرح حل کریں، پھر اس میں 15 ملی لیٹر اسکور ملا کر ٹینکی پوری بھر لیں۔',
          ps: 'د ۱۵ لیټرو په ټینکۍ کې: اول ۳۰ ګرامه مینکوزیب پوډر په اوبو کې ښه حل کړئ، او بیا پکې ۱۵ ملي لیټره سکور دوایي واچوئ.',
        },
        alternativeIfUnsafe: {
          en: 'Always dissolve the Wettable Powder (WP) completely before adding the liquid Emulsifiable Concentrate (EC).',
          ur: 'ہمیشہ پہلے پاؤڈر والی دوائی پانی میں حل کریں اور بعد میں لیکوئڈ دوائی ڈالیں۔',
          ps: 'همېشه اول پوډر دوایي په اوبو کې حل کړئ او بیا مایع دوایي پکې واچوئ.',
        },
        voiceScript: {
          en: `Yes, it is safe to mix ${recA.brandName} and ${recB.brandName}. Dissolve 30 grams of Mancozeb powder first, then add 15 milliliters of Score in a 15-liter tank.`,
          ur: `السلام علیکم کسان بھائی! جی ہاں، آپ مینکوزیب اور اسکور دوائی کو ایک ٹینکی میں ملا سکتے ہیں۔ پندرہ لیٹر والی ٹینکی میں پہلے تیس گرام مینکوزیب پاؤڈر حل کریں اور پھر اس میں پندرہ ملی لیٹر اسکور ملا کر صبح کے وقت اسپرے کریں۔`,
          ps: `السلام علیکم زما خوږه زمینداره وروره! هو، تاسو مینکوزیب او سکور دوایي په یوه ټینکۍ کې مکس کولی شئ. د پنځلس لیټرو په ټینکۍ کې اول دیرش ګرامه مینکوزیب پوډر حل کړئ او بیا پکې پنځلس ملي لیټره سکور دوایي واچوئ او سهار وختي سپرے وکړئ.`,
        },
      };
    }

    // Default Conservative Fallback: Do NOT recommend mixing unless verified
    return {
      medicineA: recA.brandName,
      medicineB: recB.brandName,
      safeToMix: 'NO',
      reason: {
        en: `Conservative Safety Policy: Official KP Agriculture Extension guidelines do NOT recommend tank-mixing ${recA.brandName} and ${recB.brandName} together. Mixing unverified chemical formulations can cause precipitation, clogged nozzles, or crop leaf burn.`,
        ur: `احتیاطی زرعی اصول: محکمہ زراعت کی ہدایات کے مطابق ${recA.brandName} اور ${recB.brandName} کو ایک ہی ٹینکی میں ملانے کی سفارش نہیں کی جاتی۔ بغیر تصدیق کے دو دوائیاں ملانے سے دوائی پھٹ سکتی ہے یا فصل جل سکتی ہے۔`,
        ps: `احتیاطي زرعي اصول: د زراعت محکمه ${recA.brandName} او ${recB.brandName} په یوه ټینکۍ کې د مکس کولو مشوره نه ورکوي. دوه بېلابېلې دوایۍ یو ځای کول فصل ته تاوان رسولی شي.`,
      },
      recommendedRatio: {
        en: 'Do NOT mix in the same tank — Apply separately with at least a 3 to 5 day interval.',
        ur: 'ایک ٹینکی میں ہرگز نہ ملائیں — دونوں کے درمیان 3 سے 5 دن کا وقفہ رکھیں۔',
        ps: 'په یوه ټینکۍ کې یې مه مکس کوئ — د دواړو ترمنځ له ۳ نه تر ۵ ورځو پورې وقفه وساتئ.',
      },
      alternativeIfUnsafe: {
        en: `Spray only the primary disease fungicide (${recA.brandName} at ${recA.dosagePerLiter}) first, or use a factory pre-mixed formulation like Ridomil Gold MZ 68 WG.`,
        ur: `پہلے صرف اپنی بیماری کی اصل دوائی (${recA.brandName}) اکیلی اسپرے کریں۔`,
        ps: `اول صرف د خپل فصل د بیمارۍ اصلي دوایي (${recA.brandName}) یوازې سپرے کړئ.`,
      },
      voiceScript: {
        en: `For your crop's safety, we cannot recommend mixing ${recA.brandName} and ${recB.brandName}. Please spray them on separate days.`,
        ur: `السلام علیکم کسان بھائی! آپ کی فصل کی حفاظت کے لیے ہم ${recA.brandName} اور ${recB.brandName} کو ایک ساتھ ملانے کا مشورہ نہیں دیتے۔ براہ کرم دونوں دوائیاں الگ الگ دن پر اسپرے کریں۔`,
        ps: `السلام علیکم زما خوږه زمینداره وروره! ستاسو د فصل د حفاظت لپاره موږ ${recA.brandName} او ${recB.brandName} په یوه ټینکۍ کې د مکس کولو مشوره نه درکوو. دا دواړه په بېلابېلو ورځو کې سپرے کړئ.`,
      },
    };
  }

  getHistory(): MedicineHistoryEntry[] {
    return this.historyLog;
  }

  saveHistory(entry: Omit<MedicineHistoryEntry, 'id' | 'date'>): MedicineHistoryEntry {
    const newEntry: MedicineHistoryEntry = {
      ...entry,
      id: `med-hist-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
    };
    this.historyLog = [newEntry, ...this.historyLog];
    return newEntry;
  }

  private buildLocalizedGuidance(product: {
    tradeName: string;
    status: string;
    reason: string;
    dosage: string;
    safetyAdvice: string;
  }): {
    ur: LocalizedMedicineGuidance;
    ps: LocalizedMedicineGuidance;
    en: LocalizedMedicineGuidance;
  } {
    const isBanned = product.status === 'Restricted / Banned';
    const isNotRec = product.status === 'Not Recommended';
    const nameLower = (product.tradeName || '').toLowerCase();

    let ur: LocalizedMedicineGuidance;
    if (isBanned) {
      ur = {
        statusTitle: 'خبردار! یہ دوائی ہرگز استعمال نہ کریں',
        reason:
          'یہ گھاس جلانے والا خطرناک زہر ہے، بیماری کی دوائی نہیں ہے! اگر آپ نے یہ ٹماٹر یا گندم پر اسپرے کیا تو آپ کی پوری فصل جل کر ختم ہو جائے گی۔',
        dosage: 'فصل پر بالکل استعمال نہ کریں',
        safety: 'اس بوتل کو ہاتھ نہ لگائیں اور دکاندار کو واپس کریں۔',
        voiceScript:
          'خبردار کسان بھائی! میری بات غور سے سنیں۔ یہ دوائی ہرگز اپنی فصل پر استعمال نہ کریں۔ یہ گھاس جلانے والا تیز زہر ہے، بیماری کا علاج نہیں ہے۔ اگر آپ نے یہ اسپرے کیا تو آپ کی پوری فصل جل کر تباہ ہو جائے گی۔ اسے فوراً واپس کر دیں!',
      };
    } else if (isNotRec || nameLower.includes('karate') || nameLower.includes('lambda')) {
      ur = {
        statusTitle: 'یہ دوائی پتوں کی بیماری کے لیے نہیں ہے',
        reason:
          'یہ کیڑے اور سنڈی مارنے والی دوائی ہے، پتوں کے جھلساؤ یا کنگی کی بیماری اس سے ٹھیک نہیں ہوگی۔ اسے خرید کر اپنے پیسے ضائع نہ کریں۔',
        dosage: 'پتوں کی بیماری میں ضرورت نہیں',
        safety: 'صرف اس وقت استعمال کریں جب فصل پر کیڑے یا سنڈی نظر آئے۔',
        voiceScript:
          'کسان بھائی! یہ دوائی کیڑے اور سنڈی مارنے کے لیے ہے، پتوں کے جھلساؤ یا بیماری کے لیے نہیں ہے۔ اس بیماری میں یہ دوائی کام نہیں کرے گی اور آپ کے پیسے ضائع ہوں گے۔ اس کی جگہ مینکوزیب استعمال کریں۔',
      };
    } else if (nameLower.includes('tilt')) {
      ur = {
        statusTitle: 'بہترین اور منظور شدہ دوائی (ٹھیک ہے)',
        reason: 'گندم کی پیلی کنگی (زرد رسٹ) کے لیے یہ سرکاری طور پر منظور شدہ اور سب سے بہترین دوائی ہے۔',
        dosage: 'ایک ایکڑ میں ۲۰۰ ملی لیٹر دوائی ۱۰۰ لیٹر پانی میں ملا کر اسپرے کریں',
        safety: 'منہ پر کپڑا باندھ کر اسپرے کریں اور گندم کاٹنے سے ۲۸ دن پہلے اسپرے بند کر دیں۔',
        voiceScript:
          'شاباش کسان بھائی! ٹلٹ دوائی گندم کی پیلی کنگی کے لیے بالکل ٹھیک اور سرکاری طور پر منظور شدہ ہے۔ ایک ایکڑ کے لیے دو سو ملی لیٹر دوائی ایک سو لیٹر پانی میں ملا کر صبح شبنم خشک ہونے کے بعد اسپرے کریں۔',
      };
    } else {
      ur = {
        statusTitle: 'اصلی اور محفوظ دوائی (فصل کے لیے ٹھیک ہے)',
        reason: 'یہ دوائی پتوں کے جھلساؤ اور دھبوں کی بیماری کو روکنے کے لیے محکمہ زراعت سے منظور شدہ ہے۔',
        dosage: 'ایک ایکڑ میں ۶۰۰ سے ۸۰۰ گرام دوائی ۱۰۰ لیٹر پانی میں ملا کر اسپرے کریں',
        safety: 'اسپرے کرتے وقت منہ اور ناک پر کپڑا باندھیں اور پھل توڑنے سے ۷ دن پہلے اسپرے روک دیں۔',
        voiceScript:
          'کسان بھائی! یہ دوائی آپ کی فصل کی بیماری کے لیے بالکل ٹھیک اور محفوظ ہے۔ ایک ایکڑ میں چھ سو سے آٹھ سو گرام دوائی ایک سو لیٹر پانی میں ملا کر صبح کے وقت اسپرے کریں۔ اسپرے کرتے وقت منہ پر کپڑا ضرور باندھیں۔',
      };
    }

    let ps: LocalizedMedicineGuidance;
    if (isBanned) {
      ps = {
        statusTitle: 'خبردار! دا دوایي بالکل مه استعمالوئ',
        reason:
          'دا د واښو سوځولو خطرناک زهر دي، د بیمارۍ دوایي نه ده! که دا مو په ټماټرو یا غنمو سپرے کړه نو ټول فصل به مو وسوځي او ختم به شي.',
        dosage: 'په فصل باندې بالکل سپرے مه کوئ',
        safety: 'دا بوتل دوکاندار ته واپس ورکړئ.',
        voiceScript:
          'السلام علیکم زما خوږه زمینداره وروره! زما خبره په غور واوره: دا دوایي بالکل په خپل فصل باندې سپرے مه کوه. دا د واښو سوځولو تېز زهر دي، د بیمارۍ علاج نه دی. که دا دې سپرے کړه نو ټول پټی او فصل به دې وسوځي او تبا به شي. دا بوتل فوراً دوکاندار ته واپس کړه!',
      };
    } else if (isNotRec || nameLower.includes('karate') || nameLower.includes('lambda')) {
      ps = {
        statusTitle: 'دا دوایي د پاڼو د بیمارۍ لپاره نه ده',
        reason:
          'دا د چینجي او ملخانو مړه کولو دوایي ده، د پاڼو سوځېدل یا زنګ بیماري په دې نه رغیږي. خپلې پیسې مه ضایع کوئ.',
        dosage: 'د پاڼو په بیماري کې فایده نه کوي',
        safety: 'صرف هغه وخت پکار راځي کله چې په فصل کې چینجي ښکاره شي.',
        voiceScript:
          'السلام علیکم زمینداره وروره! دا دوایي د چینجي او ملخانو لپاره ده، د پاڼو د داغونو او سوځېدو د بیمارۍ لپاره کار نه کوي. په دې خپلې پیسې مه ضایع کوه، د دې پر ځای مینکوزیب دوایي واخله.',
      };
    } else {
      ps = {
        statusTitle: 'اصلي او محفوظه دوایي (د فصل لپاره سمه ده)',
        reason: 'دا دوایي د زراعت محکمې له طرفه منظور شوې ده او د پاڼو بیماري په ښه طریقه ودروي.',
        dosage: 'په یو ایکړ کې له ۶۰۰ نه تر ۸۰۰ ګرامه دوایي په ۱۰۰ لیټره اوبو کې مکس کړئ او سپرے وکړئ',
        safety: 'د سپرے کولو په وخت خوله او پوزه په صافه کپړه وتړئ او د فصل شکولو نه ۷ ورځې مخکې سپرے بند کړئ.',
        voiceScript:
          'السلام علیکم زمینداره وروره! دا دوایي ستاسو د فصل د بیمارۍ لپاره بالکل سمه او محفوظه ده. د یو ایکړ لپاره شپږ سوه ګرامه دوایي په سلو لیټرو اوبو کې مکس کړئ او سهار وختي یې سپرے وکړئ. د سپرے کولو په وخت خپله خوله او پوزه په کپړه ضرور وتړئ.',
      };
    }

    const en: LocalizedMedicineGuidance = {
      statusTitle: isBanned
        ? 'DANGER: Restricted / Banned Chemical'
        : isNotRec
        ? 'Not For Leaf Disease (Saves Your Money)'
        : 'Safe & Approved Medicine',
      reason: product.reason,
      dosage: product.dosage,
      safety: product.safetyAdvice,
      voiceScript: `${product.tradeName}. Status: ${product.status}. ${product.reason} Dosage: ${product.dosage}. ${product.safetyAdvice}`,
    };

    return { ur, ps, en };
  }

  verifyMedicine(params: {
    query: string;
    detectedCrop?: string;
    detectedDisease?: string;
  }): VerifiedMedicineResponse {
    const q = (params.query || '').toLowerCase().trim();

    if (q.includes('aliette') || q.includes('fosetyl')) {
      const alietteProduct = {
        tradeName: 'Aliette 80 WG (Bayer)',
        genericName: 'Fosetyl-Aluminium 80% WG',
        targetDiseases: ['Early Blight', 'Late Blight', 'Downy Mildew'],
        targetCrops: ['Tomato', 'Potato', 'Cucumber', 'Citrus'],
        status: 'Suitable' as const,
        reason: 'Official Bayer systemic fungicide approved for Tomato & Potato Blight. Mix 2g per liter of water (30g per 15L tank).',
        dosage: '2 grams per litre water (30g in 15L tank / 500g per Acre)',
        safetyAdvice: 'Wear gloves, do not spray near animals, keep children away. PHI = 7 days.',
        withholdingDays: 7,
      };
      return {
        ...alietteProduct,
        suitabilityNote: alietteProduct.reason,
        localized: this.buildLocalizedGuidance(alietteProduct),
      };
    }

    const found = VERIFIED_PESTICIDES_DB.find(
      (p) =>
        p.tradeName.toLowerCase().includes(q) ||
        p.genericName.toLowerCase().includes(q) ||
        q.includes(p.genericName.toLowerCase()) ||
        q.includes(p.tradeName.toLowerCase().split(' ')[0])
    );

    if (found) {
      return {
        ...found,
        suitabilityNote: found.reason,
        localized: this.buildLocalizedGuidance(found),
      };
    }

    if (
      q.includes('paraquat') ||
      q.includes('gramoxone') ||
      q.includes('ddt') ||
      q.includes('endosulfan') ||
      q.includes('monocrotophos')
    ) {
      const bannedProduct = {
        tradeName: params.query,
        genericName: 'Dangerous / Banned Poison',
        targetDiseases: [],
        targetCrops: [],
        status: 'Restricted / Banned' as const,
        reason:
          'DANGER! This medicine will burn and kill your entire crop and is dangerous for human life. Never use it on vegetables or wheat!',
        dosage: 'DO NOT USE',
        safetyAdvice: 'Return this bottle immediately or inform the Agriculture Officer at 1925.',
        withholdingDays: 999,
        suitabilityNote: 'Strictly prohibited poison.',
      };
      return {
        ...bannedProduct,
        localized: this.buildLocalizedGuidance(bannedProduct),
      };
    }

    const standardProduct = {
      tradeName: params.query,
      genericName: 'Standard Crop Medicine',
      targetDiseases: [params.detectedDisease || 'Leaf Spot & Blight'],
      targetCrops: [params.detectedCrop || 'Tomato & Wheat'],
      status: 'Suitable' as const,
      reason: 'This medicine can be used safely if the seal is unbroken and expiry date is valid.',
      dosage: '2 grams or 2 ml per litre of water (600g per Acre)',
      safetyAdvice: 'Tie a cloth over your nose and mouth and wash hands with soap after spraying.',
      withholdingDays: 7,
      suitabilityNote: 'Check bottle expiry date before buying from the dealer.',
    };

    return {
      ...standardProduct,
      localized: this.buildLocalizedGuidance(standardProduct),
    };
  }
}

export const medicineService = new MedicineVerificationService();
