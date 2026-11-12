import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { Language } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  language: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const label =
    language === 'ur'
      ? 'ایپ انسٹال کریں'
      : language === 'ps'
      ? 'ایپ انسټال کړئ'
      : 'Install App';

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        aria-label={label}
        title={label}
        className="min-w-[40px] h-10 px-2.5 sm:px-3 rounded-[12px] bg-[#F6B81A] hover:bg-[#F6B81A]/90 text-[#17231F] font-bold text-[12px] sm:text-[13px] flex items-center justify-center gap-1.5 shadow-xs transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
      >
        <Download className="w-4 h-4 shrink-0 stroke-[2.3]" />
        <span className="hidden md:inline">{label}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          aria-label={label}
          title={label}
          className="min-w-[40px] h-10 px-2.5 sm:px-3 rounded-[12px] bg-[#F6B81A] hover:bg-[#F6B81A]/90 text-[#17231F] font-bold text-[12px] sm:text-[13px] flex items-center justify-center gap-1.5 shadow-xs transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4 shrink-0 stroke-[2.3]" />
          <span className="hidden md:inline">{label}</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#17231F]/60 backdrop-blur-xs p-0 sm:p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-t-[24px] sm:rounded-[24px] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] text-[#17231F] space-y-4 animate-card-fade"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[18px] font-bold text-[#17231F]">
                  {language === 'ur'
                    ? 'آئی فون / آئی پیڈ پر انسٹال کریں'
                    : language === 'ps'
                    ? 'په آی فون / آی پیډ انسټال کړئ'
                    : 'Install on iPhone / iPad'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-[14px] text-[#374151]">
                <div className="p-3.5 rounded-[14px] bg-[#F7F8F6] flex items-center gap-3">
                  <Share className="w-5 h-5 text-[#0F6B4B] shrink-0" />
                  <span>
                    {language === 'ur'
                      ? '۱. نیچے Safari بار میں Share بٹن دبائیں۔'
                      : language === 'ps'
                      ? '۱. لاندې په Safari کې د Share بټن کېکاږئ.'
                      : '1. Tap the Share button in Safari.'}
                  </span>
                </div>
                <div className="p-3.5 rounded-[14px] bg-[#F7F8F6] flex items-center gap-3">
                  <PlusSquare className="w-5 h-5 text-[#0F6B4B] shrink-0" />
                  <span>
                    {language === 'ur'
                      ? '۲. نیچے جا کر "Add to Home Screen" منتخب کریں۔'
                      : language === 'ps'
                      ? '۲. لاندې لاړ شئ او "Add to Home Screen" وټاکئ.'
                      : '2. Scroll down and tap "Add to Home Screen".'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[46px] rounded-[14px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[15px] cursor-pointer"
              >
                {language === 'ur' ? 'سمجھ گیا' : language === 'ps' ? 'سمه ده' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
