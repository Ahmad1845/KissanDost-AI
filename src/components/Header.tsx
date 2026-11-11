// KissanDost AI — Top Navigation & Language Switcher
import React from 'react';
import { Sprout, Volume2, PhoneCall, ShieldAlert } from 'lucide-react';
import { Language, UserRole, Farm } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeFarm: Farm | null;
  nearbyAlertCount: number;
  onOpenAlerts: () => void;
  onOpenVoiceGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  role,
  onRoleChange,
  nearbyAlertCount,
  onOpenAlerts,
  onOpenVoiceGuide,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-30 bg-[#0A4D36] text-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* 1. Brand Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[14px] bg-[#F6B81A] flex items-center justify-center text-[#17231F] shrink-0">
            <Sprout className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h1 className="text-[20px] font-bold tracking-tight text-white leading-tight truncate">
            {t.appName}
          </h1>
        </div>

        {/* 2. Language Switcher (Urdu & Pashto First) */}
        <div
          className="flex items-center bg-[#0F6B4B] p-1 rounded-[16px] shrink-0"
          role="group"
          aria-label="Select Language"
        >
          <button
            type="button"
            onClick={() => onLanguageChange('ur')}
            className={`min-h-[40px] px-4 py-1.5 rounded-[12px] text-[14px] transition-all cursor-pointer ${
              language === 'ur'
                ? 'bg-[#F6B81A] text-[#17231F] font-semibold shadow-xs'
                : 'text-white/85 hover:text-white font-normal'
            }`}
          >
            اردو
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('ps')}
            className={`min-h-[40px] px-4 py-1.5 rounded-[12px] text-[14px] transition-all cursor-pointer ${
              language === 'ps'
                ? 'bg-[#F6B81A] text-[#17231F] font-semibold shadow-xs'
                : 'text-white/85 hover:text-white font-normal'
            }`}
          >
            پښتو
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`min-h-[40px] px-3 py-1.5 rounded-[12px] text-[13px] transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-[#F6B81A] text-[#17231F] font-semibold shadow-xs'
                : 'text-white/85 hover:text-white font-normal'
            }`}
          >
            EN
          </button>
        </div>

        {/* 3. Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenVoiceGuide}
            className="min-h-[44px] px-4 py-2 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0F6B4B]/80 text-white font-semibold text-[13px] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#F6B81A] shrink-0" />
            <span className="hidden md:inline">{t.voiceGuideBtn}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAlerts}
            className="relative min-h-[44px] min-w-[44px] px-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0F6B4B]/80 text-[#F6B81A] flex items-center justify-center transition-colors cursor-pointer"
            aria-label={t.nearbyAlertsTitle}
          >
            <ShieldAlert className="w-5 h-5" />
            {nearbyAlertCount > 0 && (
              <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-[#E53935] text-white text-[10px] font-semibold flex items-center justify-center">
                {nearbyAlertCount}
              </span>
            )}
          </button>

          <a
            href="tel:1925"
            className="hidden sm:flex min-h-[44px] px-3.5 py-2 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0F6B4B]/80 text-white items-center gap-1.5 text-[13px] font-medium transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-[#F6B81A]" />
            <span>1925</span>
          </a>

          <button
            type="button"
            onClick={() => onRoleChange(role === 'farmer' ? 'officer' : 'farmer')}
            className="min-h-[44px] px-3 py-2 rounded-[16px] text-white/80 hover:text-white hover:bg-[#0F6B4B] text-[13px] font-normal transition-colors cursor-pointer"
          >
            {role === 'officer'
              ? language === 'ur'
                ? 'کسان ویو'
                : language === 'ps'
                ? 'بزګر بڼه'
                : 'Farmer'
              : language === 'ur'
              ? 'افسر'
              : language === 'ps'
              ? 'افسر'
              : 'Officer'}
          </button>
        </div>
      </div>
    </header>
  );
};
