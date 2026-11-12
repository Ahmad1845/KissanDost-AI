// KissanDost AI — Compact Single-Row Top App Bar
import React from 'react';
import { Sprout, Volume2, PhoneCall, ShieldAlert } from 'lucide-react';
import { Language, Farm } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeFarm: Farm | null;
  nearbyAlertCount: number;
  onOpenAlerts: () => void;
  onOpenVoiceGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  nearbyAlertCount,
  onOpenAlerts,
  onOpenVoiceGuide,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-30 bg-[#0A4D36]/95 backdrop-blur-md text-white border-b border-white/10 shadow-[0_2px_14px_rgba(0,0,0,0.08)]">
      <div className="max-w-5xl mx-auto h-14 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
          <div className="w-8 h-8 rounded-[10px] bg-[#F6B81A] flex items-center justify-center text-[#17231F] shrink-0 shadow-xs">
            <Sprout className="w-4 h-4 stroke-[2.3]" />
          </div>
          <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-white leading-none whitespace-nowrap">
            {t.appName}
          </h1>
        </div>

        {/* Zone 2: Compact Single-Line Language Switcher */}
        <div
          className="flex items-center bg-[#073A28] p-0.5 rounded-[12px] border border-white/10 shrink-0"
          role="group"
          aria-label="Select Language"
        >
          <button
            type="button"
            onClick={() => onLanguageChange('ur')}
            className={`h-8 px-2.5 sm:px-3.5 rounded-[10px] text-[12px] sm:text-[13px] leading-none transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center ${
              language === 'ur'
                ? 'bg-[#F6B81A] text-[#17231F] font-bold shadow-xs'
                : 'text-white/85 hover:text-white font-medium'
            }`}
          >
            اردو
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('ps')}
            className={`h-8 px-2.5 sm:px-3.5 rounded-[10px] text-[12px] sm:text-[13px] leading-none transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center ${
              language === 'ps'
                ? 'bg-[#F6B81A] text-[#17231F] font-bold shadow-xs'
                : 'text-white/85 hover:text-white font-medium'
            }`}
          >
            پښتو
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`h-8 px-2 sm:px-3 rounded-[10px] text-[11px] sm:text-[12px] leading-none transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center ${
              language === 'en'
                ? 'bg-[#F6B81A] text-[#17231F] font-bold shadow-xs'
                : 'text-white/85 hover:text-white font-semibold'
            }`}
          >
            EN
          </button>
        </div>

        {/* Zone 3: Compact Single-Row Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenVoiceGuide}
            aria-label={t.voiceGuideBtn}
            className="min-w-[40px] h-10 px-2.5 sm:px-3.5 rounded-[12px] bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-[12px] sm:text-[13px] flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Volume2 className="w-4 h-4 text-[#F6B81A] shrink-0" />
            <span className="hidden md:inline">{t.voiceGuideBtn}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAlerts}
            aria-label={t.nearbyAlertsTitle}
            className="relative min-w-[40px] h-10 px-2.5 rounded-[12px] bg-white/10 hover:bg-white/15 border border-white/10 text-[#F6B81A] flex items-center justify-center transition-colors duration-150 cursor-pointer shrink-0"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {nearbyAlertCount > 0 && (
              <span className="absolute -top-1 -end-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E53935] text-white text-[10px] font-bold tabular-nums flex items-center justify-center shadow-xs">
                {nearbyAlertCount}
              </span>
            )}
          </button>

          <a
            href="tel:1925"
            className="hidden lg:inline-flex h-10 px-3 rounded-[12px] bg-white/10 hover:bg-white/15 border border-white/10 text-white/95 items-center gap-1.5 text-[13px] font-medium tabular-nums transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#F6B81A] shrink-0" />
            <span>1925</span>
          </a>
        </div>
      </div>
    </header>
  );
};
