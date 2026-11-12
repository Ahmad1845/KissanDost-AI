import React from 'react';
import { WifiOff } from 'lucide-react';
import { Language } from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  language: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ language }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 start-4 z-50 flex items-center gap-2 rounded-[14px] bg-[#D97706] px-3.5 py-2 text-[12px] font-semibold text-white shadow-lg">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        {language === 'ur'
          ? 'آف لائن موڈ — محفوظ ڈیٹا دکھایا جا رہا ہے'
          : language === 'ps'
          ? 'آفلاین حالت — خوندي معلومات ښودل کیږي'
          : 'Offline Mode — Cached data is being used'}
      </span>
    </div>
  );
};
