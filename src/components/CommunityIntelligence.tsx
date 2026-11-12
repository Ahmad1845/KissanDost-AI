// KissanDost AI — KP District Disease Outbreak Surveillance
import React, { useState, useEffect } from 'react';
import {
  Radio,
  AlertTriangle,
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { KP_DISTRICTS_SURVEILLANCE, DistrictStat } from '../data/knowledgeBase';
import { VoiceAssistant } from '../utils/audioSpeech';

interface CommunityIntelligenceProps {
  language: Language;
}

export const CommunityIntelligence: React.FC<CommunityIntelligenceProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [data, setData] = useState<{
    summary: any;
    districts: DistrictStat[];
    recentAnonymousFeed: any[];
  } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Mardan');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/v1/community/outbreaks')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json);
      })
      .catch((err) => console.warn('Failed to fetch community outbreaks:', err));
  }, []);

  const activeDistrictInfo: any =
    data?.districts.find((d) => d.district === selectedDistrict) || KP_DISTRICTS_SURVEILLANCE[0];

  const getDistrictLocalizedName = (dist: string) => {
    const found: any = data?.districts.find((d) => d.district === dist);
    if (found?.localizedName?.[language]) {
      return found.localizedName[language];
    }
    const mapUr: Record<string, string> = {
      Mardan: 'مردان',
      Swabi: 'صوابی',
      Charsadda: 'چارسدہ',
      Peshawar: 'پشاور',
      Nowshera: 'نوشہرہ',
      Malakand: 'ملاکنڈ',
    };
    const mapPs: Record<string, string> = {
      Mardan: 'مردان',
      Swabi: 'صوابۍ',
      Charsadda: 'چارسده',
      Peshawar: 'پېښور',
      Nowshera: 'نوښار',
      Malakand: 'ملاکنډ',
    };
    if (language === 'ur') return mapUr[dist] || dist;
    if (language === 'ps') return mapPs[dist] || dist;
    return dist;
  };

  const getVillageAlertText = (dist: any) => {
    if (dist?.localizedAlertText?.[language]) {
      return dist.localizedAlertText[language];
    }
    const localDist = getDistrictLocalizedName(dist.district);
    if (language === 'ur') {
      return `السلام علیکم میرے پیارے کسان بھائی! ضلع ${localDist} میں ${dist.activeOutbreaks} کھیتوں سے ${dist.primaryCrop} کی خبر موصول ہوئی ہے۔ گھبرانے کی بات نہیں، بس احتیاط کے طور پر صبح کے وقت اپنے پودوں کے نچلے پتے چیک کر لیں اور کھیت کو صاف رکھیں۔ اللہ آپ کی فصل میں برکت ڈالے!`;
    }
    if (language === 'ps') {
      return `السلام علیکم زما خوږه زمینداره وروره! په ضلع ${localDist} کې په ${dist.activeOutbreaks} پټیو کې د فصل خبرتیا راغلې ده. مه پرېشانه کېږئ، بس سهار خپل بوټي او لاندې پاڼې په غور وګورئ او پټی صاف ساتئ. الله دې ستاسو په فصل کې برکت واچوي!`;
    }
    return `Assalam-o-Alaikum, dear farmer brother! In ${dist.district} district, ${dist.activeOutbreaks} nearby farms reported ${dist.primaryDisease} on ${dist.primaryCrop}. Take a friendly walk through your field this morning to inspect your lower leaves, and avoid spraying during rain or strong wind.`;
  };

  const handlePlayAlertVoice = () => {
    if (isSpeaking || isLoadingVoice) {
      VoiceAssistant.stop();
      setIsSpeaking(false);
      setIsLoadingVoice(false);
      return;
    }

    const text = getVillageAlertText(activeDistrictInfo);
    VoiceAssistant.speak(
      text,
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false),
      'elder',
      (loading) => setIsLoadingVoice(loading)
    );
  };

  return (
    <div className="space-y-6 animate-card-fade">
      {/* Header + Voice Button */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center shrink-0">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[28px] font-bold text-[#17231F] leading-tight">{t.communityTitle}</h2>
              <p className="text-[16px] font-normal text-[#6B7280] mt-1">{t.communitySubtitle}</p>
            </div>
          </div>

          <button
            onClick={handlePlayAlertVoice}
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
                ? 'گاؤں کی خبر آواز میں سنیں'
                : language === 'ps'
                ? 'د کلي خبر په غږ واورئ'
                : 'Listen to Village News'}
            </span>
          </button>
        </div>

        {/* District Selection Buttons — Solid Green Fill when Selected */}
        <div className="space-y-3">
          <label className="block text-[13px] font-semibold text-[#6B7280]">{t.districtSurveillance}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {(data?.districts || KP_DISTRICTS_SURVEILLANCE).map((d) => {
              const isSelected = selectedDistrict === d.district;
              return (
                <button
                  key={d.district}
                  onClick={() => {
                    VoiceAssistant.stop();
                    setIsSpeaking(false);
                    setSelectedDistrict(d.district);
                  }}
                  className={`min-h-[64px] p-3 rounded-[16px] text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F6B4B] text-white font-semibold shadow-[0_6px_16px_rgba(15,107,75,0.22)]'
                      : 'bg-[#F7F8F6] hover:bg-[#EBF5F0] text-[#17231F] font-normal'
                  }`}
                >
                  <span className="text-[16px] font-semibold">{getDistrictLocalizedName(d.district)}</span>
                  <span className={`text-[12px] tabular-nums ${isSelected ? 'text-white/80' : 'text-[#6B7280]'}`}>
                    {d.activeOutbreaks}{' '}
                    {language === 'ur' ? 'کھیت' : language === 'ps' ? 'پټي' : 'farms'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected District Alert Card */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {activeDistrictInfo.riskLevel === 'High Risk' ? (
              <div className="w-12 h-12 rounded-[16px] bg-[#FEF2F2] text-[#E53935] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
            ) : activeDistrictInfo.riskLevel === 'Watch' ? (
              <div className="w-12 h-12 rounded-[16px] bg-[#FFFBEB] text-[#F6B81A] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-[16px] bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <span className="text-[12px] font-normal text-[#6B7280] block">
                ✓ Updated Today • KP Community Surveillance
              </span>
              <h3 className="text-[22px] font-bold text-[#17231F]">
                {getDistrictLocalizedName(activeDistrictInfo.district)} —{' '}
                {activeDistrictInfo.riskLevel === 'High Risk'
                  ? language === 'ur'
                    ? '🔴 زیادہ احتیاط کریں'
                    : language === 'ps'
                    ? '🔴 زیات پام کوئ'
                    : '🔴 High Alert'
                  : activeDistrictInfo.riskLevel === 'Watch'
                  ? language === 'ur'
                    ? '🟡 نگرانی رکھیں'
                    : language === 'ps'
                    ? '🟡 پام ساتئ'
                    : '🟡 Watch Closely'
                  : language === 'ur'
                  ? '🟢 فصل محفوظ ہے'
                  : language === 'ps'
                  ? '🟢 فصل خوندي دی'
                  : '🟢 Normal & Safe'}
              </h3>
            </div>
          </div>
        </div>

        <p className="text-[16px] font-normal text-[#17231F] leading-relaxed bg-[#F7F8F6] p-5 rounded-[16px]">
          {getVillageAlertText(activeDistrictInfo)}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-1">
            <span className="text-[13px] font-normal text-[#6B7280] block">
              {language === 'ur' ? 'متاثرہ کھیت' : language === 'ps' ? 'زیانمن پټي' : 'Farms Affected'}
            </span>
            <span className="text-[20px] font-semibold text-[#17231F] tabular-nums">
              {activeDistrictInfo.activeOutbreaks}{' '}
              {language === 'ur' ? 'کھیت' : language === 'ps' ? 'پټي' : 'Farms'}
            </span>
          </div>

          <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-1">
            <span className="text-[13px] font-normal text-[#6B7280] block">
              {language === 'ur' ? 'کونسی فصل؟' : language === 'ps' ? 'کوم فصل؟' : 'Main Crop'}
            </span>
            <span className="text-[20px] font-semibold text-[#17231F]">{activeDistrictInfo.primaryCrop}</span>
          </div>

          <div className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-1">
            <span className="text-[13px] font-normal text-[#6B7280] block">
              {language === 'ur' ? 'بیماری کا نام' : language === 'ps' ? 'د ناروغۍ نوم' : 'Main Problem'}
            </span>
            <span className="text-[20px] font-semibold text-[#17231F]">{activeDistrictInfo.primaryDisease}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
