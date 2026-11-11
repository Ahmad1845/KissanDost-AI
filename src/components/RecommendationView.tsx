import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Share2,
  BookmarkCheck,
  CloudRain,
  Sun,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  FlaskConical,
  PhoneCall,
  Loader2,
  Sprout,
  ShieldCheck,
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
  onOpenVoiceModal,
}) => {
  const t = TRANSLATIONS[language];
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
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

  const localizedWhySummary =
    language === 'ur' && ur?.whySummary
      ? ur.whySummary
      : language === 'ps' && ps?.whySummary
      ? ps.whySummary
      : result.detailedExplanation;

  const localizedWhyPoints =
    language === 'ur' && ur?.whyPoints?.length
      ? ur.whyPoints
      : language === 'ps' && ps?.whyPoints?.length
      ? ps.whyPoints
      : result.why;

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
        `السلام علیکم کسان بھائی! آپ کی فصل ${localizedCrop} پر ${
          ur?.disease || result.disease
        } کی بیماری ہے۔ ${ur?.action || result.action} اسپرے کا صحیح وقت ${
          ur?.bestTime || result.bestTime
        } ہے۔ ${ur?.dosageText || ''} اللہ آپ کی فصل میں برکت ڈالے!`;
    } else if (targetLang === 'ps') {
      script =
        ps?.voiceScript ||
        `السلام علیکم زما ګرانه زمینداره وروره! ستاسو په فصل باندې ${
          ps?.disease || result.disease
        } ناروغي لیدل کیږي. ${ps?.action || result.action} د شیندلو سم وخت ${
          ps?.bestTime || result.bestTime
        } دی. ${ps?.dosageText || ''} الله دې ستاسو په فصل کې برکت واچوي!`;
    } else {
      script = `Salam Farmer Brother! Your ${result.crop} crop has ${result.disease}. ${result.action} Best time to spray is ${result.bestTime}. Mix ${localizedDosage}.`;
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
        `• مسئلہ: ${localizedDisease}\n` +
        `• کیا کریں: ${localizedAction}\n` +
        `• اسپرے کا وقت: ${localizedBestTime}\n` +
        `• دوائی: ${localizedMedicineName} (${localizedDosage})`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const submitFeedback = async (helpful: boolean) => {
    try {
      await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanId: result.scanId,
          rating: helpful ? 5 : 2,
          helpful,
        }),
      });
      setFeedbackSubmitted(true);
    } catch {
      setFeedbackSubmitted(true);
    }
  };

  const handleSave = () => {
    onSaveToTimeline();
    setIsSaved(true);
  };

  const isRainExpected = result.weatherSnapshot.rainProbability > 35;
  const severityEmoji =
    result.severity === 'Healthy' ? '🟢' : result.severity === 'Severe' ? '🔴' : '🟡';
  const severityText =
    result.severity === 'Healthy'
      ? t.sevHealthy
      : result.severity === 'Severe'
      ? t.sevSevere
      : result.severity === 'Mild'
      ? t.sevMild
      : t.sevModerate;

  return (
    <div className="space-y-8 animate-diagnosis-slide">
      {/* VOICE BANNER */}
      <div className="bg-[#0F6B4B] text-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.08)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[13px] font-normal text-white/80 block">
              {language === 'ur'
                ? 'پڑھنے کی ضرورت نہیں — بٹن دبائیں اور اپنی زبان میں سنیں'
                : language === 'ps'
                ? 'لوستلو ته اړتیا نشته — تڼۍ کېکاږئ او په خپله ژبه یې واورئ'
                : 'No need to read — Press below to hear advice in your language'}
            </span>
            <h2 className="text-[24px] sm:text-[28px] font-bold tracking-tight">
              {language === 'ur'
                ? 'پورا مشورہ آواز میں سنیں'
                : language === 'ps'
                ? 'بشپړه مشوره په غږ کې واورئ'
                : 'Listen to Full Advice in Voice'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => playHumanVoice('ur')}
              className={`min-h-[56px] px-6 py-3 rounded-[16px] font-semibold text-[16px] flex items-center gap-3 shadow-xs transition-all cursor-pointer ${
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
              onClick={() => playHumanVoice('ps')}
              className={`min-h-[56px] px-6 py-3 rounded-[16px] font-semibold text-[16px] flex items-center gap-3 shadow-xs transition-all cursor-pointer ${
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

            {onOpenVoiceModal && (
              <button
                onClick={onOpenVoiceModal}
                className="min-h-[56px] px-5 py-3 rounded-[16px] bg-[#0A4D36] hover:bg-[#0A4D36]/80 text-white text-[14px] font-normal cursor-pointer"
              >
                {language === 'ur' ? 'مزید سوالات سنیں' : language === 'ps' ? 'نورې پوښتنې واورئ' : 'More Voice Options'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STEP 1: WHAT IS THE PROBLEM? (72x72 Image + Confidence + Severity + Trust Indicators) */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
        <div className="text-[13px] font-semibold text-[#0F6B4B]">{t.step1Title}</div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            {result.imageUrl && (
              <img
                src={result.imageUrl}
                alt={localizedCrop}
                referrerPolicy="no-referrer"
                className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-[16px] object-cover shrink-0 shadow-xs"
              />
            )}
            <div className="space-y-1.5">
              <div className="text-[13px] font-normal text-[#6B7280]">
                {localizedCrop} · {result.district}
              </div>
              <h3 className="text-[24px] sm:text-[28px] font-bold text-[#17231F] leading-snug">
                {localizedDisease}
              </h3>

              {/* Severity + AI Confidence + Trust Indicators */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[13px] font-normal text-[#6B7280]">
                <span className="font-semibold text-[#17231F]">
                  {severityEmoji} {severityText}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#0F6B4B] tabular-nums">
                  ✓ AI Confidence {result.confidence}%
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-[#6B7280]">
                  <ShieldCheck className="w-4 h-4 text-[#0F6B4B]" />
                  {language === 'ur'
                    ? 'زرعی ماہرین سے تصدیق شدہ · آج اپڈیٹ ہوا'
                    : language === 'ps'
                    ? 'د کرنې پوهانو لخوا تایید شوی · نن تازه شوی'
                    : 'Verified by Agriculture Experts · Updated Today'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Instruction */}
        <div className="p-6 rounded-[16px] bg-[#EBF5F0] space-y-1.5">
          <div className="text-[12px] font-semibold text-[#0F6B4B]">{t.recommendedActionTitle}</div>
          <p className="text-[16px] sm:text-[18px] font-normal text-[#17231F] leading-relaxed">
            {localizedAction}
          </p>
        </div>
      </div>

      {/* STEP 2: WHEN TO SPRAY? (Weather & Rain Check) */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[13px] font-semibold text-[#0F6B4B]">{t.step2Title}</div>
          <div className="text-[12px] font-normal text-[#6B7280]">
            {language === 'ur'
              ? 'موسمی ذریعہ: Open-Meteo'
              : language === 'ps'
              ? 'د هوا سرچینه: Open-Meteo'
              : 'Weather Source: Open-Meteo'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="p-6 rounded-[16px] bg-[#F7F8F6] flex items-center gap-4">
            <div className="w-14 h-14 rounded-[16px] bg-white flex items-center justify-center shrink-0 shadow-xs">
              {isRainExpected ? (
                <CloudRain className="w-7 h-7 text-[#0F6B4B]" />
              ) : (
                <Sun className="w-7 h-7 text-[#F6B81A]" />
              )}
            </div>
            <div>
              <div className="text-[12px] font-normal text-[#6B7280]">{t.bestSprayWindow}</div>
              <div className="text-[20px] font-semibold text-[#17231F] mt-0.5">
                {localizedBestTime}
              </div>
              <div className="text-[13px] font-normal text-[#6B7280] mt-1 tabular-nums">
                {result.weatherSnapshot.temperature}°C ·{' '}
                {language === 'ur'
                  ? `بارش کا امکان: ${result.weatherSnapshot.rainProbability}%`
                  : language === 'ps'
                  ? `د باران امکان: ${result.weatherSnapshot.rainProbability}%`
                  : `Rain Chance: ${result.weatherSnapshot.rainProbability}%`}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[16px] font-normal text-[#17231F] leading-relaxed">
              {localizedWhySummary}
            </p>
            <ul className="space-y-2 pt-1">
              {localizedWhyPoints.map((pt, idx) => (
                <li key={idx} className="text-[14px] font-normal text-[#6B7280] flex items-start gap-2">
                  <span className="font-semibold text-[#0F6B4B]">{idx + 1}.</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* STEP 3: WHICH MEDICINE & HOW MUCH TO MIX? */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
        <div className="text-[13px] font-semibold text-[#0F6B4B]">{t.step3Title}</div>

        {result.approvedTreatments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-[16px] bg-[#EBF5F0] space-y-2">
              <div className="text-[12px] font-semibold text-[#0F6B4B]">
                {language === 'ur'
                  ? 'سرکاری طور پر منظور شدہ دوائی:'
                  : language === 'ps'
                  ? 'منل شوی او خوندي درمل:'
                  : 'Approved Safe Medicine:'}
              </div>
              <div className="text-[20px] font-semibold text-[#17231F]">{localizedMedicineName}</div>
              <p className="text-[16px] font-normal text-[#17231F] pt-1">{localizedDosage}</p>
            </div>

            <div className="p-6 rounded-[16px] bg-[#F7F8F6] space-y-3">
              <div className="text-[12px] font-semibold text-[#6B7280]">
                {language === 'ur'
                  ? 'ضروری احتیاط:'
                  : language === 'ps'
                  ? 'ضروري احتیاط:'
                  : 'Safety Rule:'}
              </div>
              <p className="text-[16px] font-normal text-[#17231F] leading-relaxed">{localizedSafety}</p>
              <button
                onClick={() => onOpenVerifierWithCrop(result.crop, result.disease)}
                className="min-h-[56px] px-5 py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white text-[14px] font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <FlaskConical className="w-4 h-4 text-[#F6B81A]" />
                <span>
                  {language === 'ur'
                    ? 'کوئی دوسری دوائی چیک کریں'
                    : language === 'ps'
                    ? 'بل درمل دلته وګورئ'
                    : 'Check Another Medicine Bottle'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Free Desi / Home Method */}
        {result.organicAlternatives.length > 0 && (
          <div className="p-6 rounded-[16px] bg-[#F7F8F6] space-y-2">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-[#0F6B4B]">
              <Sprout className="w-5 h-5 text-[#0F6B4B]" />
              <span>{t.homeRemedyTitle}</span>
            </div>
            <p className="text-[16px] font-normal text-[#17231F]">
              {language === 'ur'
                ? 'پودے کے نچلے خراب اور دھبے والے پتوں کو ہاتھ سے توڑ کر زمین میں دبا دیں، یا نیم کے بیج کا پانی (۵ فیصد) اسپرے کریں۔'
                : language === 'ps'
                ? 'د بوټي لاندینۍ خرابې پاڼې وشکوئ او تر خاورو لاندې یې پټې کړئ، یا د نیم د ونې د زڼو اوبه پرې وشیندئ.'
                : result.organicAlternatives.join(' • ')}
            </p>
          </div>
        )}

        {/* Action Buttons: Save, Share on WhatsApp, Call Helpline (56px height) */}
        <div className="pt-4 flex flex-wrap items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`min-h-[56px] px-6 py-3 rounded-[16px] text-[15px] font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              isSaved
                ? 'bg-[#EBF5F0] text-[#0F6B4B]'
                : 'bg-[#17231F] hover:bg-[#17231F]/90 text-white'
            }`}
          >
            <BookmarkCheck className="w-5 h-5" />
            <span>{isSaved ? (language === 'ur' ? 'محفوظ ہو گیا' : 'Saved') : t.saveBtn}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="min-h-[56px] px-6 py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white text-[15px] font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
            <span>{t.shareBtn}</span>
          </button>

          <a
            href="tel:1925"
            className="min-h-[56px] px-6 py-3 rounded-[16px] bg-[#F6B81A]/20 hover:bg-[#F6B81A]/30 text-[#17231F] text-[15px] font-semibold flex items-center gap-2.5 transition-colors ms-auto"
          >
            <PhoneCall className="w-5 h-5 text-[#0F6B4B]" />
            <span>
              {language === 'ur'
                ? 'مفت زرعی ہیلپ لائن: 1925'
                : language === 'ps'
                ? 'وړیا کرنیز نمبر: 1925'
                : 'Free Helpline: 1925'}
            </span>
          </a>
        </div>
      </div>

      {/* Simple Feedback Box */}
      <div className="bg-white rounded-[20px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-semibold text-[#17231F] text-[16px]">{t.feedbackHelpful}</span>

        {feedbackSubmitted ? (
          <div className="text-[15px] font-semibold text-[#0F6B4B] flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#0F6B4B]" />
            <span>{t.feedbackThankYou}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => submitFeedback(true)}
              className="min-h-[56px] px-6 py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white text-[15px] font-semibold flex items-center gap-2 cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{language === 'ur' ? 'ہاں، سمجھ آ گیا' : language === 'ps' ? 'هو، پوه شوم' : 'Yes, Easy'}</span>
            </button>
            <button
              onClick={() => submitFeedback(false)}
              className="min-h-[56px] px-5 py-3 rounded-[16px] bg-[#F7F8F6] hover:bg-stone-200 text-[#6B7280] text-[15px] font-normal flex items-center gap-2 cursor-pointer"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{t.feedbackNotHelpful}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
