import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Loader2,
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { VoiceAssistant } from '../utils/audioSpeech';

interface PesticideVerifierProps {
  language: Language;
  presetCrop?: string;
  presetDisease?: string;
}

export const PesticideVerifier: React.FC<PesticideVerifierProps> = ({
  language,
  presetCrop = 'Tomato',
  presetDisease = 'Early Blight',
}) => {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verifiedResult, setVerifiedResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState<boolean>(false);

  const quickSearches = [
    {
      labelUr: 'مینکوزیب (ڈائیتھین ایم-۴۵)',
      labelPs: 'مینکوزیب (ډایتین ایم-۴۵)',
      labelEn: 'Mancozeb (Dithane M-45)',
      query: 'Mancozeb',
      safe: true,
    },
    {
      labelUr: 'ٹلٹ ۲۵۰ (گندم کی کنگی)',
      labelPs: 'ټیلټ ۲۵۰ (د غنمو زنګ)',
      labelEn: 'Tilt 250 EC (Wheat Rust)',
      query: 'Tilt',
      safe: true,
    },
    {
      labelUr: 'اسکور ۲۵۰ (پتوں کے دھبے)',
      labelPs: 'سکور ۲۵۰ (د پاڼو داغونه)',
      labelEn: 'Score 250 EC',
      query: 'Score',
      safe: true,
    },
    {
      labelUr: 'پیراکوئٹ (گھاس جلانے والا زہر)',
      labelPs: 'پیراکوټ (د واښو سوځولو زهر)',
      labelEn: 'Paraquat (Weed Poison)',
      query: 'Paraquat',
      safe: false,
    },
    {
      labelUr: 'کراٹے (کیڑے مار دوائی)',
      labelPs: 'کراټې (د چینجي دوایي)',
      labelEn: 'Karate (Insect Spray)',
      query: 'Lambda-cyhalothrin',
      safe: false,
    },
  ];

  const handleVerify = async (queryToVerify?: string) => {
    const q = queryToVerify || searchQuery;
    if (!q.trim()) return;

    VoiceAssistant.stop();
    setIsSpeaking(false);
    setIsLoading(true);
    try {
      const resp = await fetch('/api/v1/medicine/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          detectedCrop: presetCrop,
          detectedDisease: presetDisease,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setVerifiedResult(data.product);
      }
    } catch (err) {
      console.error('Pesticide verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Prefer backend-computed localized medicine guidance; fallback to local helper if needed
  const getLocalizedMedicineDetails = (product: any) => {
    if (product?.localized?.[language]) {
      return product.localized[language];
    }
    const isBanned = product.status === 'Restricted / Banned';
    const isNotRec = product.status === 'Not Recommended';
    return {
      statusTitle: isBanned
        ? t.warningRestricted
        : isNotRec
        ? 'Not For Leaf Disease (Saves Your Money)'
        : 'Safe & Approved Medicine',
      reason: product.reason,
      dosage: product.dosage,
      safety: product.safetyAdvice,
      voiceScript: `${product.tradeName}. Status: ${product.status}. ${product.reason} Dosage: ${product.dosage}. ${product.safetyAdvice}`,
    };
  };

  const playVerificationVoice = () => {
    if (!verifiedResult) return;
    if (isSpeaking || isLoadingVoice) {
      VoiceAssistant.stop();
      setIsSpeaking(false);
      setIsLoadingVoice(false);
      return;
    }

    const details = getLocalizedMedicineDetails(verifiedResult);
    VoiceAssistant.speak(
      details.voiceScript,
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false),
      'elder',
      (loading) => setIsLoadingVoice(loading)
    );
  };

  const localizedDetails = verifiedResult ? getLocalizedMedicineDetails(verifiedResult) : null;

  return (
    <div className="space-y-6 animate-card-fade">
      {/* Main Medicine Checker Card — Search ↓ Medicine Chips ↓ Result */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold text-[#17231F] leading-tight">{t.verifierTitle}</h2>
            <p className="text-[16px] font-normal text-[#6B7280] mt-1">{t.verifierSubtitle}</p>
          </div>
        </div>

        {/* 1. Search Input FIRST (14px input radius, 56px height) */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#6B7280] absolute start-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder={t.searchPesticidePlaceholder}
              className="w-full min-h-[56px] ps-12 pe-4 py-3 bg-[#F7F8F6] rounded-[14px] text-[16px] font-normal text-[#17231F] placeholder:text-[#6B7280] focus:bg-white focus:ring-2 focus:ring-[#0F6B4B] focus:outline-hidden transition-all"
            />
          </div>
          <button
            onClick={() => handleVerify()}
            disabled={isLoading || !searchQuery.trim()}
            className="min-h-[56px] px-8 py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[16px] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#F7F8F6] disabled:text-[#6B7280] disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{t.verifyBottleBtn}</span>
          </button>
        </div>

        {/* 2. Medicine Chips SECOND */}
        <div className="space-y-3">
          <label className="block text-[13px] font-semibold text-[#6B7280]">
            {language === 'ur'
              ? 'مشہور دوائیاں — کسی ایک پر ہاتھ لگائیں:'
              : language === 'ps'
              ? 'مشهور درمل — پر یوه تڼۍ ګوته کېږدئ:'
              : 'Or tap a common medicine chip below:'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickSearches.map((item, i) => {
              const isSelected = searchQuery.toLowerCase() === item.query.toLowerCase();
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSearchQuery(item.query);
                    handleVerify(item.query);
                  }}
                  className={`min-h-[56px] px-4 py-3 rounded-[16px] text-start transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F6B4B] text-white font-semibold shadow-[0_6px_16px_rgba(15,107,75,0.2)]'
                      : 'bg-[#F7F8F6] hover:bg-[#EBF5F0] text-[#17231F] font-normal'
                  }`}
                >
                  <span className="text-[15px] truncate">
                    {language === 'ur' ? item.labelUr : language === 'ps' ? item.labelPs : item.labelEn}
                  </span>
                  {item.safe ? (
                    <CheckCircle2
                      className={`w-5 h-5 shrink-0 ${isSelected ? 'text-[#F6B81A]' : 'text-[#0F6B4B]'}`}
                    />
                  ) : (
                    <AlertTriangle
                      className={`w-5 h-5 shrink-0 ${isSelected ? 'text-[#F6B81A]' : 'text-[#E53935]'}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Result Card THIRD */}
      {verifiedResult && localizedDetails && (
        <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6 animate-diagnosis-slide">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {verifiedResult.status === 'Suitable' ? (
                <div className="w-14 h-14 rounded-[16px] bg-[#0F6B4B] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : verifiedResult.status === 'Restricted / Banned' ? (
                <div className="w-14 h-14 rounded-[16px] bg-[#E53935] text-white flex items-center justify-center shrink-0">
                  <XCircle className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-[16px] bg-[#F6B81A] text-[#17231F] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              )}

              <div>
                <span className="text-[12px] font-semibold text-[#6B7280] block">
                  ✓ Verified by KP Agriculture Registry
                </span>
                <h3 className="text-[22px] sm:text-[26px] font-bold text-[#17231F] mt-0.5 leading-snug">
                  {localizedDetails.statusTitle}
                </h3>
                <p className="text-[15px] font-normal text-[#6B7280] mt-1">
                  {verifiedResult.tradeName}
                </p>
              </div>
            </div>

            {/* Listen in Voice Button (56px) */}
            <button
              onClick={playVerificationVoice}
              className="min-h-[56px] px-6 py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[16px] flex items-center gap-2.5 self-start md:self-center cursor-pointer transition-colors"
            >
              {isLoadingVoice ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSpeaking ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5 text-[#F6B81A]" />
              )}
              <span>
                {isSpeaking
                  ? t.stopVoice
                  : language === 'ur'
                  ? 'آواز میں سنیں'
                  : language === 'ps'
                  ? 'په غږ واورئ'
                  : 'Listen in Voice'}
              </span>
            </button>
          </div>

          <div
            className={`p-5 rounded-[16px] text-[16px] font-normal text-[#17231F] leading-relaxed ${
              verifiedResult.status === 'Suitable'
                ? 'bg-[#EBF5F0]'
                : verifiedResult.status === 'Restricted / Banned'
                ? 'bg-[#FEF2F2]'
                : 'bg-[#FFFBEB]'
            }`}
          >
            {localizedDetails.reason}
          </div>

          {verifiedResult.status !== 'Restricted / Banned' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-1">
                <span className="text-[13px] font-normal text-[#6B7280] block">{t.dosageLabel}</span>
                <p className="text-[18px] font-semibold text-[#17231F]">{localizedDetails.dosage}</p>
              </div>

              <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-1">
                <span className="text-[13px] font-normal text-[#6B7280] block">{t.safetyAdviceLabel}</span>
                <p className="text-[16px] font-normal text-[#17231F]">{localizedDetails.safety}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
