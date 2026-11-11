import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Search,
  Barcode,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Loader2,
  CloudRain,
  Sun,
  Scale,
  FlaskConical,
  History,
  BookmarkCheck,
  Upload,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { VoiceAssistant } from '../utils/audioSpeech';

interface PesticideVerifierProps {
  language: Language;
  presetCrop?: string;
  presetDisease?: string;
}

type AdvisorMode = 'scan' | 'search' | 'barcode' | 'compare' | 'mix' | 'history';

// Generate realistic SVG bottle label specimens for instant 1-tap camera/OCR testing
function createBottleSpecimenSvg(
  brand: string,
  ingredient: string,
  company: string,
  regNo: string,
  expDate: string,
  barcode: string,
  accentColor: string,
  isFake = false
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" viewBox="0 0 520 520">
    <rect width="520" height="520" rx="28" fill="#17231F" />
    <!-- Bottle Silhouette -->
    <rect x="195" y="28" width="130" height="44" rx="10" fill="${accentColor}" />
    <rect x="210" y="72" width="100" height="26" fill="#cbd5e1" />
    <rect x="115" y="96" width="290" height="390" rx="34" fill="#f8fafc" />
    <!-- Label Header -->
    <rect x="130" y="120" width="260" height="72" rx="14" fill="${accentColor}" />
    <text x="150" y="152" fill="#ffffff" font-family="system-ui, sans-serif" font-size="22" font-weight="bold">${brand}</text>
    <text x="150" y="177" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="13">${company}</text>
    <!-- Active Ingredient & Details -->
    <text x="145" y="224" fill="#0f172a" font-family="system-ui, sans-serif" font-size="15" font-weight="bold">Active: ${ingredient}</text>
    <text x="145" y="254" fill="#334155" font-family="monospace" font-size="13">Reg No: ${regNo}</text>
    <text x="145" y="280" fill="${isFake ? '#dc2626' : '#0f6b4b'}" font-family="monospace" font-size="14" font-weight="bold">EXP: ${expDate}</text>
    <text x="145" y="306" fill="#475569" font-family="monospace" font-size="13">Barcode: ${barcode}</text>
    <!-- Barcode / QR visual -->
    <rect x="145" y="330" width="170" height="54" rx="8" fill="#e2e8f0" />
    <text x="158" y="362" fill="#0f172a" font-family="monospace" font-size="15" font-weight="bold">||| || |||| | |||</text>
    <rect x="330" y="330" width="54" height="54" rx="8" fill="${isFake ? '#fee2e2' : '#dcfce7'}" />
    <text x="342" y="362" fill="#0f172a" font-family="monospace" font-size="13" font-weight="bold">${isFake ? 'NO QR' : 'QR OK'}</text>
    <rect x="130" y="405" width="260" height="52" rx="10" fill="${isFake ? '#fef2f2' : '#ebf5f0'}" />
    <text x="145" y="436" fill="${isFake ? '#dc2626' : '#0f6b4b'}" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">${
      isFake ? 'WARNING: Blurry Print / Missing Seal' : 'Original Security Hologram Verified'
    }</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const SAMPLE_BOTTLES = [
  {
    id: 'aliette-80-wg',
    labelUr: 'ایلیٹ 80 WG (بائر - اصلی بوتل)',
    labelPs: 'ایلیټ 80 WG (د بایر اصلي بوتل)',
    labelEn: 'Aliette 80 WG (Bayer — Genuine)',
    hint: 'Aliette 80 WG',
    barcode: '8964001254890',
    imageUrl: createBottleSpecimenSvg(
      'Aliette 80 WG',
      'Fosetyl-Aluminium 80%',
      'Bayer CropScience',
      'PAK-DPP-10482-F',
      '2027-01',
      '8964001254890',
      '#0F6B4B',
      false
    ),
  },
  {
    id: 'mancozeb-dithane',
    labelUr: 'ڈائیتھین M-45 (مینکوزیب - اصلی)',
    labelPs: 'ډایتین M-45 (مینکوزیب - اصلي)',
    labelEn: 'Dithane M-45 (Mancozeb — Genuine)',
    hint: 'Dithane M-45',
    barcode: '8964001122334',
    imageUrl: createBottleSpecimenSvg(
      'Dithane M-45',
      'Mancozeb 75% WP',
      'Corteva Agriscience',
      'PAK-DPP-08914-F',
      '2028-02',
      '8964001122334',
      '#0A4D36',
      false
    ),
  },
  {
    id: 'tilt-250-ec',
    labelUr: 'ٹلٹ 250 EC (گندم کی کنگی)',
    labelPs: 'ټیلټ 250 EC (د غنمو زنګ)',
    labelEn: 'Tilt 250 EC (Wheat Rust)',
    hint: 'Tilt 250 EC',
    barcode: '8964009988776',
    imageUrl: createBottleSpecimenSvg(
      'Tilt 250 EC',
      'Propiconazole 25% EC',
      'Syngenta Pakistan',
      'PAK-DPP-07431-F',
      '2028-01',
      '8964009988776',
      '#0F6B4B',
      false
    ),
  },
  {
    id: 'counterfeit-expired-bottle',
    labelUr: 'مشکوک / تاریخ ختم شدہ نقلی بوتل',
    labelPs: 'مشکوک / تاریخ تېر نقلي بوتل',
    labelEn: 'Suspicious / Expired Fake Bottle',
    hint: 'Super Blight Cure 80 WP',
    barcode: '8964000099999',
    imageUrl: createBottleSpecimenSvg(
      'Super Blight 80',
      'Unverified Chemical',
      'Unknown Repacker',
      'MISSING',
      '2025-12 (EXPIRED)',
      '8964000099999',
      '#E53935',
      true
    ),
  },
];

const MEDICINE_OPTIONS = [
  { value: 'Aliette 80 WG', label: 'Aliette 80 WG (Fosetyl-Aluminium - Bayer)' },
  { value: 'Dithane M-45', label: 'Dithane M-45 (Mancozeb 75% WP)' },
  { value: 'Ridomil Gold MZ 68 WG', label: 'Ridomil Gold MZ 68 WG (Syngenta)' },
  { value: 'Score 250 EC', label: 'Score 250 EC (Difenoconazole)' },
  { value: 'Tilt 250 EC', label: 'Tilt 250 EC (Propiconazole)' },
  { value: 'Karate 2.5 EC', label: 'Karate 2.5 EC (Insecticide)' },
  { value: 'Paraquat 20% SL', label: 'Paraquat 20% SL (Weed Herbicide Poison)' },
  { value: 'Super Blight Cure 80 WP', label: 'Super Blight 80 (Suspicious / Expired)' },
];

export const PesticideVerifier: React.FC<PesticideVerifierProps> = ({
  language,
  presetCrop = 'Tomato',
  presetDisease = 'Early Blight',
}) => {
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<AdvisorMode>('scan');
  const [selectedCrop, setSelectedCrop] = useState<string>(presetCrop || 'Tomato');
  const [selectedDisease, setSelectedDisease] = useState<string>(presetDisease || 'Early Blight');
  const [growthStage, setGrowthStage] = useState<string>('Flowering / Fruiting');
  const [district, setDistrict] = useState<string>('Mardan');
  const [previousSpray, setPreviousSpray] = useState<string>('None');

  // Bottle Scan / Search / Barcode state
  const [previewImage, setPreviewImage] = useState<string>(SAMPLE_BOTTLES[0].imageUrl);
  const [searchQuery, setSearchQuery] = useState<string>('Aliette 80 WG');
  const [barcodeInput, setBarcodeInput] = useState<string>('8964001254890');
  const [poorImageQualityPrompt, setPoorImageQualityPrompt] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSavedToHistory, setIsSavedToHistory] = useState<boolean>(false);

  // Compare A vs B state
  const [compareMedA, setCompareMedA] = useState<string>('Aliette 80 WG');
  const [compareMedB, setCompareMedB] = useState<string>('Karate 2.5 EC');
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);

  // Tank-Mix ("Can I Mix These Two Medicines?") state
  const [mixMedA, setMixMedA] = useState<string>('Aliette 80 WG');
  const [mixMedB, setMixMedB] = useState<string>('Dithane M-45');
  const [mixResult, setMixResult] = useState<any | null>(null);

  // Spray History state
  const [historyList, setHistoryList] = useState<any[]>([]);

  // Voice playback state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState<boolean>(false);

  // Run initial bottle scan on mount so the farmer immediately sees a complete Aliette 80 WG analysis
  useEffect(() => {
    runBottleScan({ bottleHint: 'Aliette 80 WG', barcode: '8964001254890' });
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const r = await fetch('/api/v1/medicine/history');
      const data = await r.json();
      if (data.success && Array.isArray(data.history)) {
        setHistoryList(data.history);
      }
    } catch (e) {
      console.warn('Could not load medicine history:', e);
    }
  };

  const runBottleScan = async (opts: {
    imageBase64?: string;
    bottleHint?: string;
    barcode?: string;
  }) => {
    VoiceAssistant.stop();
    setIsSpeaking(false);
    setIsLoading(true);
    setIsSavedToHistory(false);
    setPoorImageQualityPrompt(false);

    try {
      const resp = await fetch('/api/v1/medicine/scan-bottle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: opts.imageBase64 || '',
          bottleHint: opts.bottleHint || searchQuery,
          barcode: opts.barcode || '',
          crop: selectedCrop,
          disease: selectedDisease,
          growthStage,
          district,
          previousSpray,
        }),
      });
      const data = await resp.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
        if (data.analysis.promptBarcodeFallback) {
          setPoorImageQualityPrompt(true);
        }
      }
    } catch (err) {
      console.error('Bottle scan error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runBarcodeLookup = async (codeToLookup?: string) => {
    const code = (codeToLookup || barcodeInput).trim();
    if (!code) return;

    VoiceAssistant.stop();
    setIsSpeaking(false);
    setIsLoading(true);
    setIsSavedToHistory(false);
    setPoorImageQualityPrompt(false);

    try {
      const resp = await fetch('/api/v1/medicine/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: code,
          crop: selectedCrop,
          disease: selectedDisease,
          growthStage,
          district,
          previousSpray,
        }),
      });
      const data = await resp.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error('Barcode lookup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runComparison = async (medA = compareMedA, medB = compareMedB) => {
    VoiceAssistant.stop();
    setIsSpeaking(false);
    setIsLoading(true);
    try {
      const resp = await fetch('/api/v1/medicine/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineA: medA,
          medicineB: medB,
          crop: selectedCrop,
          disease: selectedDisease,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setComparisonResult(data.comparison);
      }
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runMixCheck = async (medA = mixMedA, medB = mixMedB) => {
    VoiceAssistant.stop();
    setIsSpeaking(false);
    setIsLoading(true);
    try {
      const resp = await fetch('/api/v1/medicine/mix-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineA: medA,
          medicineB: medB,
          crop: selectedCrop,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setMixResult(data.mixResult);
      }
    } catch (err) {
      console.error('Tank-mix check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setPreviewImage(dataUrl);
      runBottleScan({ imageBase64: dataUrl, bottleHint: searchQuery });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveReport = async () => {
    if (!analysisResult) return;
    try {
      const ext = analysisResult.extracted;
      const comp = analysisResult.compatibility;
      const auth = analysisResult.authenticity;
      const resultStatus = !auth.isGenuine
        ? 'Suspicious / Expired'
        : comp.suitableOverall === 'WAIT_FOR_WEATHER'
        ? 'Wait for Rain'
        : comp.suitableOverall === 'YES'
        ? 'Suitable & Genuine'
        : 'Not Suitable';

      const resp = await fetch('/api/v1/medicine/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName: ext.brandName,
          activeIngredient: ext.activeIngredient,
          crop: comp.cropChecked,
          disease: comp.diseaseChecked,
          district: comp.weatherSafety.district,
          resultStatus,
          dosageUsed: `${comp.dosagePerLiter} (${comp.dosagePer15LTank})`,
          phiDays: comp.phiDays,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setIsSavedToHistory(true);
        setHistoryList(data.history || []);
      }
    } catch (e) {
      setIsSavedToHistory(true);
    }
  };

  const playVoiceScript = (scriptText: string, targetLang: Language = language) => {
    if (isSpeaking || isLoadingVoice) {
      VoiceAssistant.stop();
      setIsSpeaking(false);
      setIsLoadingVoice(false);
      return;
    }

    VoiceAssistant.speak(
      scriptText,
      targetLang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false),
      'elder',
      (loading) => setIsLoadingVoice(loading)
    );
  };

  const loc = analysisResult?.localized?.[language] || analysisResult?.localized?.ur;

  return (
    <div className="space-y-8 animate-card-fade">
      {/* 1. HEADER & MODE SWITCHER: [📷 Scan Bottle] [🔍 Search by Name] [📦 Scan Barcode] [⚖️ Compare A vs B] [🧪 Can I Mix?] [📋 History] */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center shrink-0">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[24px] sm:text-[28px] font-bold text-[#17231F] leading-tight">
                {language === 'ur'
                  ? 'اے آئی اسپرے ایڈوائزر اور دوائی اسسٹنٹ'
                  : language === 'ps'
                  ? 'د سپرے مشیر او د دوایۍ اسسټنټ'
                  : 'AI Spray Advisor & Medicine Assistant'}
              </h2>
              <p className="text-[15px] font-normal text-[#6B7280] mt-1">
                {language === 'ur'
                  ? 'بوتل کی تصویر کھینچیں، بارکوڈ اسکین کریں، اصلی/نقلی چیک کریں، یا دو دوائیاں ملانے کے بارے میں پوچھیں'
                  : language === 'ps'
                  ? 'د بوتل تصویر واخلئ، بارکوډ سکین کړئ، اصلي او نقلي وګورئ، یا د دوه دواییو مکس کولو پوښتنه وکړئ'
                  : 'Scan bottle photo (OCR + Vision), check barcode, compare prices, or check if two medicines are safe to tank-mix'}
              </p>
            </div>
          </div>
        </div>

        {/* 6 Interactive Tool Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              id: 'scan' as AdvisorMode,
              icon: Camera,
              ur: 'بوتل اسکین کریں',
              ps: 'بوتل سکین کړئ',
              en: 'Scan Bottle',
            },
            {
              id: 'search' as AdvisorMode,
              icon: Search,
              ur: 'نام سے تلاش',
              ps: 'په نوم لټون',
              en: 'Search Name',
            },
            {
              id: 'barcode' as AdvisorMode,
              icon: Barcode,
              ur: 'بارکوڈ اسکین',
              ps: 'بارکوډ سکین',
              en: 'Scan Barcode',
            },
            {
              id: 'mix' as AdvisorMode,
              icon: Sparkles,
              ur: 'دو دوائیاں ملائیں؟',
              ps: 'دوه دوایۍ مکس کړو؟',
              en: 'Can I Mix 2?',
            },
            {
              id: 'compare' as AdvisorMode,
              icon: Scale,
              ur: 'دوائی A بمقابلہ B',
              ps: 'دوایي A او B مقابله',
              en: 'Compare A vs B',
            },
            {
              id: 'history' as AdvisorMode,
              icon: History,
              ur: 'اسپرے ریکارڈ',
              ps: 'د سپرے ریکارډ',
              en: 'Spray History',
            },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  VoiceAssistant.stop();
                  setIsSpeaking(false);
                  setMode(tab.id);
                  if (tab.id === 'compare' && !comparisonResult) {
                    runComparison();
                  }
                  if (tab.id === 'mix' && !mixResult) {
                    runMixCheck();
                  }
                }}
                className={`min-h-[56px] px-3 py-2.5 rounded-[16px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0F6B4B] text-white shadow-[0_6px_16px_rgba(15,107,75,0.22)]'
                    : 'bg-[#F7F8F6] hover:bg-[#EBF5F0] text-[#17231F] font-normal'
                }`}
              >
                <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F6B81A]' : 'text-[#0F6B4B]'}`} />
                <span className="truncate">
                  {language === 'ur' ? tab.ur : language === 'ps' ? tab.ps : tab.en}
                </span>
              </button>
            );
          })}
        </div>

        {/* Smart Compatibility Context Bar (Crop, Disease, Stage, District, Previous Spray) */}
        <div className="p-4 rounded-[16px] bg-[#F7F8F6] grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">
              {language === 'ur' ? 'فصل:' : language === 'ps' ? 'فصل:' : 'Crop:'}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[12px] bg-white text-[14px] font-semibold text-[#17231F]"
            >
              <option value="Tomato">Tomato (ٹماٹر / ټماټر)</option>
              <option value="Wheat">Wheat (گندم / غنم)</option>
              <option value="Maize">Maize (مکئی / جوار)</option>
              <option value="Potato">Potato (آلو)</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">
              {language === 'ur' ? 'بیماری:' : language === 'ps' ? 'بیماري:' : 'Disease:'}
            </label>
            <select
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[12px] bg-white text-[14px] font-semibold text-[#17231F]"
            >
              <option value="Early Blight">Early Blight (جھلساؤ)</option>
              <option value="Late Blight">Late Blight (پچھیتا جھلساؤ)</option>
              <option value="Yellow Stripe Rust">Yellow Rust (پیلی کنگی)</option>
              <option value="Maize Leaf Blight">Maize Blight (مکئی کا جھلساؤ)</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">
              {language === 'ur' ? 'فصل کا مرحلہ:' : language === 'ps' ? 'د فصل حالت:' : 'Growth Stage:'}
            </label>
            <select
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[12px] bg-white text-[14px] font-semibold text-[#17231F]"
            >
              <option value="Vegetative">Vegetative (ابتدائی بڑھوتری)</option>
              <option value="Flowering / Fruiting">Flowering / Fruiting (پھول اور پھل)</option>
              <option value="Pre-Harvest">Near Harvest (کٹائی کے قریب)</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">
              {language === 'ur' ? 'ضلع (موسم):' : language === 'ps' ? 'ضلع (موسم):' : 'District:'}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[12px] bg-white text-[14px] font-semibold text-[#17231F]"
            >
              <option value="Mardan">Mardan (مردان)</option>
              <option value="Swabi">Swabi (صوابی)</option>
              <option value="Charsadda">Charsadda (چارسدہ)</option>
              <option value="Peshawar">Peshawar (پشاور)</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">
              {language === 'ur' ? 'پچھلا اسپرے:' : language === 'ps' ? 'پخوانۍ سپرے:' : 'Previous Spray:'}
            </label>
            <select
              value={previousSpray}
              onChange={(e) => setPreviousSpray(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[12px] bg-white text-[14px] font-semibold text-[#17231F]"
            >
              <option value="None">None (کوئی نہیں)</option>
              <option value="Aliette 80 WG">Aliette 80 WG</option>
              <option value="Mancozeb">Mancozeb 75% WP</option>
              <option value="Tilt 250 EC">Tilt 250 EC</option>
            </select>
          </div>
        </div>

        {/* MODE 1: [📷 SCAN BOTTLE] */}
        {mode === 'scan' && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left: Bottle Preview */}
              <div className="md:col-span-4 flex flex-col items-center">
                <img
                  src={previewImage}
                  alt="Scanned Medicine Bottle"
                  referrerPolicy="no-referrer"
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-[20px] object-cover shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                />
              </div>

              {/* Right: Camera Trigger + Sample Bottle Presets */}
              <div className="md:col-span-8 space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-h-[56px] px-6 py-3.5 rounded-[16px] bg-[#F6B81A] hover:bg-[#F6B81A]/90 text-[#17231F] font-bold text-[16px] flex items-center justify-center gap-3 shadow-xs cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>
                      {language === 'ur'
                        ? 'کیمرے سے بوتل کی تصویر لیں'
                        : language === 'ps'
                        ? 'په کیمره د بوتل تصویر واخلئ'
                        : 'Take Photo of Medicine Bottle'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPoorImageQualityPrompt(true)}
                    className="min-h-[56px] px-4 py-3 rounded-[16px] bg-[#F7F8F6] hover:bg-[#EBF5F0] text-[#6B7280] hover:text-[#17231F] text-[13px] font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Barcode className="w-4 h-4 text-[#0F6B4B]" />
                    <span>
                      {language === 'ur'
                        ? 'تصویر دھندلی ہے؟ بارکوڈ اسکین کریں'
                        : language === 'ps'
                        ? 'تصویر خړ دی؟ بارکوډ سکین کړئ'
                        : 'Blurry Photo? Scan Barcode'}
                    </span>
                  </button>
                </div>

                {/* 4 Instant Sample Bottle Specimen Buttons */}
                <div className="space-y-2">
                  <span className="text-[13px] font-semibold text-[#6B7280] block">
                    {language === 'ur'
                      ? 'یا چیک کرنے کے لیے نیچے دی گئی کسی بوتل پر ہاتھ لگائیں (OCR + AI ٹیسٹ):'
                      : language === 'ps'
                      ? 'یا د چیک کولو لپاره لاندې پر یوه بوتل ګوته کېږدئ (OCR + AI ټیسټ):'
                      : 'Or tap a sample bottle below to test OCR + Counterfeit + Weather AI:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SAMPLE_BOTTLES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setPreviewImage(b.imageUrl);
                          setSearchQuery(b.hint);
                          setBarcodeInput(b.barcode);
                          runBottleScan({ bottleHint: b.hint, barcode: b.barcode });
                        }}
                        className="min-h-[52px] px-4 py-2.5 rounded-[14px] bg-[#F7F8F6] hover:bg-[#EBF5F0] text-start text-[14px] font-semibold text-[#17231F] flex items-center justify-between gap-2 transition-colors cursor-pointer"
                      >
                        <span className="truncate">
                          {language === 'ur' ? b.labelUr : language === 'ps' ? b.labelPs : b.labelEn}
                        </span>
                        <Upload className="w-4 h-4 text-[#0F6B4B] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Poor Image Quality Fallback Prompt */}
            {poorImageQualityPrompt && (
              <div className="p-5 rounded-[16px] bg-[#FFFBEB] text-[#17231F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-[16px] flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#F6B81A]" />
                    <span>
                      {language === 'ur'
                        ? 'تصویر صاف نہیں ہے — کیا آپ بارکوڈ اسکین کر سکتے ہیں؟'
                        : language === 'ps'
                        ? 'تصویر صاف نه دی — ایا تاسو بارکوډ سکین کولی شئ؟'
                        : 'Image quality is blurry — Can you scan the barcode instead?'}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#6B7280]">
                    {language === 'ur'
                      ? 'بارکوڈ سے بغیر کسی انتظار کے فوراً اصلی دوائی کی پہچان ہو جاتی ہے۔'
                      : language === 'ps'
                      ? 'د بارکوډ له لارې سمدستي د اصلي دوایۍ پېژندنه کیږي.'
                      : 'Barcode lookup matches the official registry immediately without needing clean label lighting.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPoorImageQualityPrompt(false);
                    setMode('barcode');
                  }}
                  className="min-h-[48px] px-5 py-2.5 rounded-[14px] bg-[#0F6B4B] text-white font-semibold text-[14px] shrink-0 cursor-pointer"
                >
                  {language === 'ur' ? 'بارکوڈ اسکین کھولیں' : language === 'ps' ? 'بارکوډ سکین خلاص کړئ' : 'Switch to Barcode Scan'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: [🔍 SEARCH BY NAME] */}
        {mode === 'search' && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-[#6B7280] absolute start-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runBottleScan({ bottleHint: searchQuery })}
                  placeholder={t.searchPesticidePlaceholder}
                  className="w-full min-h-[56px] ps-12 pe-4 py-3 bg-[#F7F8F6] rounded-[14px] text-[16px] text-[#17231F]"
                />
              </div>
              <button
                type="button"
                onClick={() => runBottleScan({ bottleHint: searchQuery })}
                className="min-h-[56px] px-8 py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[16px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{t.verifyBottleBtn}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MEDICINE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSearchQuery(opt.value);
                    runBottleScan({ bottleHint: opt.value });
                  }}
                  className="min-h-[52px] px-4 py-2.5 rounded-[14px] bg-[#F7F8F6] hover:bg-[#EBF5F0] text-start text-[14px] font-semibold text-[#17231F] truncate cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODE 3: [📦 SCAN BARCODE] */}
        {mode === 'barcode' && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Barcode className="w-5 h-5 text-[#0F6B4B] absolute start-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runBarcodeLookup()}
                  placeholder="Enter or scan 13-digit barcode (e.g. 8964001254890)..."
                  className="w-full min-h-[56px] ps-12 pe-4 py-3 bg-[#F7F8F6] rounded-[14px] text-[16px] font-mono text-[#17231F]"
                />
              </div>
              <button
                type="button"
                onClick={() => runBarcodeLookup()}
                className="min-h-[56px] px-8 py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[16px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-5 h-5 text-[#F6B81A]" />
                <span>
                  {language === 'ur'
                    ? 'بارکوڈ چیک کریں'
                    : language === 'ps'
                    ? 'بارکوډ چیک کړئ'
                    : 'Instant Barcode Match'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SAMPLE_BOTTLES.map((b) => (
                <button
                  key={b.barcode}
                  type="button"
                  onClick={() => {
                    setBarcodeInput(b.barcode);
                    setPreviewImage(b.imageUrl);
                    runBarcodeLookup(b.barcode);
                  }}
                  className="min-h-[52px] px-4 py-2.5 rounded-[14px] bg-[#F7F8F6] hover:bg-[#EBF5F0] text-start text-[13px] font-semibold text-[#17231F] flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="truncate">{b.hint}</span>
                  <span className="font-mono text-[12px] text-[#0F6B4B] tabular-nums">{b.barcode}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ==================== FULL BOTTLE SCAN / SEARCH / BARCODE RESULT ==================== */}
      {(mode === 'scan' || mode === 'search' || mode === 'barcode') && analysisResult && (
        <div className="space-y-6 animate-diagnosis-slide">
          {/* 1. KILLER VOICE OUTPUT BANNER (Urdu & Mardan Pashto) */}
          <div className="bg-[#0F6B4B] text-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.08)] space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[13px] text-white/80 block">
                  {language === 'ur'
                    ? 'پڑھنے کی ضرورت نہیں — بٹن دبائیں اور دوائی، مقدار اور موسم کا پورا مشورہ سنیں'
                    : language === 'ps'
                    ? 'لوستلو ته ضرورت نشته — بټن کېکاږئ او د دوایۍ، اندازې او موسم پوره مشوره واورئ'
                    : 'Voice Output — Hear product suitability, exact dosage & weather advice'}
                </span>
                <h3 className="text-[22px] sm:text-[26px] font-bold text-white leading-snug">
                  {loc?.statusTitle}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => playVoiceScript(analysisResult.localized.ur.voiceScript, 'ur')}
                  className="min-h-[56px] px-6 py-3 rounded-[16px] bg-[#F6B81A] hover:bg-[#F6B81A]/90 text-[#17231F] font-bold text-[16px] flex items-center gap-2.5 cursor-pointer"
                >
                  {isLoadingVoice && language === 'ur' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isSpeaking && language === 'ur' ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                  <span>{isSpeaking && language === 'ur' ? 'آواز روکیں' : 'اردو میں سنیں'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => playVoiceScript(analysisResult.localized.ps.voiceScript, 'ps')}
                  className="min-h-[56px] px-6 py-3 rounded-[16px] bg-white hover:bg-white/90 text-[#17231F] font-bold text-[16px] flex items-center gap-2.5 cursor-pointer"
                >
                  {isLoadingVoice && language === 'ps' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isSpeaking && language === 'ps' ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-[#0F6B4B]" />
                  )}
                  <span>{isSpeaking && language === 'ps' ? 'غږ ودرول' : 'په پښتو واورئ'}</span>
                </button>
              </div>
            </div>

            <p className="text-[16px] text-white/95 leading-relaxed bg-[#0A4D36] p-4 rounded-[14px]">
              {loc?.voiceScript}
            </p>
          </div>

          {/* 2. INFORMATION EXTRACTED FROM BOTTLE (OCR + VISION AI) + COUNTERFEIT & EXPIRY CHECK */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: 8 Extracted OCR Fields */}
            <div className="lg:col-span-7 bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#0F6B4B]">
                  {language === 'ur'
                    ? '۱. بوتل سے نکالی گئی معلومات (OCR + Vision AI)'
                    : language === 'ps'
                    ? '۱. له بوتل نه اخیستل شوي معلومات (OCR + Vision AI)'
                    : '1. Information Extracted from Bottle (OCR + Vision AI)'}
                </span>
                <span className="text-[12px] font-mono text-[#6B7280] tabular-nums">
                  {analysisResult.extracted.barcode}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-[14px] bg-[#F7F8F6]">
                  <span className="text-[12px] text-[#6B7280] block">✅ Brand Name (نام)</span>
                  <span className="text-[17px] font-bold text-[#17231F]">
                    {analysisResult.extracted.brandName}
                  </span>
                </div>

                <div className="p-4 rounded-[14px] bg-[#F7F8F6]">
                  <span className="text-[12px] text-[#6B7280] block">✅ Active Ingredient (اصل زہر/کیمیکل)</span>
                  <span className="text-[16px] font-semibold text-[#0F6B4B]">
                    {analysisResult.extracted.activeIngredient}
                  </span>
                </div>

                <div className="p-4 rounded-[14px] bg-[#F7F8F6]">
                  <span className="text-[12px] text-[#6B7280] block">✅ Company (کمپنی)</span>
                  <span className="text-[15px] font-semibold text-[#17231F]">
                    {analysisResult.extracted.company}
                  </span>
                </div>

                <div className="p-4 rounded-[14px] bg-[#F7F8F6]">
                  <span className="text-[12px] text-[#6B7280] block">✅ Registration Number (رجسٹریشن نمبر)</span>
                  <span className="text-[15px] font-mono font-semibold text-[#17231F]">
                    {analysisResult.extracted.registrationNumber}
                  </span>
                </div>

                <div className="p-4 rounded-[14px] bg-[#F7F8F6]">
                  <span className="text-[12px] text-[#6B7280] block">✅ Manufacturing Date (بننے کی تاریخ)</span>
                  <span className="text-[15px] font-mono text-[#17231F] tabular-nums">
                    {analysisResult.extracted.manufacturingDate}
                  </span>
                </div>

                <div className="p-4 rounded-[14px] bg-[#F7F8F6]">
                  <span className="text-[12px] text-[#6B7280] block">✅ Expiry Date (ختم ہونے کی تاریخ)</span>
                  <span
                    className={`text-[15px] font-bold tabular-nums ${
                      analysisResult.authenticity.isExpired ? 'text-[#E53935]' : 'text-[#0F6B4B]'
                    }`}
                  >
                    {language === 'ur'
                      ? analysisResult.authenticity.expiryLabelUr
                      : language === 'ps'
                      ? analysisResult.authenticity.expiryLabelPs
                      : analysisResult.authenticity.expiryLabelEn}
                  </span>
                </div>

                <div className="p-4 rounded-[14px] bg-[#F7F8F6]">
                  <span className="text-[12px] text-[#6B7280] block">✅ Batch Number (بیچ نمبر)</span>
                  <span className="text-[15px] font-mono text-[#17231F]">
                    {analysisResult.extracted.batchNumber}
                  </span>
                </div>

                <div className="p-4 rounded-[14px] bg-[#F7F8F6]">
                  <span className="text-[12px] text-[#6B7280] block">✅ QR Code & Barcode</span>
                  <span className="text-[15px] font-semibold text-[#17231F]">
                    {analysisResult.extracted.qrDetected ? 'Verified QR & Barcode' : 'Missing QR Code ⚠️'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Counterfeit & Authenticity Inspection */}
            <div className="lg:col-span-5 bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[13px] font-semibold text-[#0F6B4B] block">
                  {language === 'ur'
                    ? '۲. اصلی یا نقلی کی تصدیق (Counterfeit Check)'
                    : language === 'ps'
                    ? '۲. د اصلي او نقلي پېژندنه (Counterfeit Check)'
                    : '2. Counterfeit & Expiry Verification'}
                </span>

                <div
                  className={`p-5 rounded-[16px] flex items-start gap-4 ${
                    analysisResult.authenticity.isGenuine ? 'bg-[#EBF5F0]' : 'bg-[#FEF2F2]'
                  }`}
                >
                  {analysisResult.authenticity.isGenuine ? (
                    <CheckCircle2 className="w-8 h-8 text-[#0F6B4B] shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-[#E53935] shrink-0" />
                  )}
                  <div className="space-y-1">
                    <div className="text-[20px] font-bold text-[#17231F]">
                      {analysisResult.authenticity.isGenuine
                        ? language === 'ur'
                          ? 'اصلی دوائی (Likely Genuine)'
                          : language === 'ps'
                          ? 'اصلي دوایي (Likely Genuine)'
                          : 'Likely Genuine'
                        : language === 'ur'
                        ? 'مشکوک یا نقلی بوتل (Suspicious)'
                        : language === 'ps'
                        ? 'مشکوک یا نقلي بوتل (Suspicious)'
                        : 'Suspicious Product'}
                    </div>
                    <div className="text-[13px] text-[#6B7280] tabular-nums">
                      Authenticity Confidence: {analysisResult.authenticity.confidenceScore}%
                    </div>
                  </div>
                </div>

                <ul className="space-y-2.5 text-[14px] text-[#17231F]">
                  {analysisResult.authenticity.counterfeitSignals.map((sig: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-[#0F6B4B]">•</span>
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-[14px] bg-[#F7F8F6] text-[14px] text-[#17231F]">
                {language === 'ur'
                  ? analysisResult.authenticity.dealerAdviceUr
                  : language === 'ps'
                  ? analysisResult.authenticity.dealerAdvicePs
                  : analysisResult.authenticity.dealerAdviceEn}
              </div>
            </div>
          </div>

          {/* 3. SMART COMPATIBILITY + DOSAGE + WEATHER SAFETY + SAFETY CHECKLIST */}
          <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-[#0F6B4B]">
                {language === 'ur'
                  ? '۳. فصل، بیماری، مقدار اور آج کے موسم کے مطابق فیصلہ'
                  : language === 'ps'
                  ? '۳. د فصل، بیمارۍ، اندازې او د نن موسم مطابق پرېکړه'
                  : '3. Smart Compatibility, Exact Dosage & Open-Meteo Weather Safety'}
              </span>
              <span className="text-[13px] font-semibold text-[#17231F]">
                Crop: {analysisResult.compatibility.cropChecked} · Disease: {analysisResult.compatibility.diseaseChecked} · Suitable:{' '}
                <span
                  className={
                    analysisResult.compatibility.suitableForCrop &&
                    analysisResult.compatibility.suitableForDisease &&
                    analysisResult.authenticity.isGenuine
                      ? 'text-[#0F6B4B] font-bold'
                      : 'text-[#E53935] font-bold'
                  }
                >
                  {analysisResult.compatibility.suitableForCrop &&
                  analysisResult.compatibility.suitableForDisease &&
                  analysisResult.authenticity.isGenuine
                    ? 'YES ✅'
                    : 'NO ❌'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Correct Dosage */}
              <div className="p-5 rounded-[16px] bg-[#EBF5F0] space-y-2">
                <div className="text-[13px] font-semibold text-[#0F6B4B]">
                  {language === 'ur'
                    ? 'صحیح مقدار (Correct Dosage)'
                    : language === 'ps'
                    ? 'صحیح اندازه (Correct Dosage)'
                    : 'Correct Dosage'}
                </div>
                <div className="text-[20px] font-bold text-[#17231F]">
                  {analysisResult.compatibility.dosagePerLiter}
                </div>
                <p className="text-[15px] text-[#17231F]">
                  • {analysisResult.compatibility.dosagePer15LTank}
                </p>
                <p className="text-[14px] text-[#6B7280]">
                  • {analysisResult.compatibility.dosagePerAcre}
                </p>
                <p className="text-[14px] font-semibold text-[#0F6B4B] pt-1">
                  • Repeat after {analysisResult.compatibility.repeatAfterDays} days
                </p>
              </div>

              {/* Column 2: Live Open-Meteo Weather Safety */}
              <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#0F6B4B]">
                    {language === 'ur'
                      ? 'موسم کی صورتحال (Open-Meteo)'
                      : language === 'ps'
                      ? 'د موسم حال (Open-Meteo)'
                      : 'Weather Safety (Open-Meteo)'}
                  </span>
                  {analysisResult.compatibility.weatherSafety.rainProbability >= 35 ? (
                    <CloudRain className="w-5 h-5 text-[#E53935]" />
                  ) : (
                    <Sun className="w-5 h-5 text-[#F6B81A]" />
                  )}
                </div>
                <div className="text-[18px] font-bold text-[#17231F]">
                  {analysisResult.compatibility.sprayTimeWindow}
                </div>
                <div className="text-[13px] text-[#6B7280] tabular-nums">
                  {analysisResult.compatibility.weatherSafety.district} ·{' '}
                  {analysisResult.compatibility.weatherSafety.temperature}°C · Rain:{' '}
                  {analysisResult.compatibility.weatherSafety.rainProbability}% · Wind:{' '}
                  {analysisResult.compatibility.weatherSafety.windSpeed} km/h
                </div>
                <p className="text-[14px] text-[#17231F] leading-relaxed pt-1">
                  {language === 'ur'
                    ? analysisResult.compatibility.weatherSafety.weatherVerdictUr
                    : language === 'ps'
                    ? analysisResult.compatibility.weatherSafety.weatherVerdictPs
                    : analysisResult.compatibility.weatherSafety.weatherVerdictEn}
                </p>
              </div>

              {/* Column 3: Safety & PHI */}
              <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-2">
                <div className="text-[13px] font-semibold text-[#0F6B4B]">
                  {language === 'ur'
                    ? 'حفاظتی ہدایات اور PHI'
                    : language === 'ps'
                    ? 'ضروري احتیاط او PHI'
                    : 'Safety & Pre-Harvest Interval'}
                </div>
                <ul className="space-y-1.5 text-[14px] text-[#17231F]">
                  {(
                    analysisResult.compatibility.safetyChecklist[language] ||
                    analysisResult.compatibility.safetyChecklist.en
                  ).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-[#0F6B4B]">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {analysisResult.compatibility.rotationWarning && (
              <div className="p-4 rounded-[14px] bg-[#FFFBEB] text-[14px] text-[#17231F] flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#F6B81A] shrink-0" />
                <span>{analysisResult.compatibility.rotationWarning}</span>
              </div>
            )}

            {/* Save Report Button */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleSaveReport}
                disabled={isSavedToHistory}
                className={`min-h-[56px] px-6 py-3 rounded-[16px] font-semibold text-[16px] flex items-center gap-2.5 cursor-pointer ${
                  isSavedToHistory
                    ? 'bg-[#EBF5F0] text-[#0F6B4B]'
                    : 'bg-[#17231F] hover:bg-[#17231F]/90 text-white'
                }`}
              >
                <BookmarkCheck className="w-5 h-5" />
                <span>
                  {isSavedToHistory
                    ? language === 'ur'
                      ? 'اسپرے ریکارڈ میں محفوظ ہو گیا ✓'
                      : language === 'ps'
                      ? 'په ریکارډ کې محفوظ شو ✓'
                      : 'Saved to Spray History ✓'
                    : language === 'ur'
                    ? 'یہ رپورٹ ریکارڈ میں محفوظ کریں'
                    : language === 'ps'
                    ? 'دا راپور په ریکارډ کې محفوظ کړئ'
                    : 'Save Report to History'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('mix');
                  if (!mixResult) runMixCheck();
                }}
                className="min-h-[56px] px-6 py-3 rounded-[16px] bg-[#EBF5F0] hover:bg-[#0F6B4B] text-[#0F6B4B] hover:text-white font-semibold text-[15px] transition-colors cursor-pointer"
              >
                {language === 'ur'
                  ? '🧪 کیا میں اس میں کوئی دوسری دوائی ملا سکتا ہوں؟'
                  : language === 'ps'
                  ? '🧪 ایا زه له دې سره بله دوایي مکس کولی شم؟'
                  : '🧪 Can I Mix This With Another Medicine?'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODE 4: ❌ "CAN I MIX THESE TWO MEDICINES?" ==================== */}
      {mode === 'mix' && (
        <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6 animate-diagnosis-slide">
          <div className="space-y-1">
            <h3 className="text-[22px] sm:text-[26px] font-bold text-[#17231F]">
              {language === 'ur'
                ? '🧪 کیا میں یہ دو دوائیاں ایک ٹینکی میں ملا سکتا ہوں؟'
                : language === 'ps'
                ? '🧪 ایا زه دا دوه دوایۍ په یوه ټینکۍ کې مکس کولی شم؟'
                : '🧪 Can I Mix These Two Medicines in One Tank?'}
            </h3>
            <p className="text-[15px] text-[#6B7280]">
              {language === 'ur'
                ? 'کسان اکثر دو دوائیاں ایک ساتھ ملا دیتے ہیں جس سے فصل جل سکتی ہے۔ یہاں چیک کریں کہ کونسی دو دوائیاں ملانا محفوظ ہے اور کونسی خطرناک۔'
                : language === 'ps'
                ? 'زمینداران اکثر دوه دوایۍ یو ځای مکس کوي چې فصل سوځوي. دلته وګورئ چې د کومو دوه دواییو مکس کول محفوظ دي.'
                : 'Conservative Tank-Mix Safety Advisor: Checks chemical compatibility so you never burn your crop or clog your sprayer.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[13px] font-semibold text-[#6B7280] mb-1.5">
                {language === 'ur' ? 'پہلی دوائی (Medicine A):' : language === 'ps' ? 'اوله دوایي (Medicine A):' : 'Medicine A:'}
              </label>
              <select
                value={mixMedA}
                onChange={(e) => {
                  setMixMedA(e.target.value);
                  runMixCheck(e.target.value, mixMedB);
                }}
                className="w-full min-h-[56px] px-4 py-3 rounded-[14px] bg-[#F7F8F6] text-[15px] font-semibold text-[#17231F]"
              >
                {MEDICINE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#6B7280] mb-1.5">
                {language === 'ur' ? 'دوسری دوائی (Medicine B):' : language === 'ps' ? 'دویمه دوایي (Medicine B):' : 'Medicine B:'}
              </label>
              <select
                value={mixMedB}
                onChange={(e) => {
                  setMixMedB(e.target.value);
                  runMixCheck(mixMedA, e.target.value);
                }}
                className="w-full min-h-[56px] px-4 py-3 rounded-[14px] bg-[#F7F8F6] text-[15px] font-semibold text-[#17231F]"
              >
                {MEDICINE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => runMixCheck(mixMedA, mixMedB)}
              className="min-h-[56px] px-6 py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[16px] cursor-pointer"
            >
              {language === 'ur' ? 'ملاپ چیک کریں' : language === 'ps' ? 'مکس کول چیک کړئ' : 'Check Tank-Mix Safety'}
            </button>
          </div>

          {/* Quick Preset Mix Scenarios */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setMixMedA('Aliette 80 WG');
                setMixMedB('Dithane M-45');
                runMixCheck('Aliette 80 WG', 'Dithane M-45');
              }}
              className="px-4 py-2 rounded-[12px] bg-[#F7F8F6] hover:bg-[#EBF5F0] text-[13px] font-semibold text-[#17231F] cursor-pointer"
            >
              ❌ Aliette 80 WG + Mancozeb (Not Recommended)
            </button>
            <button
              type="button"
              onClick={() => {
                setMixMedA('Dithane M-45');
                setMixMedB('Score 250 EC');
                runMixCheck('Dithane M-45', 'Score 250 EC');
              }}
              className="px-4 py-2 rounded-[12px] bg-[#F7F8F6] hover:bg-[#EBF5F0] text-[13px] font-semibold text-[#0F6B4B] cursor-pointer"
            >
              ✅ Mancozeb + Score 250 EC (Verified Safe Mix)
            </button>
            <button
              type="button"
              onClick={() => {
                setMixMedA('Tilt 250 EC');
                setMixMedB('Score 250 EC');
                runMixCheck('Tilt 250 EC', 'Score 250 EC');
              }}
              className="px-4 py-2 rounded-[12px] bg-[#F7F8F6] hover:bg-[#EBF5F0] text-[13px] font-semibold text-[#E53935] cursor-pointer"
            >
              ❌ Tilt 250 EC + Score 250 EC (Leaf Burn Risk)
            </button>
          </div>

          {mixResult && (
            <div className="space-y-5 pt-2">
              <div
                className={`p-6 rounded-[18px] flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  mixResult.safeToMix === 'YES' ? 'bg-[#EBF5F0]' : 'bg-[#FEF2F2]'
                }`}
              >
                <div className="flex items-start gap-4">
                  {mixResult.safeToMix === 'YES' ? (
                    <CheckCircle2 className="w-10 h-10 text-[#0F6B4B] shrink-0" />
                  ) : (
                    <XCircle className="w-10 h-10 text-[#E53935] shrink-0" />
                  )}
                  <div className="space-y-1">
                    <span className="text-[13px] font-semibold text-[#6B7280] block">
                      {mixResult.medicineA} + {mixResult.medicineB}
                    </span>
                    <div className="text-[22px] sm:text-[26px] font-bold text-[#17231F]">
                      {mixResult.safeToMix === 'YES'
                        ? language === 'ur'
                          ? 'محفوظ ہے — ملا سکتے ہیں (Safe to Mix: YES)'
                          : language === 'ps'
                          ? 'محفوظ دي — مکس کولی شئ (Safe to Mix: YES)'
                          : 'Safe to Mix: YES ✅'
                        : language === 'ur'
                        ? 'ہرگز نہ ملائیں! (Safe to Mix: NO)'
                        : language === 'ps'
                        ? 'بالکل یې مه مکس کوئ! (Safe to Mix: NO)'
                        : 'Safe to Mix: NO ❌ (Cannot Recommend Mixing)'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => playVoiceScript(mixResult.voiceScript.ur, 'ur')}
                    className="min-h-[48px] px-5 py-2.5 rounded-[14px] bg-[#0F6B4B] text-white font-semibold text-[14px] flex items-center gap-2 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-[#F6B81A]" />
                    <span>اردو میں سنیں</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => playVoiceScript(mixResult.voiceScript.ps, 'ps')}
                    className="min-h-[48px] px-5 py-2.5 rounded-[14px] bg-[#17231F] text-white font-semibold text-[14px] flex items-center gap-2 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-[#F6B81A]" />
                    <span>په پښتو واورئ</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-1.5">
                  <span className="text-[13px] font-semibold text-[#0F6B4B] block">
                    {language === 'ur' ? 'وجہ (Reason):' : language === 'ps' ? 'وجہ (Reason):' : 'Reason:'}
                  </span>
                  <p className="text-[15px] text-[#17231F] leading-relaxed">
                    {mixResult.reason[language] || mixResult.reason.en}
                  </p>
                </div>

                <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-1.5">
                  <span className="text-[13px] font-semibold text-[#0F6B4B] block">
                    {language === 'ur'
                      ? 'تجویز کردہ تناسب (Recommended Ratio):'
                      : language === 'ps'
                      ? 'سمه اندازه (Recommended Ratio):'
                      : 'Recommended Ratio:'}
                  </span>
                  <p className="text-[15px] font-semibold text-[#17231F] leading-relaxed">
                    {mixResult.recommendedRatio[language] || mixResult.recommendedRatio.en}
                  </p>
                </div>

                <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-1.5">
                  <span className="text-[13px] font-semibold text-[#0F6B4B] block">
                    {language === 'ur'
                      ? 'محفوظ متبادل طریقہ (Safe Alternative):'
                      : language === 'ps'
                      ? 'محفوظه طریقه (Safe Alternative):'
                      : 'Safe Alternative:'}
                  </span>
                  <p className="text-[15px] text-[#17231F] leading-relaxed">
                    {mixResult.alternativeIfUnsafe[language] || mixResult.alternativeIfUnsafe.en}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODE 5: ⚖️ MEDICINE COMPARISON (A vs B) ==================== */}
      {mode === 'compare' && (
        <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6 animate-diagnosis-slide">
          <div className="space-y-1">
            <h3 className="text-[22px] sm:text-[26px] font-bold text-[#17231F]">
              {language === 'ur'
                ? '⚖️ دو دوائیوں کا موازنہ (کونسی بہتر اور سستی ہے؟)'
                : language === 'ps'
                ? '⚖️ د دوه دواییو مقابله (کومه دوایي ښه او ارزانه ده؟)'
                : '⚖️ Medicine Comparison (Bottle A vs Bottle B)'}
            </h3>
            <p className="text-[15px] text-[#6B7280]">
              {language === 'ur'
                ? 'دوائی خریدنے سے پہلے دونوں کی قیمت، اثر اور فصل کے لیے موزونیت کا مقابلہ کریں۔'
                : language === 'ps'
                ? 'له اخیستلو مخکې د دواړو دواییو قیمت، اثر او د فصل لپاره فایده وګورئ.'
                : 'Compare authenticity, crop suitability, PKR cost, effectiveness, and toxicity side-by-side.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[13px] font-semibold text-[#6B7280] mb-1.5">Medicine A:</label>
              <select
                value={compareMedA}
                onChange={(e) => {
                  setCompareMedA(e.target.value);
                  runComparison(e.target.value, compareMedB);
                }}
                className="w-full min-h-[56px] px-4 py-3 rounded-[14px] bg-[#F7F8F6] text-[15px] font-semibold text-[#17231F]"
              >
                {MEDICINE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#6B7280] mb-1.5">Medicine B:</label>
              <select
                value={compareMedB}
                onChange={(e) => {
                  setCompareMedB(e.target.value);
                  runComparison(compareMedA, e.target.value);
                }}
                className="w-full min-h-[56px] px-4 py-3 rounded-[14px] bg-[#F7F8F6] text-[15px] font-semibold text-[#17231F]"
              >
                {MEDICINE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => runComparison(compareMedA, compareMedB)}
              className="min-h-[56px] px-6 py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[16px] cursor-pointer"
            >
              {language === 'ur' ? 'موازنہ کریں' : language === 'ps' ? 'مقابله وکړئ' : 'Compare Now'}
            </button>
          </div>

          {comparisonResult && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-[14px] text-[#6B7280]">
                      <th className="py-3.5 px-4 text-start font-semibold">Feature</th>
                      <th className="py-3.5 px-4 text-start font-bold text-[#17231F]">
                        A: {comparisonResult.medicineA.name}
                      </th>
                      <th className="py-3.5 px-4 text-start font-bold text-[#17231F]">
                        B: {comparisonResult.medicineB.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-[15px]">
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-[#6B7280]">Genuine (اصلی)</td>
                      <td className="py-3.5 px-4 font-semibold">
                        {comparisonResult.medicineA.genuine ? '✅ Genuine' : '❌ Suspicious'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        {comparisonResult.medicineB.genuine ? '✅ Genuine' : '❌ Suspicious'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-[#6B7280]">
                        Suitable for {comparisonResult.crop} ({comparisonResult.disease})
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        {comparisonResult.medicineA.suitable ? '✅ Suitable' : '❌ Not Suitable'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        {comparisonResult.medicineB.suitable ? '✅ Suitable' : '❌ Not Suitable'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-[#6B7280]">Estimated Cost (قیمت)</td>
                      <td className="py-3.5 px-4 font-mono font-bold tabular-nums">
                        PKR {comparisonResult.medicineA.costPkr}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold tabular-nums">
                        PKR {comparisonResult.medicineB.costPkr}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-[#6B7280]">Effectiveness (اثر)</td>
                      <td className="py-3.5 px-4 font-semibold">{comparisonResult.medicineA.effectiveness}</td>
                      <td className="py-3.5 px-4 font-semibold">{comparisonResult.medicineB.effectiveness}</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-[#6B7280]">Toxicity (زہریلا پن)</td>
                      <td className="py-3.5 px-4">{comparisonResult.medicineA.toxicity}</td>
                      <td className="py-3.5 px-4">{comparisonResult.medicineB.toxicity}</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-[#6B7280]">Dosage / Liter</td>
                      <td className="py-3.5 px-4">{comparisonResult.medicineA.dosagePerLiter}</td>
                      <td className="py-3.5 px-4">{comparisonResult.medicineB.dosagePerLiter}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-5 rounded-[16px] bg-[#EBF5F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-[16px] text-[#17231F] leading-relaxed">
                  {language === 'ur'
                    ? comparisonResult.verdict.ur
                    : language === 'ps'
                    ? comparisonResult.verdict.ps
                    : comparisonResult.verdict.en}
                </p>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => playVoiceScript(comparisonResult.verdict.voiceScriptUr, 'ur')}
                    className="min-h-[48px] px-4 py-2 rounded-[14px] bg-[#0F6B4B] text-white font-semibold text-[14px] flex items-center gap-2 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-[#F6B81A]" />
                    <span>اردو</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => playVoiceScript(comparisonResult.verdict.voiceScriptPs, 'ps')}
                    className="min-h-[48px] px-4 py-2 rounded-[14px] bg-[#17231F] text-white font-semibold text-[14px] flex items-center gap-2 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-[#F6B81A]" />
                    <span>پښتو</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODE 6: 📋 SAVED SPRAY & MEDICINE HISTORY ==================== */}
      {mode === 'history' && (
        <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6 animate-diagnosis-slide">
          <div className="space-y-1">
            <h3 className="text-[22px] sm:text-[26px] font-bold text-[#17231F]">
              {language === 'ur'
                ? '📋 آپ کی دوائی اور اسپرے کا محفوظ ریکارڈ'
                : language === 'ps'
                ? '📋 ستاسو د دوایۍ او سپرے محفوظ شوی ریکارډ'
                : '📋 Saved Medicine & Spray History'}
            </h3>
            <p className="text-[15px] text-[#6B7280]">
              {language === 'ur'
                ? 'پہلے چیک کی گئی دوائیاں، فصل، تاریخ اور نتیجہ یہاں دیکھیں۔'
                : language === 'ps'
                ? 'مخکې چیک شوې دوایۍ، فصل، نېټه او نتیجه دلته وګورئ.'
                : 'Review your past scanned medicines, crops, dates, dosages, and PHI intervals.'}
            </p>
          </div>

          <div className="space-y-4">
            {historyList.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-[16px] bg-[#F7F8F6] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="text-[18px] font-bold text-[#17231F]">{item.medicineName}</div>
                  <div className="text-[14px] text-[#6B7280]">
                    Crop: <span className="font-semibold text-[#17231F]">{item.crop}</span> ({item.disease}) · District:{' '}
                    {item.district} · Dosage: {item.dosageUsed} · PHI: {item.phiDays} days
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[13px] font-mono text-[#6B7280] tabular-nums">{item.date}</span>
                  <span className="text-[14px] font-semibold text-[#0F6B4B]">{item.resultStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
