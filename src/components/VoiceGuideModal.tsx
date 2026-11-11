import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  X,
  Loader2,
  UserCheck,
  CloudRain,
  FlaskConical,
  Sprout,
  Play,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Language, RecommendationResult, VoicePersona } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { VoiceAssistant } from '../utils/audioSpeech';

interface VoiceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  recommendation: RecommendationResult;
}

export const VoiceGuideModal: React.FC<VoiceGuideModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  recommendation,
}) => {
  const [voicePersona, setVoicePersona] = useState<VoicePersona>('elder');
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTopic, setActiveTopic] = useState<'full' | 'weather' | 'medicine' | 'desi'>('full');
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState<boolean>(false);

  const t = TRANSLATIONS[language];
  const isRtl = language === 'ur' || language === 'ps';

  useEffect(() => {
    if (!isOpen) {
      VoiceAssistant.stop();
      setIsPlaying(false);
      setIsLoadingAudio(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build concise 1-line summary for low-literacy farmers
  const getTopicSummary = (topic: 'full' | 'weather' | 'medicine' | 'desi', lang: Language): string => {
    const ur = recommendation.translations?.ur;
    const ps = recommendation.translations?.ps;
    const med = recommendation.approvedTreatments[0];

    if (lang === 'ps') {
      if (topic === 'weather') return ps?.bestTime || 'سبا سهار د ۷ نه تر ۱۰ بجو پورې سپرے وکړئ';
      if (topic === 'medicine') return ps?.medicineName || med?.name || 'مینکوزیب دوایي استعمال کړئ';
      if (topic === 'desi') return 'لاندې خرابې پاڼې وشکوئ او په خاوره کې یې ښخې کړئ';
      return `${ps?.disease || recommendation.disease} — ${ps?.bestTime || recommendation.bestTime}`;
    }

    if (lang === 'ur') {
      if (topic === 'weather') return ur?.bestTime || 'کل صبح ۷ سے ۱۰ بجے اسپرے کریں';
      if (topic === 'medicine') return ur?.medicineName || med?.name || 'مینکوزیب دوائی استعمال کریں';
      if (topic === 'desi') return 'خراب نچلے پتے توڑ کر زمین میں دبا دیں اور نیم کا پانی چھڑکیں';
      return `${ur?.disease || recommendation.disease} — ${ur?.bestTime || recommendation.bestTime}`;
    }

    if (topic === 'weather') return `Best Spray Time: ${recommendation.bestTime}`;
    if (topic === 'medicine') return `Recommended Medicine: ${med?.name || 'Mancozeb'}`;
    if (topic === 'desi') return 'Home Remedy: Remove lower spotted leaves & spray Neem water';
    return `${recommendation.disease} — ${recommendation.bestTime}`;
  };

  // Build authentic, natural conversational script in Urdu, everyday Mardan Pashto, or English
  const getSpokenScript = (topic: 'full' | 'weather' | 'medicine' | 'desi', lang: Language): string => {
    const ur = recommendation.translations?.ur;
    const ps = recommendation.translations?.ps;
    const med = recommendation.approvedTreatments[0];

    if (lang === 'ps') {
      if (topic === 'weather') {
        return `السلام علیکم زما خوږه زمینداره وروره! د موسم په باره کې زما خبره واورئ: ${
          ps?.bestTime || 'سبا سهار د اوو بجو نه تر لسو بجو پورې'
        } د سپرے کولو لپاره تر ټولو ښه وخت دی. ${
          ps?.whySummary || 'نن د باران امکان شته، نو نن سپرے مه کوئ ترڅو ستاسو دوایي او پیسې ضایع نشي.'
        }`;
      }
      if (topic === 'medicine') {
        return `السلام علیکم زمینداره وروره! د دې بیمارۍ لپاره تر ټولو ښه او منظور شوې دوایي ${
          ps?.medicineName || med?.name || 'مینکوزیب'
        } ده. د دې طریقه دا ده: ${
          ps?.dosageText || 'د یو ایکړ لپاره شپږ سوه ګرامه دوایي په سلو لیټرو اوبو کې مکس کړئ او سپرے وکړئ'
        }. او دا احتیاط ضرور کوئ: ${
          ps?.safetyText || 'د سپرے کولو په وخت خپله خوله او پوزه په صافه کپړه وتړئ.'
        }`;
      }
      if (topic === 'desi') {
        return `السلام علیکم زمینداره وروره! که تاسو غواړئ بې له پیسو دیسي او کلیواله طریقه وکړئ، نو د بوټي لاندې خرابې او داغدارې پاڼې وشکوئ او له پټي بهر یې په خاوره کې ښخې کړئ. او د بکانړې یا نیم د ونې د پاڼو اوبه پر بوټو سپرے کړئ.`;
      }
      return (
        ps?.voiceScript ||
        `السلام علیکم زما خوږه زمینداره وروره! ما ستاسو د فصل پاڼه په غور سره وکتله. په دې باندې ${
          ps?.disease || recommendation.disease
        } بیماري لګېدلې ده. ${ps?.action || recommendation.action} ${
          ps?.dosageText || ''
        } الله پاک دې ستاسو په فصل کې ډېر برکت واچوي!`
      );
    }

    if (lang === 'ur') {
      if (topic === 'weather') {
        return `کسان بھائی! موسم کے بارے میں خاص بات سن لیں: اسپرے کا سب سے بہترین وقت ${
          ur?.bestTime || 'کل صبح سات سے دس بجے'
        } ہے۔ ${
          ur?.whySummary || 'آج بارش کا امکان ہے اس لیے آج اسپرے نہ کریں ورنہ دوائی دھل جائے گی اور پیسے ضائع ہوں گے۔'
        }`;
      }
      if (topic === 'medicine') {
        return `کسان بھائی! اس بیماری کے لیے منظور شدہ اور اصلی دوائی ${
          ur?.medicineName || med?.name || 'مینکوزیب'
        } ہے۔ اس کی مقدار یہ ہے: ${
          ur?.dosageText || 'ایک ایکڑ کے لیے چھ سو سے آٹھ سو گرام دوائی سو لیٹر پانی میں ملا کر اسپرے کریں'
        }۔ اور احتیاط یاد رکھیں: ${
          ur?.safetyText || 'اسپرے کرتے وقت منہ اور ناک پر کپڑا باندھیں اور پھل توڑنے سے سات دن پہلے اسپرے بند کر دیں۔'
        }`;
      }
      if (topic === 'desi') {
        return `کسان بھائی! اگر آپ بغیر پیسوں کے دیسی علاج کرنا چاہتے ہیں تو پودے کے نچلے خراب اور دھبے والے پتوں کو ہاتھ سے توڑ کر زمین میں دبا دیں، اور نیم کے پتوں یا نمولی کا پانی ابال کر ٹھنڈا کر کے اسپرے کریں۔`;
      }
      return (
        ur?.voiceScript ||
        `السلام علیکم کسان بھائی! میں نے آپ کی فصل کا پتہ غور سے دیکھ لیا ہے۔ آپ کی فصل پر ${
          ur?.disease || recommendation.disease
        } کی علامات ہیں۔ ${ur?.action || recommendation.action} ${
          ur?.dosageText || ''
        } اللہ آپ کی فصل میں خوب برکت ڈالے!`
      );
    }

    // English
    if (topic === 'weather') {
      return `Dear Farmer Brother! Best time to spray is ${recommendation.bestTime}. ${recommendation.weatherSnapshot.weatherAdvice}`;
    }
    if (topic === 'medicine') {
      return `Use ${med?.name || 'Mancozeb'}. Mix ${med?.dosage || '600 grams in 100 litres of water per acre'}. Safety rule: ${med?.ppe || 'Cover your mouth and nose while spraying'}.`;
    }
    if (topic === 'desi') {
      return `For a free home method: pluck and bury the spotted bottom leaves in soil away from water channels, and spray 5 percent Neem seed water extract.`;
    }
    return `Salam Farmer Brother! Your ${recommendation.crop} leaf shows ${recommendation.disease}. ${recommendation.action} Best time to spray is ${recommendation.bestTime}. ${recommendation.detailedExplanation}`;
  };

  const handlePlayTopic = (topic: 'full' | 'weather' | 'medicine' | 'desi', targetLang: Language = language) => {
    setActiveTopic(topic);
    const scriptText = getSpokenScript(topic, targetLang);

    VoiceAssistant.speak(
      scriptText,
      targetLang,
      () => setIsPlaying(true),
      () => setIsPlaying(false),
      () => setIsPlaying(false),
      voicePersona,
      (loading) => setIsLoadingAudio(loading)
    );
  };

  const handleStop = () => {
    VoiceAssistant.stop();
    setIsPlaying(false);
    setIsLoadingAudio(false);
  };

  const currentSummary = getTopicSummary(activeTopic, language);
  const currentScriptText = getSpokenScript(activeTopic, language);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#17231F]/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[92dvh] sm:max-h-[88dvh] bg-white rounded-t-[24px] sm:rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden animate-card-fade"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Top Header with Always-Visible Close Button */}
        <div className="shrink-0 px-6 py-4 bg-[#0A4D36] text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[14px] bg-[#F6B81A] text-[#17231F] flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h2 className="text-[20px] font-bold text-white truncate">
                {t.voiceModalTitle}
              </h2>
              <p className="text-[12px] font-normal text-white/75 truncate">
                {language === 'ur'
                  ? 'اصلی پاکستانی اردو اور پشتو لہجے میں'
                  : language === 'ps'
                  ? 'په سوچه پښتو او اردو کلیوالي لهجه کې'
                  : 'Natural Pakistani Urdu & Pashto Accent'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 min-h-[44px] px-4 py-2 rounded-[16px] bg-white/15 hover:bg-[#E53935] text-white font-semibold text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label="Close voice modal"
          >
            <X className="w-5 h-5" />
            <span>
              {language === 'ur' ? 'بند کریں' : language === 'ps' ? 'بند کړئ' : 'Close'}
            </span>
          </button>
        </div>

        {/* Scrollable Content Body — 8-point spacing (24px) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F7F8F6]">
          {/* Step 1: Language Switcher — Solid Green Active Fill */}
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-[#6B7280]">{t.voiceChooseLang}</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { code: 'ur' as Language, label: 'اردو' },
                { code: 'ps' as Language, label: 'پښتو' },
                { code: 'en' as Language, label: 'English' },
              ].map((langOpt) => {
                const isSelected = language === langOpt.code;
                return (
                  <button
                    key={langOpt.code}
                    type="button"
                    onClick={() => {
                      onLanguageChange(langOpt.code);
                      handlePlayTopic(activeTopic, langOpt.code);
                    }}
                    className={`min-h-[56px] rounded-[16px] font-semibold text-[16px] flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F6B4B] text-white shadow-[0_6px_16px_rgba(15,107,75,0.22)]'
                        : 'bg-white text-[#17231F] shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-[#EBF5F0]'
                    }`}
                  >
                    <span>{langOpt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Speaker Persona Selection */}
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-[#6B7280]">{t.voiceChooseSpeaker}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVoicePersona('elder')}
                className={`min-h-[56px] px-4 py-3 rounded-[16px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  voicePersona === 'elder'
                    ? 'bg-[#0F6B4B] text-white shadow-[0_6px_16px_rgba(15,107,75,0.2)]'
                    : 'bg-white text-[#17231F] shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-[#EBF5F0]'
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>{t.speakerElder}</span>
              </button>

              <button
                type="button"
                onClick={() => setVoicePersona('female')}
                className={`min-h-[56px] px-4 py-3 rounded-[16px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  voicePersona === 'female'
                    ? 'bg-[#0F6B4B] text-white shadow-[0_6px_16px_rgba(15,107,75,0.2)]'
                    : 'bg-white text-[#17231F] shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-[#EBF5F0]'
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>{t.speakerFemale}</span>
              </button>
            </div>
          </div>

          {/* Step 3: 4 Topic Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                key: 'full' as const,
                icon: Volume2,
                ur: 'پورا مشورہ',
                ps: 'پوره مشوره',
                en: 'Full Advice',
              },
              {
                key: 'weather' as const,
                icon: CloudRain,
                ur: 'اسپرے کا وقت',
                ps: 'د سپرے وخت',
                en: 'Spray Time',
              },
              {
                key: 'medicine' as const,
                icon: FlaskConical,
                ur: 'کونسی دوائی؟',
                ps: 'کومه دوایي؟',
                en: 'Medicine',
              },
              {
                key: 'desi' as const,
                icon: Sprout,
                ur: 'دیسی علاج',
                ps: 'دیسي طریقه',
                en: 'Home Remedy',
              },
            ].map((topicItem) => {
              const IconComp = topicItem.icon;
              const isSelected = activeTopic === topicItem.key;
              return (
                <button
                  key={topicItem.key}
                  type="button"
                  onClick={() => handlePlayTopic(topicItem.key)}
                  className={`min-h-[64px] p-3 rounded-[16px] text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F6B4B] text-white font-semibold shadow-[0_6px_16px_rgba(15,107,75,0.22)]'
                      : 'bg-white text-[#17231F] font-normal shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-[#EBF5F0]'
                  }`}
                >
                  <IconComp className={`w-5 h-5 ${isSelected ? 'text-[#F6B81A]' : 'text-[#0F6B4B]'}`} />
                  <span className="text-[13px]">
                    {language === 'ur' ? topicItem.ur : language === 'ps' ? topicItem.ps : topicItem.en}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Voice Summary + Play + Collapsible Transcript Flow: Summary ↓ Play ↓ Expand Transcript */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-5">
            {/* 1. Concise Summary & Waveform */}
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[12px] font-normal text-[#6B7280] block">
                  {isLoadingAudio
                    ? t.preparingVoiceText
                    : isPlaying
                    ? t.playingAudioText
                    : language === 'ur'
                    ? 'خلاصہ'
                    : language === 'ps'
                    ? 'لنډیز'
                    : 'Summary'}
                </span>
                <p className="text-[18px] font-semibold text-[#17231F] mt-1 leading-snug">
                  {currentSummary}
                </p>
              </div>

              {/* Voice Waveform Micro-Interaction */}
              <div className="flex items-center gap-1.5 h-10 px-3 rounded-[14px] bg-[#EBF5F0] shrink-0">
                <span
                  className={`w-1.5 bg-[#0F6B4B] rounded-full ${
                    isPlaying ? 'h-6 animate-wave-1' : 'h-2.5'
                  }`}
                />
                <span
                  className={`w-1.5 bg-[#0F6B4B] rounded-full ${
                    isPlaying ? 'h-8 animate-wave-2' : 'h-4'
                  }`}
                />
                <span
                  className={`w-1.5 bg-[#0F6B4B] rounded-full ${
                    isPlaying ? 'h-5 animate-wave-3' : 'h-3'
                  }`}
                />
                <span
                  className={`w-1.5 bg-[#0F6B4B] rounded-full ${
                    isPlaying ? 'h-7 animate-wave-4' : 'h-2'
                  }`}
                />
              </div>
            </div>

            {/* 2. Prominent 56px Play / Stop Action */}
            {isPlaying || isLoadingAudio ? (
              <button
                type="button"
                onClick={handleStop}
                className="w-full min-h-[56px] py-3.5 rounded-[16px] bg-[#E53935] hover:bg-red-700 text-white font-bold text-[18px] flex items-center justify-center gap-3 shadow-[0_8px_24px_rgba(229,57,53,0.24)] transition-all cursor-pointer"
              >
                {isLoadingAudio ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>{t.preparingVoiceText}</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-6 h-6" />
                    <span>{t.stopVoice}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handlePlayTopic(activeTopic)}
                className="w-full min-h-[56px] py-3.5 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-bold text-[18px] flex items-center justify-center gap-3 shadow-[0_8px_24px_rgba(15,107,75,0.22)] transition-all cursor-pointer"
              >
                <Play className="w-6 h-6 fill-current text-[#F6B81A]" />
                <span>{t.playAdviceBtn}</span>
              </button>
            )}

            {/* 3. Collapsible Transcript Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsTranscriptExpanded((prev) => !prev)}
                className="w-full min-h-[44px] px-4 py-2 rounded-[14px] bg-[#F7F8F6] hover:bg-[#EBF5F0] text-[#6B7280] hover:text-[#0F6B4B] text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>
                  {isTranscriptExpanded
                    ? language === 'ur'
                      ? 'تحریر چھپائیں'
                      : language === 'ps'
                      ? 'لیکنه پټه کړئ'
                      : 'Hide Transcript'
                    : language === 'ur'
                    ? 'مکمل تحریر دیکھیں ▼'
                    : language === 'ps'
                    ? 'بشپړه لیکنه وګورئ ▼'
                    : 'Expand Transcript ▼'}
                </span>
                {isTranscriptExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {isTranscriptExpanded && (
                <div className="mt-3 p-4 rounded-[16px] bg-[#F7F8F6] text-[16px] font-normal text-[#17231F] leading-relaxed animate-card-fade">
                  {currentScriptText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
