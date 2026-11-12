// KissanDost AI — Minimalist Farmer Recommendation & Local Language Voice View
import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Share2,
  BookmarkCheck,
  CloudRain,
  Sun,
  FlaskConical,
  Loader2,
  CheckCircle2,
  Sprout,
} from 'lucide-react';
import { Language, RecommendationResult } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { VoiceAssistant } from '../utils/audioSpeech';

interface RecommendationViewProps {
  result: RecommendationResult;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onSaveToTimeline: () => void;
  onOpenVerifierWithCrop: (crop: string, disease: string) => void;
  onOpenVoiceModal?: () => void;
}

export const RecommendationView: React.FC<RecommendationViewProps> = ({
  result,
  language,
  onLanguageChange,
  onSaveToTimeline,
  onOpenVerifierWithCrop,
}) => {
  const t = TRANSLATIONS[language];
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const ur = result.translations?.ur;
  const ps = result.translations?.ps;

  const localizedCrop =
    language === 'ur' && ur?.cropName
      ? ur.cropName
      : language === 'ps' && ps?.cropName
      ? ps.cropName
      : result.crop;

  const localizedDisease =
    language === 'ur' && ur?.disease
      ? ur.disease
      : language === 'ps' && ps?.disease
      ? ps.disease
      : result.disease;

  const localizedAction =
    language === 'ur' && ur?.action
      ? ur.action
      : language === 'ps' && ps?.action
      ? ps.action
      : result.action;

  const localizedBestTime =
    language === 'ur' && ur?.bestTime
      ? ur.bestTime
      : language === 'ps' && ps?.bestTime
      ? ps.bestTime
      : result.bestTime;

  const med = result.approvedTreatments[0];
  const localizedMedicineName =
    language === 'ur' && ur?.medicineName
      ? ur.medicineName
      : language === 'ps' && ps?.medicineName
      ? ps.medicineName
      : med?.name || 'Mancozeb 75% WP';

  const localizedDosage =
    language === 'ur' && ur?.dosageText
      ? ur.dosageText
      : language === 'ps' && ps?.dosageText
      ? ps.dosageText
      : med?.dosage || '600g - 800g in 100 litres of water for 1 Acre';

  const localizedSafety =
    language === 'ur' && ur?.safetyText
      ? ur.safetyText
      : language === 'ps' && ps?.safetyText
      ? ps.safetyText
      : `${med?.ppe || 'Cover mouth with cloth'}. ${med?.withholding || 'Wait 7 days before harvest'}.`;

  const playHumanVoice = (targetLang: Language = language) => {
    if (isSpeaking || isLoadingVoice) {
      VoiceAssistant.stop();
      setIsSpeaking(false);
      setIsLoadingVoice(false);
      return;
    }

    if (onLanguageChange && targetLang !== language) {
      onLanguageChange(targetLang);
    }

    let script = '';
    if (targetLang === 'ur') {
      script =
        ur?.voiceScript ||
        `السلام علیکم میرے پیارے کسان بھائی! میں نے آپ کی ${localizedCrop} کی فصل کو بڑے غور سے دیکھا ہے۔ اس پر ${
          ur?.disease || result.disease
        } کے آثار نظر آ رہے ہیں، لیکن گھبرانے کی بالکل بات نہیں ہے۔ ${ur?.action || result.action} اسپرے کا بہترین وقت ${
          ur?.bestTime || result.bestTime
        } ہے، اور دوائی کی مقدار یہ ہے: ${
          ur?.dosageText || localizedDosage
        }۔ اسپرے کرتے وقت منہ اور ناک پر صاف کپڑا ضرور باندھیں۔ اللہ آپ کی محنت قبول فرمائے اور فصل میں خوب برکت ڈالے!`;
    } else if (targetLang === 'ps') {
      script =
        ps?.voiceScript ||
        `السلام علیکم زما خوږه زمینداره وروره! ما ستاسو د ${localizedCrop} پاڼه په مینه او غور سره وکتله. په دې باندې ${
          ps?.disease || result.disease
        } بیماري ښکاري، خو هیڅ مه پرېشانه کېږئ، وختي علاج به یې زر مخه ونیسي. ${
          ps?.action || result.action
        } د سپرے تر ټولو ښه وخت ${ps?.bestTime || result.bestTime} دی، او اندازه یې دا ده: ${
          ps?.dosageText || localizedDosage
        }. د سپرے پر مهال خوله او پوزه په کپړه وتړئ. الله پاک دې ستاسو په فصل کې ډېر برکت واچوي!`;
    } else {
      script = `Assalamu Alaikum, dear farmer brother! I have carefully checked your ${result.crop} leaf, and it shows signs of ${result.disease}. Please don't worry at all—catching it early makes treatment very simple. ${result.action} The best time to spray is ${result.bestTime}, mixing ${localizedDosage}. Remember to cover your mouth and nose with a clean cloth while spraying, and check back on the leaves in a few days. Wishing you a healthy and blessed harvest!`;
    }

    VoiceAssistant.speak(
      script,
      targetLang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false),
      'elder',
      (loading) => setIsLoadingVoice(loading)
    );
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🌾 *کسان دوست مشورہ (KissanDost)*\n` +
        `• فصل: ${localizedCrop}\n` +
        `• بیماری: ${localizedDisease}\n` +
        `• کیا کریں: ${localizedAction}\n` +
        `• اسپرے کا وقت: ${localizedBestTime}\n` +
        `• دوائی: ${localizedMedicineName} (${localizedDosage})`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSave = () => {
    onSaveToTimeline();
    setIsSaved(true);
  };

  const isRainExpected = result.weatherSnapshot.rainProbability >= 50;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-diagnosis-slide">
      {/* 1. LOCAL LANGUAGE VOICE OUTPUT (Primary Farmer Action) */}
      <div className="bg-[#0F6B4B] text-white rounded-[20px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[13px] text-white/85 block">
            {language === 'ur'
              ? 'پڑھنے کی ضرورت نہیں — اپنی زبان میں مشورہ سنیں'
              : language === 'ps'
              ? 'لوستلو ته اړتیا نشته — په خپله ژبه مشوره واورئ'
              : 'Listen to the advice in your language'}
          </span>
          <h2 className="text-[22px] font-bold">
            {language === 'ur'
              ? 'آواز میں مشورہ سنیں'
              : language === 'ps'
              ? 'په غږ کې مشوره واورئ'
              : 'Voice Advice'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => playHumanVoice('ur')}
            className={`min-h-[52px] px-5 py-3 rounded-[14px] font-bold text-[15px] flex items-center gap-2.5 transition-all cursor-pointer ${
              isSpeaking && language === 'ur'
                ? 'bg-[#E53935] text-white'
                : 'bg-[#F6B81A] hover:bg-[#F6B81A]/90 text-[#17231F]'
            }`}
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
            onClick={() => playHumanVoice('ps')}
            className={`min-h-[52px] px-5 py-3 rounded-[14px] font-bold text-[15px] flex items-center gap-2.5 transition-all cursor-pointer ${
              isSpeaking && language === 'ps'
                ? 'bg-[#E53935] text-white'
                : 'bg-white hover:bg-white/90 text-[#17231F]'
            }`}
          >
            {isLoadingVoice && language === 'ps' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSpeaking && language === 'ps' ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5 text-[#0F6B4B]" />
            )}
            <span>{isSpeaking && language === 'ps' ? 'غږ بند کړئ' : 'په پښتو واورئ'}</span>
          </button>
        </div>
      </div>

      {/* 2. DISEASE NAME & CLEAR ACTION STEPS */}
      <div className="bg-white rounded-[20px] p-6 sm:p-7 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
        {/* Disease Name Header */}
        <div className="flex items-center gap-4">
          {result.imageUrl ? (
            <img
              src={result.imageUrl}
              alt={localizedCrop}
              referrerPolicy="no-referrer"
              className="w-[72px] h-[72px] rounded-[16px] object-cover shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-[16px] bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center shrink-0">
              <Sprout className="w-8 h-8" />
            </div>
          )}
          <div className="space-y-1 min-w-0">
            <div className="text-[13px] font-semibold text-[#0F6B4B]">
              {localizedCrop} · {result.district}
            </div>
            <h3 className="text-[22px] sm:text-[26px] font-bold text-[#17231F] leading-snug">
              {localizedDisease}
            </h3>
          </div>
        </div>

        {/* Clear Action Step 1: What to do right now */}
        <div className="p-5 rounded-[16px] bg-[#EBF5F0] space-y-1.5">
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#0F6B4B]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t.recommendedActionTitle}</span>
          </div>
          <p className="text-[16px] sm:text-[18px] font-medium text-[#17231F] leading-relaxed">
            {localizedAction}
          </p>
        </div>

        {/* Clear Action Step 2: Medicine & Dosage */}
        {result.approvedTreatments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-1.5">
              <div className="text-[12px] font-bold text-[#0F6B4B]">
                {language === 'ur'
                  ? 'تجویز کردہ دوائی اور مقدار:'
                  : language === 'ps'
                  ? 'تجویز شوې دوایي او اندازه:'
                  : 'Medicine & Dosage:'}
              </div>
              <div className="text-[18px] font-bold text-[#17231F]">{localizedMedicineName}</div>
              <p className="text-[15px] text-[#17231F] leading-relaxed">{localizedDosage}</p>
            </div>

            {/* Best Time to Spray */}
            <div className="p-5 rounded-[16px] bg-[#F7F8F6] flex items-center gap-4">
              <div className="w-12 h-12 rounded-[14px] bg-white flex items-center justify-center shrink-0 shadow-xs">
                {isRainExpected ? (
                  <CloudRain className="w-6 h-6 text-[#0F6B4B]" />
                ) : (
                  <Sun className="w-6 h-6 text-[#F6B81A]" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-[12px] font-bold text-[#6B7280]">{t.bestSprayWindow}</div>
                <div className="text-[17px] font-bold text-[#17231F]">{localizedBestTime}</div>
                <div className="text-[13px] text-[#6B7280]">{localizedSafety}</div>
              </div>
            </div>
          </div>
        )}

        {/* Simple Footer Actions */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenVerifierWithCrop(result.crop, result.disease)}
            className="min-h-[48px] px-5 py-2.5 rounded-[14px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white text-[14px] font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <FlaskConical className="w-4 h-4 text-[#F6B81A]" />
            <span>
              {language === 'ur'
                ? 'دوائی کی بوتل اسکین کریں'
                : language === 'ps'
                ? 'د دوایۍ بوتل سکین کړئ'
                : 'Scan Medicine Bottle'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaved}
            className={`min-h-[48px] px-5 py-2.5 rounded-[14px] text-[14px] font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              isSaved
                ? 'bg-[#EBF5F0] text-[#0F6B4B]'
                : 'bg-[#F7F8F6] hover:bg-stone-200 text-[#17231F]'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>{isSaved ? (language === 'ur' ? 'محفوظ ہو گیا' : 'Saved') : t.saveBtn}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="min-h-[48px] px-5 py-2.5 rounded-[14px] bg-[#F7F8F6] hover:bg-stone-200 text-[#17231F] text-[14px] font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#0F6B4B]" />
            <span>{t.shareBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
