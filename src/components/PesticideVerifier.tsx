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
  FlaskConical,
  QrCode,
  Sprout,
  Clock,
  Droplets,
  CalendarCheck,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { VoiceAssistant } from '../utils/audioSpeech';

interface PesticideVerifierProps {
  language: Language;
  presetCrop?: string;
  presetDisease?: string;
  activeDistrict?: string;
  hasActiveScan?: boolean;
}

type AdvisorMode = 'scan' | 'search' | 'barcode';
type CheckScope = 'active' | 'general';

const MEDICINE_OPTIONS = [
  { value: 'Aliette 80 WG', label: 'Aliette 80 WG (ایلیٹ)' },
  { value: 'Dithane M-45', label: 'Dithane M-45 (مینکوزیب 75% WP)' },
  { value: 'Ridomil Gold MZ 68 WG', label: 'Ridomil Gold MZ 68 WG (ریڈومل گولڈ)' },
  { value: 'Copper Oxychloride 50% WP', label: 'Copper Oxychloride 50% WP (کاپر آکسی کلورائیڈ)' },
  { value: 'Tilt 250 EC', label: 'Tilt 250 EC (ٹلٹ - گندم کی کنگی)' },
  { value: 'Score 250 EC', label: 'Score 250 EC (اسکور)' },
  { value: 'Karate 2.5 EC', label: 'Karate 2.5 EC (کراٹے - کیڑے مار دوائی)' },
  { value: 'Paraquat 20% SL', label: 'Paraquat 20% SL (جڑی بوٹی مار زہر)' },
  { value: 'Super Blight Cure 80 WP', label: 'Super Blight 80 (مشکوک / زائد المیعاد)' },
];

const CROP_LABELS_UR: Record<string, string> = {
  Tomato: 'ٹماٹر',
  Wheat: 'گندم',
  Maize: 'مکئی',
  Potato: 'آلو',
  Cotton: 'کپاس',
  Chili: 'مرچ',
  Onion: 'پیاز',
  Barley: 'جو',
  Cucumber: 'کھیرا',
  Citrus: 'مالٹا',
  Apple: 'سیب',
};

const CROP_LABELS_PS: Record<string, string> = {
  Tomato: 'ټماټر',
  Wheat: 'غنم',
  Maize: 'جوار',
  Potato: 'الوګان',
  Cotton: 'پمبه (کپاس)',
  Chili: 'مرچک',
  Onion: 'پیاز',
  Barley: 'اوربشې',
  Cucumber: 'بادرنګ',
  Citrus: 'مالټه',
  Apple: 'مڼه',
};

export const PesticideVerifier: React.FC<PesticideVerifierProps> = ({
  language,
  presetCrop = 'Tomato',
  presetDisease = 'Early Blight',
  activeDistrict = 'Mardan',
  hasActiveScan = false,
}) => {
  const t = TRANSLATIONS[language];
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<AdvisorMode>('scan');
  const [checkScope, setCheckScope] = useState<CheckScope>('active');
  const [selectedCrop, setSelectedCrop] = useState<string>(presetCrop || 'Tomato');
  const [selectedDisease, setSelectedDisease] = useState<string>(presetDisease || 'Early Blight');

  const [previewImage, setPreviewImage] = useState<string>('');
  const [showPhotoOptions, setShowPhotoOptions] = useState<boolean>(false);
  const [photoMissingPrompt, setPhotoMissingPrompt] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('Aliette 80 WG');
  const [barcodeInput, setBarcodeInput] = useState<string>('8964001254890');
  const [poorImageQualityPrompt, setPoorImageQualityPrompt] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Voice playback state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState<boolean>(false);
  const [speakingLang, setSpeakingLang] = useState<Language | null>(null);

  // Always sync with the latest active leaf scan reading
  useEffect(() => {
    if (presetCrop) setSelectedCrop(presetCrop);
    if (presetDisease) setSelectedDisease(presetDisease);
    setAnalysisResult(null);
  }, [presetCrop, presetDisease]);

  const runBottleScan = async (opts: {
    imageBase64?: string;
    bottleHint?: string;
    barcode?: string;
    cropOverride?: string;
    diseaseOverride?: string;
  }) => {
    VoiceAssistant.stop();
    setIsSpeaking(false);
    setSpeakingLang(null);
    setIsLoading(true);
    setPoorImageQualityPrompt(false);

    try {
      const resp = await fetch('/api/v1/medicine/scan-bottle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: opts.imageBase64 || '',
          bottleHint: opts.imageBase64 ? (opts.bottleHint || '') : (opts.bottleHint ?? searchQuery),
          barcode: opts.barcode || '',
          crop: opts.cropOverride || selectedCrop,
          disease: opts.diseaseOverride || selectedDisease,
          growthStage: 'Flowering / Fruiting',
          district: activeDistrict || 'Mardan',
          previousSpray: 'None',
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
    setSpeakingLang(null);
    setIsLoading(true);
    setPoorImageQualityPrompt(false);

    try {
      const resp = await fetch('/api/v1/medicine/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: code,
          crop: selectedCrop,
          disease: selectedDisease,
          growthStage: 'Flowering / Fruiting',
          district: activeDistrict || 'Mardan',
          previousSpray: 'None',
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setPreviewImage(dataUrl);
      setShowPhotoOptions(false);
      setPhotoMissingPrompt(false);
      setPoorImageQualityPrompt(false);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmitBottleScan = () => {
    if (!previewImage) {
      setShowPhotoOptions(true);
      setPhotoMissingPrompt(true);
      return;
    }
    setPhotoMissingPrompt(false);
    runBottleScan({ imageBase64: previewImage, bottleHint: '' });
  };

  const playVoiceScript = (scriptText: string, targetLang: Language = language) => {
    if ((isSpeaking || isLoadingVoice) && speakingLang === targetLang) {
      VoiceAssistant.stop();
      setIsSpeaking(false);
      setIsLoadingVoice(false);
      setSpeakingLang(null);
      return;
    }

    setSpeakingLang(targetLang);
    VoiceAssistant.speak(
      scriptText,
      targetLang,
      () => {
        setIsLoadingVoice(false);
        setIsSpeaking(true);
      },
      () => {
        setIsSpeaking(false);
        setSpeakingLang(null);
      },
      () => {
        setIsSpeaking(false);
        setSpeakingLang(null);
      },
      'elder',
      (loading) => setIsLoadingVoice(loading)
    );
  };

  const loc = analysisResult?.localized?.[language] || analysisResult?.localized?.ur;
  const isGenuineBottle = Boolean(analysisResult?.authenticity?.isGenuine);
  const isMatchedForActiveCrop = Boolean(
    isGenuineBottle &&
      analysisResult?.compatibility?.suitableForCrop &&
      analysisResult?.compatibility?.suitableForDisease
  );

  // In General Check Mode, any genuine crop-disease bottle shows full details & which crops it fits.
  // In Active Scan Mode, it must match the farmer's active scanned crop & disease!
  const isHealthyScan = selectedDisease.toLowerCase().includes('healthy');
  const showSuccessDetails =
    checkScope === 'general'
      ? isGenuineBottle && (analysisResult?.compatibility?.targetCrops?.length || 0) > 0
      : isMatchedForActiveCrop;

  const altMed = analysisResult?.compatibility?.recommendedAlternative;
  const cropUrName = CROP_LABELS_UR[selectedCrop] || selectedCrop;
  const cropPsName = CROP_LABELS_PS[selectedCrop] || selectedCrop;

  const targetCropsLocalized: string[] = (analysisResult?.compatibility?.targetCrops || []).map((c: string) =>
    language === 'ur' ? CROP_LABELS_UR[c] || c : language === 'ps' ? CROP_LABELS_PS[c] || c : c
  );

  // Build effective voice/banner text depending on whether user is in Active Scan Check vs General Check
  const getBannerTitle = () => {
    if (!analysisResult) return '';
    if (checkScope === 'general') {
      if (!isGenuineBottle || (analysisResult?.compatibility?.targetCrops?.length || 0) === 0) {
        return loc?.statusTitle;
      }
      if (language === 'ur') {
        return `یہ دوائی (${analysisResult.extracted.brandName}) اصلی ہے — ان فصلوں کے لیے ٹھیک ہے: ${targetCropsLocalized.join('، ')}`;
      }
      if (language === 'ps') {
        return `دا دوایي (${analysisResult.extracted.brandName}) اصلي ده — د دې فصلونو لپاره سمه ده: ${targetCropsLocalized.join('، ')}`;
      }
      return `${analysisResult.extracted.brandName} is Genuine — Effective for: ${targetCropsLocalized.join(', ')}`;
    }
    return loc?.statusTitle;
  };

  const getBannerReason = () => {
    if (!analysisResult) return '';
    if (checkScope === 'general' && showSuccessDetails) {
      if (language === 'ur') {
        return `خوشخبری! یہ دوائی (${analysisResult.extracted.brandName}) بالکل اصلی ہے اور ان فصلوں کے لیے بالکل ٹھیک ہے۔`;
      }
      if (language === 'ps') {
        return `زېری! دا دوایي (${analysisResult.extracted.brandName}) بالکل اصلي ده او د دې فصلونو لپاره بالکل سمه ده.`;
      }
      return `Good news! ${analysisResult.extracted.brandName} is genuine and suitable for these crops.`;
    }
    return loc?.reason || '';
  };

  const getVoiceScriptForLang = (targetLang: 'ur' | 'ps' | 'en') => {
    if (!analysisResult) return '';
    const langLoc = analysisResult.localized[targetLang];
    if (checkScope === 'general' && isGenuineBottle && (analysisResult?.compatibility?.targetCrops?.length || 0) > 0) {
      if (targetLang === 'ur') {
        return `السلام علیکم کسان بھائی! یہ دوائی ${analysisResult.extracted.brandName} بالکل اصلی ہے۔ ${langLoc.targetSummary} دینے کا طریقہ: ${langLoc.howToUse} کب اسپرے کرنا ہے: ${langLoc.whenToSpray} دوبارہ کب چیک کرنا ہے: ${langLoc.whenToRecheck}`;
      }
      if (targetLang === 'ps') {
        return `السلام علیکم زما خوږه زمینداره وروره! دا د ${analysisResult.extracted.brandName} دوایي بالکل اصلي ده. ${langLoc.targetSummary} د کارولو طریقه: ${langLoc.howToUse} کله سپرے کول پکار دي: ${langLoc.whenToSpray} بیا کله کتل پکار دي: ${langLoc.whenToRecheck}`;
      }
      return `${analysisResult.extracted.brandName} is genuine. ${langLoc.targetSummary} ${langLoc.howToUse} ${langLoc.whenToSpray} ${langLoc.whenToRecheck}`;
    }
    return langLoc.voiceScript;
  };

  return (
    <div className="space-y-6 animate-card-fade">
      {/* 1. CLEAN HEADER, SCOPE TOGGLE & 3 SIMPLE MODES */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-[#17231F] leading-tight">
              {language === 'ur'
                ? 'دوائی چیک کریں (اصلی یا نقلی اور استعمال کا طریقہ)'
                : language === 'ps'
                ? 'دوایي چیک کړئ (اصلي که نقلي او د استعمال طریقه)'
                : 'Check Medicine (Suitability & Full Usage Guide)'}
            </h2>
            <p className="text-[15px] font-normal text-[#6B7280] mt-1">
              {language === 'ur'
                ? 'جانیں کہ یہ دوائی آپ کی اسکین شدہ فصل کے لیے ٹھیک ہے یا نہیں، یا صرف چیک کریں کہ یہ کن فصلوں کے لیے ہے'
                : language === 'ps'
                ? 'وګورئ چې دا دوایي ستاسو د سکین شوي فصل لپاره سمه ده که نه، یا معلومه کړئ چې د کومو فصلونو لپاره ده'
                : 'Verify if this bottle matches your scanned crop, or check which crops & diseases it treats'}
            </p>
          </div>
        </div>

        {/* 2-Way Scope Switch: Active Scanned Crop vs General Bottle Check */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2 rounded-[16px] bg-[#F7F8F6]">
          <button
            type="button"
            onClick={() => setCheckScope('active')}
            className={`min-h-[52px] px-4 py-2.5 rounded-[12px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              checkScope === 'active'
                ? 'bg-[#0F6B4B] text-white shadow-xs'
                : 'bg-transparent text-[#17231F] hover:bg-white'
            }`}
          >
            <Sprout className={`w-4 h-4 shrink-0 ${checkScope === 'active' ? 'text-[#F6B81A]' : 'text-[#0F6B4B]'}`} />
            <span>
              {language === 'ur'
                ? `میری اسکین شدہ فصل (${cropUrName}) کے لیے چیک کریں`
                : language === 'ps'
                ? `زما د سکین شوي فصل (${cropPsName}) لپاره وګورئ`
                : `Check for My Scanned Crop (${selectedCrop})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCheckScope('general')}
            className={`min-h-[52px] px-4 py-2.5 rounded-[12px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              checkScope === 'general'
                ? 'bg-[#0F6B4B] text-white shadow-xs'
                : 'bg-transparent text-[#17231F] hover:bg-white'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 shrink-0 ${checkScope === 'general' ? 'text-[#F6B81A]' : 'text-[#0F6B4B]'}`} />
            <span>
              {language === 'ur'
                ? 'صرف دوائی چیک کریں (یہ کس کس فصل کے لیے ہے؟)'
                : language === 'ps'
                ? 'صرف دوایي وګورئ (د کومو فصلونو لپاره ده؟)'
                : 'Just Check Bottle (Which Crops Does It Treat?)'}
            </span>
          </button>
        </div>

        {/* Active Scan Context Bar (Shown when checking against a crop) */}
        {checkScope === 'active' && (
          <div className="p-4 rounded-[16px] bg-[#EBF5F0] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[13px] font-bold text-[#0F6B4B]">
                {hasActiveScan
                  ? language === 'ur'
                    ? `📌 آپ کی تازہ ترین اسکین ریڈنگ: ${cropUrName} (${selectedDisease})`
                    : language === 'ps'
                    ? `📌 ستاسو تازه سکین: ${cropPsName} (${selectedDisease})`
                    : `📌 Active Scan Reading: ${selectedCrop} (${selectedDisease})`
                  : language === 'ur'
                  ? 'فصل اور بیماری منتخب کریں:'
                  : language === 'ps'
                  ? 'فصل او بيماري انتخاب کړئ:'
                  : 'Select Crop & Disease:'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">
                  {language === 'ur' ? 'فصل:' : language === 'ps' ? 'فصل:' : 'Crop:'}
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => {
                    const nextCrop = e.target.value;
                    setSelectedCrop(nextCrop);
                    setAnalysisResult(null);
                    if (nextCrop === 'Wheat') setSelectedDisease('Yellow Stripe Rust');
                    else if (nextCrop === 'Maize') setSelectedDisease('Maize Leaf Blight');
                    else if (nextCrop === 'Cotton') setSelectedDisease('Cotton Bacterial Blight');
                    else if (nextCrop === 'Onion') setSelectedDisease('Purple Blotch');
                    else if (nextCrop === 'Chili') setSelectedDisease('Anthracnose');
                    else setSelectedDisease('Early Blight');
                  }}
                  className="w-full min-h-[46px] px-3.5 py-2 rounded-[12px] bg-white text-[15px] font-semibold text-[#17231F]"
                >
                  <option value="Tomato">ٹماٹر (Tomato)</option>
                  <option value="Wheat">گندم (Wheat)</option>
                  <option value="Maize">مکئی (Maize)</option>
                  <option value="Potato">آلو (Potato)</option>
                  <option value="Cotton">کپاس (Cotton)</option>
                  <option value="Chili">مرچ (Chili)</option>
                  <option value="Onion">پیاز (Onion)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">
                  {language === 'ur' ? 'بیماری:' : language === 'ps' ? 'بیماري:' : 'Disease:'}
                </label>
                <select
                  value={selectedDisease}
                  onChange={(e) => {
                    setSelectedDisease(e.target.value);
                    setAnalysisResult(null);
                  }}
                  className="w-full min-h-[46px] px-3.5 py-2 rounded-[12px] bg-white text-[15px] font-semibold text-[#17231F]"
                >
                  <option value="Early Blight">پتوں کا جھلساؤ (Early Blight)</option>
                  <option value="Late Blight">پچھیتا جھلساؤ (Late Blight)</option>
                  <option value="Yellow Stripe Rust">گندم کی پیلی کنگی (Yellow Rust)</option>
                  <option value="Maize Leaf Blight">مکئی کا جھلساؤ (Maize Leaf Blight)</option>
                  <option value="Cotton Bacterial Blight">کپاس کا بیکٹیریل جھلساؤ (Cotton Blight)</option>
                  <option value="Anthracnose">انتھراکنوز / دھبے (Anthracnose)</option>
                  <option value="Purple Blotch">پیاز کے جامنی دھبے (Purple Blotch)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Notice if the farmer's scanned leaf was Healthy */}
        {checkScope === 'active' && isHealthyScan && (
          <div className="p-4 rounded-[16px] bg-[#EBF5F0] text-[#0F6B4B] font-semibold text-[15px] flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              {language === 'ur'
                ? `آپ کی ${cropUrName} کی تازہ اسکین بالکل صحت مند ہے — ابھی کسی کیمیکل اسپرے کی ضرورت نہیں ہے۔`
                : language === 'ps'
                ? `ستاسو د ${cropPsName} تازه سکین بالکل روغ دی — اوس هیڅ سپرے ته ضرورت نشته.`
                : `Your scanned ${selectedCrop} leaf is healthy — no spray needed right now.`}
            </span>
          </div>
        )}

        {/* 3 Clean Tool Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  setSpeakingLang(null);
                  setMode(tab.id);
                }}
                className={`min-h-[56px] px-4 py-3 rounded-[16px] font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0F6B4B] text-white shadow-[0_6px_16px_rgba(15,107,75,0.22)]'
                    : 'bg-[#F7F8F6] hover:bg-[#EBF5F0] text-[#17231F] font-normal'
                }`}
              >
                <IconComp className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#F6B81A]' : 'text-[#0F6B4B]'}`} />
                <span className="truncate">
                  {language === 'ur' ? tab.ur : language === 'ps' ? tab.ps : tab.en}
                </span>
              </button>
            );
          })}
        </div>

        {/* MODE 1: [📷 SCAN BOTTLE] */}
        {mode === 'scan' && (
          <div className="space-y-5 pt-1">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 flex flex-col items-center gap-3">
                {previewImage ? (
                  <div
                    onClick={() => setShowPhotoOptions((prev) => !prev)}
                    className="relative group cursor-pointer"
                  >
                    <img
                      src={previewImage}
                      alt="Scanned Medicine Bottle"
                      referrerPolicy="no-referrer"
                      className="w-48 h-48 sm:w-56 sm:h-56 rounded-[20px] object-cover shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                    />
                    <div className="mt-2 text-center text-[13px] font-semibold text-[#0F6B4B]">
                      {language === 'ur'
                        ? 'تصویر تبدیل کرنے کے لیے یہاں کلک کریں'
                        : language === 'ps'
                        ? 'د تصویر بدلولو لپاره دلته کلیک وکړئ'
                        : 'Tap photo to change'}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPhotoOptions((prev) => !prev)}
                    className="w-full max-w-[260px] min-h-[210px] rounded-[20px] bg-[#EBF5F0] border-2 border-dashed border-[#0F6B4B]/40 flex flex-col items-center justify-center gap-3 text-[#0F6B4B] p-5 text-center cursor-pointer hover:bg-[#EBF5F0]/80 transition-colors"
                  >
                    <FlaskConical className="w-11 h-11 shrink-0" />
                    <span className="text-[14px] font-bold leading-snug">
                      {language === 'ur'
                        ? 'کیمرے سے بوتل کی تصویر لیں یا موبائل سے اپلوڈ کریں'
                        : language === 'ps'
                        ? 'په کیمره د بوتل تصویر واخلئ یا له موبایل څخه یې اپلوډ کړئ'
                        : 'Take Bottle Photo with Camera or Upload from Mobile'}
                    </span>
                    <span className="text-[12px] text-[#0F6B4B]/80 font-medium">
                      {language === 'ur'
                        ? 'آپشن دیکھنے کے لیے یہاں کلک کریں'
                        : language === 'ps'
                        ? 'د انتخاب لپاره دلته کلیک وکړئ'
                        : 'Tap here to choose'}
                    </span>
                  </button>
                )}

                {showPhotoOptions && (
                  <div className="w-full max-w-[300px] grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-[16px] bg-[#F7F8F6] border border-[#0F6B4B]/15 animate-card-fade">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="min-h-[48px] px-3 py-2.5 rounded-[12px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[13px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 shrink-0 text-[#F6B81A]" />
                      <span>
                        {language === 'ur'
                          ? 'کیمرے سے تصویر لیں'
                          : language === 'ps'
                          ? 'په کیمره تصویر واخلئ'
                          : 'Use Camera'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="min-h-[48px] px-3 py-2.5 rounded-[12px] bg-white hover:bg-[#EBF5F0] text-[#17231F] border border-[#0F6B4B]/20 font-semibold text-[13px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 shrink-0 text-[#0F6B4B]" />
                      <span>
                        {language === 'ur'
                          ? 'موبائل سے اپلوڈ کریں'
                          : language === 'ps'
                          ? 'له موبایل اپلوډ کړئ'
                          : 'Upload from Mobile'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <div className="md:col-span-7 space-y-3">
                {photoMissingPrompt && !previewImage && (
                  <div className="p-3 rounded-[12px] bg-[#FFFBEB] text-[#92400E] text-[13px] font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#F6B81A]" />
                    <span>
                      {language === 'ur'
                        ? 'پہلے اوپر تصویر والے حصے سے کیمرے یا موبائل سے بوتل کی تصویر منتخب کریں۔'
                        : language === 'ps'
                        ? 'لومړی پورته د کیمرې یا موبایل څخه د بوتل تصویر انتخاب کړئ.'
                        : 'Please take or upload a bottle photo above first.'}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmitBottleScan}
                  disabled={isLoading}
                  className="w-full min-h-[56px] px-6 py-3.5 rounded-[16px] bg-[#F6B81A] hover:bg-[#F6B81A]/90 text-[#17231F] font-bold text-[16px] flex items-center justify-center gap-3 shadow-xs cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  <span>
                    {isLoading
                      ? language === 'ur'
                        ? 'اسکین ہو رہا ہے...'
                        : language === 'ps'
                        ? 'سکین روان دی...'
                        : 'Scanning...'
                      : language === 'ur'
                      ? 'سبمٹ کریں اور اسکین شروع کریں'
                      : language === 'ps'
                      ? 'سپارل او سکین پیل کړئ'
                      : 'Submit & Start Scanning'}
                  </span>
                </button>
              </div>
            </div>

            {poorImageQualityPrompt && (
              <div className="p-4 rounded-[16px] bg-[#FFFBEB] text-[#17231F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="font-bold text-[15px] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#F6B81A]" />
                  <span>
                    {language === 'ur'
                      ? 'تصویر صاف نہیں ہے — بارکوڈ اسکین کریں'
                      : language === 'ps'
                      ? 'تصویر صاف نه دی — بارکوډ سکین کړئ'
                      : 'Blurry image — Switch to barcode scan'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPoorImageQualityPrompt(false);
                    setMode('barcode');
                  }}
                  className="min-h-[44px] px-5 py-2 rounded-[12px] bg-[#0F6B4B] text-white font-semibold text-[14px] shrink-0 cursor-pointer"
                >
                  {language === 'ur' ? 'بارکوڈ اسکین' : language === 'ps' ? 'بارکوډ سکین' : 'Barcode Scan'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: [🔍 SEARCH BY NAME] */}
        {mode === 'search' && (
          <div className="space-y-4 pt-1">
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
                disabled={isLoading}
                className="min-h-[56px] px-8 py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[16px] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
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
                  className="min-h-[50px] px-4 py-2.5 rounded-[14px] bg-[#F7F8F6] hover:bg-[#EBF5F0] text-start text-[14px] font-semibold text-[#17231F] truncate cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODE 3: [📦 SCAN BARCODE] */}
        {mode === 'barcode' && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Barcode className="w-5 h-5 text-[#0F6B4B] absolute start-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runBarcodeLookup()}
                  placeholder="8964001254890"
                  className="w-full min-h-[56px] ps-12 pe-4 py-3 bg-[#F7F8F6] rounded-[14px] text-[16px] font-mono text-[#17231F]"
                />
              </div>
              <button
                type="button"
                onClick={() => runBarcodeLookup()}
                disabled={isLoading}
                className="min-h-[56px] px-8 py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[16px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-5 h-5 text-[#F6B81A]" />
                <span>
                  {language === 'ur'
                    ? 'بارکوڈ چیک کریں'
                    : language === 'ps'
                    ? 'بارکوډ چیک کړئ'
                    : 'Check Barcode'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== RESULT SECTION ==================== */}
      {analysisResult && (
        <div className="space-y-5 animate-diagnosis-slide">
          {/* 1. COLOR-CODED VERDICT & VOICE BANNER:
              - GREEN (#0F6B4B) when matched & genuine (or genuine in General Check mode)
              - RED (#C62828) when NOT matched or fake/expired */}
          <div
            className={`${
              showSuccessDetails ? 'bg-[#0F6B4B]' : 'bg-[#C62828]'
            } text-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.08)] space-y-5 transition-colors`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                {showSuccessDetails ? (
                  <CheckCircle2 className="w-8 h-8 text-[#F6B81A] shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-8 h-8 text-white shrink-0 mt-1" />
                )}
                <div className="space-y-1">
                  <span className="text-[13px] text-white/85 block">
                    {language === 'ur'
                      ? 'پڑھنے کی ضرورت نہیں — بٹن دبائیں اور پورا مشورہ سنیں'
                      : language === 'ps'
                      ? 'لوستلو ته ضرورت نشته — بټن کېکاږئ او پوره مشوره واورئ'
                      : 'Tap to listen to full voice advice'}
                  </span>
                  <h3 className="text-[22px] sm:text-[26px] font-bold text-white leading-snug">
                    {getBannerTitle()}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => playVoiceScript(getVoiceScriptForLang('ur'), 'ur')}
                  className="min-h-[54px] px-6 py-3 rounded-[16px] bg-[#F6B81A] hover:bg-[#F6B81A]/90 text-[#17231F] font-bold text-[16px] flex items-center gap-2.5 cursor-pointer"
                >
                  {isLoadingVoice && speakingLang === 'ur' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isSpeaking && speakingLang === 'ur' ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                  <span>{isSpeaking && speakingLang === 'ur' ? 'آواز روکیں' : 'اردو میں سنیں'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => playVoiceScript(getVoiceScriptForLang('ps'), 'ps')}
                  className="min-h-[54px] px-6 py-3 rounded-[16px] bg-white hover:bg-white/90 text-[#17231F] font-bold text-[16px] flex items-center gap-2.5 cursor-pointer"
                >
                  {isLoadingVoice && speakingLang === 'ps' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isSpeaking && speakingLang === 'ps' ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className={`w-5 h-5 ${showSuccessDetails ? 'text-[#0F6B4B]' : 'text-[#C62828]'}`} />
                  )}
                  <span>{isSpeaking && speakingLang === 'ps' ? 'غږ ودرول' : 'په پښتو واورئ'}</span>
                </button>
              </div>
            </div>

            <p
              className={`text-[16px] text-white/95 leading-relaxed p-4 rounded-[14px] ${
                showSuccessDetails ? 'bg-[#0A4D36]' : 'bg-[#8E1B1B]'
              }`}
            >
              {getBannerReason()}
            </p>

            {/* Inside Red Card: Explain what this mismatched medicine/herbicide is actually used for */}
            {!showSuccessDetails && loc?.targetSummary && (
              <div className="p-4 rounded-[14px] bg-[#7A1616] border border-white/15 space-y-2">
                <div className="text-[13px] font-bold text-[#F6B81A]">
                  {language === 'ur'
                    ? 'ℹ️ اصل میں یہ دوائی کن فصلوں اور کس کام کے لیے استعمال ہوتی ہے:'
                    : language === 'ps'
                    ? 'ℹ️ دا دوایي په اصل کې د کومو فصلونو او کوم کار لپاره استعمالیږي:'
                    : 'ℹ️ What this product is actually used for:'}
                </div>
                <p className="text-[15px] text-white/95 leading-relaxed">{loc.targetSummary}</p>
                {targetCropsLocalized.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {targetCropsLocalized.map((cropName: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-[10px] bg-white/15 text-white font-semibold text-[13px]"
                      >
                        {cropName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2A. IF NOT MATCHED OR FAKE -> NO EXTRA DETAILS! ONLY SHOW THE RECOMMENDED ALTERNATIVE MEDICINE */}
          {!showSuccessDetails ? (
            <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border-2 border-[#0F6B4B]/25 space-y-4">
              <div className="text-[15px] font-bold text-[#0F6B4B]">
                {checkScope === 'general'
                  ? language === 'ur'
                    ? '❌ یہ دوائی استعمال کے قابل نہیں ہے — اس کی جگہ یہ صحیح دوائی لیں:'
                    : language === 'ps'
                    ? '❌ دا دوایي د استعمال وړ نه ده — د دې پر ځای دا سمه دوایي واخلئ:'
                    : '❌ Do NOT use this product — Recommended Safe Alternative:'
                  : language === 'ur'
                  ? `✅ آپ کی ${cropUrName} کی اس بیماری کے لیے یہی متبادل دوائی چاہیے:`
                  : language === 'ps'
                  ? `✅ ستاسو د ${cropPsName} د دې بیمارۍ لپاره دا متبادله دوایي پکار ده:`
                  : `✅ Recommended Alternative for Your ${selectedCrop}:`}
              </div>

              <div className="p-5 rounded-[16px] bg-[#EBF5F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-[22px] font-bold text-[#17231F]">
                    {altMed?.brandName || 'Dithane M-45 (Mancozeb 75% WP)'}
                  </div>
                  <div className="text-[15px] font-semibold text-[#0F6B4B]">
                    {language === 'ur'
                      ? altMed?.dosageUr || altMed?.dosagePer15LTank
                      : language === 'ps'
                      ? altMed?.dosagePs || altMed?.dosagePer15LTank
                      : `${altMed?.dosagePer15LTank} • ${altMed?.dosagePerAcre}`}
                  </div>
                </div>

                {altMed?.brandName && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(altMed.brandName);
                      runBottleScan({ bottleHint: altMed.brandName });
                    }}
                    className="min-h-[48px] px-5 py-2.5 rounded-[14px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[14px] shrink-0 cursor-pointer"
                  >
                    {language === 'ur'
                      ? 'اس متبادل دوائی کا پورا طریقہ دیکھیں'
                      : language === 'ps'
                      ? 'د دې متبادلې دوایۍ پوره طریقه وګورئ'
                      : 'View Full Guide for Alternative'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* 2B. IF MATCHED (OR GENUINE IN GENERAL MODE) -> FULL EASY-TO-UNDERSTAND DETAILS IN URDU/PASHTO/ENGLISH */
            <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-5">
              {/* Target Crops Summary (especially helpful when farmer just wants to know what this bottle works on) */}
              <div className="p-4 rounded-[16px] bg-[#EBF5F0] space-y-2">
                <div className="text-[14px] font-bold text-[#0F6B4B]">
                  {language === 'ur'
                    ? '🌱 یہ دوائی کس کس فصل اور بیماری کے لیے ہے؟'
                    : language === 'ps'
                    ? '🌱 دا دوایي د کومو فصلونو او بیماریو لپاره ده؟'
                    : '🌱 Which Crops & Diseases Does This Medicine Treat?'}
                </div>
                <p className="text-[15px] text-[#17231F] leading-relaxed">{loc?.targetSummary}</p>
                {targetCropsLocalized.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {targetCropsLocalized.map((cropName: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-[10px] bg-white text-[#0F6B4B] font-bold text-[13px] shadow-2xs"
                      >
                        ✓ {cropName}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 4 Plain-Language Farmer Instruction Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. How to apply & exact dosage */}
                <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-2">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[#0F6B4B]">
                    <Droplets className="w-4 h-4 shrink-0" />
                    <span>
                      {language === 'ur'
                        ? '۱. کتنی مقدار میں اور کیسے دینی ہے؟'
                        : language === 'ps'
                        ? '۱. په کومه اندازه او څنګه یې ورکړئ؟'
                        : '1. How Much & How to Apply'}
                    </span>
                  </div>
                  <p className="text-[15px] text-[#17231F] leading-relaxed">{loc?.howToUse}</p>
                </div>

                {/* 2. When to spray (Weather & Timing) */}
                <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-2">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[#0F6B4B]">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>
                      {language === 'ur'
                        ? '۲. کب اسپرے کرنی ہے؟'
                        : language === 'ps'
                        ? '۲. کله سپرے کول پکار دي؟'
                        : '2. Best Time to Spray'}
                    </span>
                  </div>
                  <p className="text-[15px] text-[#17231F] leading-relaxed">{loc?.whenToSpray}</p>
                </div>

                {/* 3. When to recheck & repeat */}
                <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-2">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[#0F6B4B]">
                    <CalendarCheck className="w-4 h-4 shrink-0" />
                    <span>
                      {language === 'ur'
                        ? '۳. کب دوبارہ کھیت چیک کرنا ہے؟'
                        : language === 'ps'
                        ? '۳. بیا کله پټی کتل پکار دي؟'
                        : '3. When to Recheck & Repeat'}
                    </span>
                  </div>
                  <p className="text-[15px] text-[#17231F] leading-relaxed">{loc?.whenToRecheck}</p>
                </div>

                {/* 4. Safety & Harvest Wait */}
                <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-2">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[#0F6B4B]">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>
                      {language === 'ur'
                        ? '۴. ضروری احتیاط اور کٹائی کا وقفہ'
                        : language === 'ps'
                        ? '۴. ضروري احتیاط او د فصل شکولو وقفه'
                        : '4. Safety & Harvest Waiting Period'}
                    </span>
                  </div>
                  <p className="text-[15px] text-[#17231F] leading-relaxed">{loc?.safety}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
