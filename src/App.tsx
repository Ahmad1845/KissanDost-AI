import React, { useState, useEffect } from 'react';
import {
  Camera,
  Home,
  Sprout,
  Radio,
  FlaskConical,
  AlertTriangle,
  ArrowRight,
  CloudSun,
  Volume2,
  Loader2,
  Bell,
  X,
  ChevronDown,
  Clock,
  Trash2,
} from 'lucide-react';
import { Language, Farm, TimelineEvent, RecommendationResult, WeatherSnapshot } from './types';
import { TRANSLATIONS } from './data/translations';
import { Header } from './components/Header';
import { CropScanModal } from './components/CropScanModal';
import { RecommendationView } from './components/RecommendationView';
import { FarmManager } from './components/FarmManager';
import { PesticideVerifier } from './components/PesticideVerifier';
import { CommunityIntelligence } from './components/CommunityIntelligence';
import { VoiceGuideModal } from './components/VoiceGuideModal';
import { VoiceAssistant } from './utils/audioSpeech';

const DEFAULT_FARMS: Farm[] = [
  {
    id: 'farm-01',
    name: 'ٹماٹر کا کھیت - مردان (Tomato Farm)',
    district: 'Mardan',
    village: 'Gujar Garhi',
    cropType: 'Tomato',
    areaAcres: 4,
    plantingDate: '2026-08-20',
    createdAt: '2026-08-20T00:00:00Z',
  },
  {
    id: 'farm-02',
    name: 'مکئی کا کھیت - صوابی (Maize Field)',
    district: 'Swabi',
    village: 'Topi',
    cropType: 'Maize',
    areaAcres: 3.5,
    plantingDate: '2026-07-15',
    createdAt: '2026-07-15T00:00:00Z',
  },
  {
    id: 'farm-03',
    name: 'گندم کا کھیت - چارسدہ (Wheat Field)',
    district: 'Charsadda',
    village: 'Sardaryab',
    cropType: 'Wheat',
    areaAcres: 5,
    plantingDate: '2026-10-10',
    createdAt: '2026-10-10T00:00:00Z',
  },
];

const RECENT_SCANS_STORAGE_KEY = 'kissandost_recent_scans';

const DEFAULT_WEATHER: WeatherSnapshot = {
  district: 'Mardan',
  temperature: 17,
  humidity: 72,
  windSpeed: 5,
  precipitation: 0,
  rainProbability: 15,
  condition: 'Partly cloudy',
  spraySuitability: 'Favorable',
  weatherAdvice: 'Partly cloudy (17°C, humidity 72%, wind 5 km/h). Favorable window to spray.',
};

function loadStoredScans(): RecommendationResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SCANS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const INITIAL_TIMELINE: TimelineEvent[] = [
  {
    id: 'time-01',
    farmId: 'farm-01',
    dayLabel: 'Day 1',
    title: 'Leaf Spot Found',
    date: 'Oct 12, 2026',
    status: 'detected',
    description: 'Brown rings found on lower tomato leaves. Advised waiting for rain to stop.',
    crop: 'Tomato',
    disease: 'Early Blight',
    severity: 'Moderate',
  },
  {
    id: 'time-02',
    farmId: 'farm-01',
    dayLabel: 'Day 4',
    title: 'Morning Spray Done',
    date: 'Oct 15, 2026',
    status: 'treated',
    description: 'Sprayed Mancozeb 75 WP at 8:00 AM in calm weather.',
    crop: 'Tomato',
    pesticideUsed: 'Mancozeb 75 WP (Dithane M-45)',
  },
  {
    id: 'time-03',
    farmId: 'farm-01',
    dayLabel: 'Day 8',
    title: 'Plant Recovering Well',
    date: 'Oct 19, 2026',
    status: 'recovering',
    description: 'Spots dried up and stopped spreading to upper leaves.',
    crop: 'Tomato',
    severity: 'Mild',
  },
  {
    id: 'time-04',
    farmId: 'farm-01',
    dayLabel: 'Day 20',
    title: 'Healthy Crop Restored',
    date: 'Oct 31, 2026',
    status: 'healthy',
    description: 'Fresh green leaves and healthy red tomatoes growing.',
    crop: 'Tomato',
    severity: 'Healthy',
  },
];

export default function App() {
  const [language, setLanguage] = useState<Language>('ur');
  const [activeTab, setActiveTab] = useState<'home' | 'scan' | 'decision' | 'farms' | 'verify' | 'community'>('home');
  const [farms, setFarms] = useState<Farm[]>(DEFAULT_FARMS);
  const [activeFarmId, setActiveFarmId] = useState<string>('farm-01');
  const [currentRecommendation, setCurrentRecommendation] = useState<RecommendationResult | null>(null);
  const [scanHistory, setScanHistory] = useState<RecommendationResult[]>(() => loadStoredScans());
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState<boolean>(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [isHeroVoiceExpanded, setIsHeroVoiceExpanded] = useState<boolean>(false);
  const [verifyResetKey, setVerifyResetKey] = useState<number>(0);

  const [homePlayingLang, setHomePlayingLang] = useState<Language | null>(null);
  const [homeLoadingLang, setHomeLoadingLang] = useState<Language | null>(null);

  const [verifierCrop, setVerifierCrop] = useState<string>('Tomato');
  const [verifierDisease, setVerifierDisease] = useState<string>('Early Blight');
  const [liveWeather, setLiveWeather] = useState<WeatherSnapshot>(DEFAULT_WEATHER);

  const t = TRANSLATIONS[language];
  const isRtl = language === 'ur' || language === 'ps';

  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0];

  // Persist real user scans in localStorage (skip on reload so no fake default disease ever sticks)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const trimmed = scanHistory.slice(0, 10);
    try {
      window.localStorage.setItem(RECENT_SCANS_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      try {
        const lightweight = trimmed.map((item) => ({ ...item, imageUrl: '' }));
        window.localStorage.setItem(RECENT_SCANS_STORAGE_KEY, JSON.stringify(lightweight));
      } catch {
        // Ignore storage quota errors cleanly
      }
    }
  }, [scanHistory]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/v1/weather?district=${encodeURIComponent(activeFarm.district)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.weather) {
          setLiveWeather(data.weather);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activeFarm.district]);

  const handleQuickHomeListen = (targetLang: Language) => {
    if (homePlayingLang === targetLang || homeLoadingLang === targetLang) {
      VoiceAssistant.stop();
      setHomePlayingLang(null);
      setHomeLoadingLang(null);
      return;
    }

    setLanguage(targetLang);

    let script = '';
    if (currentRecommendation) {
      const ur = currentRecommendation.translations?.ur;
      const ps = currentRecommendation.translations?.ps;
      script =
        targetLang === 'ur'
          ? ur?.voiceScript || `${ur?.disease || currentRecommendation.disease}۔ ${ur?.action || currentRecommendation.action}`
          : targetLang === 'ps'
          ? ps?.voiceScript || `${ps?.disease || currentRecommendation.disease}۔ ${ps?.action || currentRecommendation.action}`
          : `Assalamu Alaikum, dear farmer brother! Welcome back—I am speaking as your Kissan Dost. Your ${currentRecommendation.crop} crop is showing signs of ${currentRecommendation.disease}, so there is no need to worry at all when we treat it in time. ${currentRecommendation.action} Take your time spraying calmly in the morning, cover your nose and mouth with a clean cloth, and check the leaves again in a few days. May your hard work bring a rich, healthy harvest!`;
    } else {
      const district = liveWeather.district || activeFarm.district || 'Mardan';
      const rainHigh = (liveWeather.rainProbability || 0) >= 50;
      if (targetLang === 'ur') {
        script = rainHigh
          ? `السلام علیکم میرے پیارے کسان بھائی! خوش آمدید، میں آپ کا کسان دوست بول رہا ہوں۔ اس وقت ${district} میں بارش کا امکان ہے، اس لیے آج اسپرے نہ کریں تاکہ آپ کی دوائی ضائع نہ ہو۔ جب بھی کسی پودے کے پتے پر داغ یا پیلاہٹ نظر آئے تو اوپر کیمرے والے بٹن سے پتے کی تصویر کھینچیں، میں فوراً آپ کو صحیح علاج بتا دوں گا۔ اللہ آپ کی محنت میں برکت ڈالے!`
          : `السلام علیکم میرے پیارے کسان بھائی! خوش آمدید، میں آپ کا کسان دوست بول رہا ہوں۔ اس وقت ${district} میں موسم بالکل صاف اور ہوا ہلکی ہے، صبح سات سے دس بجے اسپرے کے لیے بہت اچھا وقت ہے۔ اگر آپ کسی پودے کا پتہ چیک کروانا چاہتے ہیں تو اوپر پتے کی تصویر کھینچیں والے بٹن پر کلک کریں، میں آپ کو پورا مشورہ اور دوائی کی مقدار سناؤں گا۔ اللہ آپ کی فصل میں خوب برکت ڈالے!`;
      } else if (targetLang === 'ps') {
        script = rainHigh
          ? `السلام علیکم زما خوږه زمینداره وروره! ستاسو کسان دوست خبرې کوي، پخیر راغلئ. اوس په ${district} کې د باران امکان شته، نو مهرباني وکړئ نن سپرے مه کوئ ترڅو ستاسو دوایي او پیسې ضایع نشي. کله چې په پاڼو کومه نښه ووینئ نو د کیمرې بټن کېکاږئ او تصویر واخلئ، زه به تاسو ته پوره علاج دروښیم. الله مو په فصل کې برکت واچوي!`
          : `السلام علیکم زما خوږه زمینداره وروره! ستاسو کسان دوست خبرې کوي، پخیر راغلئ. اوس په ${district} کې موسم صاف او هوا ارامه ده، سهار د اوو نه تر لسو بجو د سپرے لپاره ډېر ښه وخت دی. که غواړئ د خپل فصل پاڼه وګورئ نو پورته د پاڼې تصویر واخلئ بټن کېکاږئ، زه به درته سمدلاسه مشوره درکړم. الله پاک مو روزي زیاته کړي!`;
      } else {
        script = rainHigh
          ? `Assalamu Alaikum, dear farmer brother! Welcome back—I am your Kissan Dost. There is a chance of rain in ${district} today, so hold off on spraying for now so your medicine stays effective. Whenever you want to check a plant, tap Scan Plant Leaf above and I will give you clear guidance. Wishing you a healthy harvest!`
          : `Assalamu Alaikum, dear farmer brother! Welcome back—I am your Kissan Dost. Weather in ${district} is calm and favorable right now, with an ideal morning spray window between 7 and 10 AM. Tap Scan Plant Leaf anytime to check a leaf and hear full treatment advice. Wishing you a rich, healthy harvest!`;
      }
    }

    setHomeLoadingLang(targetLang);
    VoiceAssistant.speak(
      script,
      targetLang,
      () => {
        setHomeLoadingLang(null);
        setHomePlayingLang(targetLang);
      },
      () => {
        setHomePlayingLang(null);
        setHomeLoadingLang(null);
      },
      () => {
        setHomePlayingLang(null);
        setHomeLoadingLang(null);
      },
      'elder',
      (loading: boolean) => {
        setHomeLoadingLang(loading ? targetLang : null);
      }
    );
  };

  const handleAnalysisComplete = (result: RecommendationResult) => {
    setCurrentRecommendation(result);
    setVerifierCrop(result.crop);
    setVerifierDisease(result.disease);
    setScanHistory((prev) => [result, ...prev.filter((s) => s.scanId !== result.scanId)].slice(0, 10));
    setActiveTab('decision');

    const newEvent: TimelineEvent = {
      id: `time-${Date.now()}`,
      farmId: activeFarmId,
      dayLabel: `Day ${timelineEvents.length + 1}`,
      title: `${result.disease}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: result.severity === 'Healthy' ? 'healthy' : 'detected',
      description: result.action,
      crop: result.crop,
      disease: result.disease,
      severity: result.severity,
    };
    setTimelineEvents((prev) => [newEvent, ...prev]);
  };

  const handleAddFarm = (farmData: Omit<Farm, 'id' | 'createdAt'>) => {
    const newFarm: Farm = {
      ...farmData,
      id: `farm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFarms((prev) => [...prev, newFarm]);
    setActiveFarmId(newFarm.id);
  };

  const openMedicineChecker = (crop?: string, disease?: string) => {
    if (crop) setVerifierCrop(crop);
    else if (currentRecommendation?.crop) setVerifierCrop(currentRecommendation.crop);
    else if (activeFarm?.cropType) setVerifierCrop(activeFarm.cropType);

    if (disease) setVerifierDisease(disease);
    else if (currentRecommendation?.disease) setVerifierDisease(currentRecommendation.disease);

    setVerifyResetKey((k) => k + 1);
    setActiveTab('verify');
  };

  const handleOpenVerifierWithCrop = (crop: string, disease: string) => {
    openMedicineChecker(crop, disease);
  };

  const handleSelectRecentScan = (scan: RecommendationResult) => {
    setCurrentRecommendation(scan);
    setVerifierCrop(scan.crop);
    setVerifierDisease(scan.disease);
    setActiveTab('decision');
  };

  const handleClearRecentScans = () => {
    setScanHistory([]);
    setCurrentRecommendation(null);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(RECENT_SCANS_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
  };

  const districtLabel = liveWeather.district || activeFarm.district || 'Mardan';
  const isRainRisk = (liveWeather.rainProbability || 0) >= 40;

  const notifications = [
    {
      id: 'outbreak-mardan-01',
      type: 'danger' as const,
      targetTab: 'community' as const,
      title:
        language === 'ur'
          ? 'مردان: ٹماٹر کا جھلساؤ'
          : language === 'ps'
          ? 'مردان: د ټماټرو د پاڼو ناروغي'
          : 'Mardan: Tomato Leaf Blight',
      meta:
        language === 'ur'
          ? 'گجر گڑھی اور تورو · ابھی · زیادہ خطرہ'
          : language === 'ps'
          ? 'ګجر ګړهي او تورو · اوس · لوړ خطر'
          : 'Gujar Garhi & Toru · Just now · High Risk',
      body:
        language === 'ur'
          ? '28 کھیتوں میں بیماری ملی ہے۔ آج اپنے پودوں کے نچلے پتے چیک کریں۔'
          : language === 'ps'
          ? 'په ۲۸ پټیو کې ناروغي لیدل شوې ده. نن خپل بوټي ضرور وګورئ.'
          : 'Reported across 28 nearby fields. Inspect your lower leaves today.',
    },
    {
      id: 'weather-spray-02',
      type: 'weather' as const,
      targetTab: 'home' as const,
      title:
        language === 'ur'
          ? `${districtLabel}: اسپرے اور موسم کی اطلاع`
          : language === 'ps'
          ? `${districtLabel}: د سپرے او موسم خبرتیا`
          : `${districtLabel}: Weather & Spray Window`,
      meta:
        language === 'ur'
          ? `آج · ${liveWeather.temperature}°C · بارش ${liveWeather.rainProbability}%`
          : language === 'ps'
          ? `نن · ${liveWeather.temperature}°C · باران ${liveWeather.rainProbability}%`
          : `Today · ${liveWeather.temperature}°C · ${liveWeather.rainProbability}% rain`,
      body:
        language === 'ur'
          ? isRainRisk
            ? 'آج بارش کا امکان ہے — اسپرے کل صبح تک مؤخر کریں تاکہ دوائی ضائع نہ ہو۔'
            : 'آج موسم صاف اور ہوا ہلکی ہے — صبح 7 سے 10 بجے اسپرے کے لیے بہترین وقت ہے۔'
          : language === 'ps'
          ? isRainRisk
            ? 'نن د باران امکان شته — سپرے تر سبا سهاره وځنډوئ ترڅو دوایي ضایع نشي.'
            : 'نن موسم صاف او هوا ارامه ده — سهار د ۷ نه تر ۱۰ بجو سپرے ډېر ښه دی.'
          : isRainRisk
          ? 'Rain chance ahead — hold spraying until tomorrow morning to avoid washout.'
          : 'Clear skies and calm wind — ideal spray window from 7:00 AM to 10:00 AM.',
    },
  ];

  const unreadAlertCount = notifications.filter((n) => !readNotificationIds.includes(n.id)).length;

  const markNotificationRead = (id: string) => {
    setReadNotificationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markAllNotificationsRead = () => {
    setReadNotificationIds(notifications.map((n) => n.id));
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F7F8F6] text-[#17231F] flex flex-col font-sans"
    >
      {/* Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        activeFarm={activeFarm}
        nearbyAlertCount={unreadAlertCount}
        onOpenAlerts={() => setAlertsModalOpen(true)}
        onOpenVoiceGuide={() => setIsVoiceModalOpen(true)}
      />

      {/* Main Container — 8-Point Spacing System (24px / 32px / 40px) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-10">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-card-fade">
            {/* 1. FOCUSED HERO: Greeting ↓ ONE BIG CAMERA BUTTON ↓ Collapsible Voice ↓ Compact Weather */}
            <section className="bg-[#0F6B4B] text-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.08)] space-y-6">
              {/* Compact Greeting */}
              <div className="space-y-1">
                <h2 className="text-[20px] sm:text-[24px] font-semibold text-white">
                  {t.greeting}
                </h2>
                <p className="text-[13px] sm:text-[14px] font-normal text-white/80">
                  {t.tagline}
                </p>
              </div>

              {/* ONE BIG DOMINANT CAMERA BUTTON (76px–88px tall) */}
              <button
                type="button"
                onClick={() => setIsScanModalOpen(true)}
                className="w-full min-h-[76px] sm:min-h-[88px] px-6 py-5 rounded-[16px] bg-[#F6B81A] hover:bg-[#F6B81A]/95 active:scale-[0.99] text-[#17231F] font-bold text-[22px] sm:text-[26px] flex items-center justify-center gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all cursor-pointer animate-camera-pulse"
              >
                <div className="w-14 h-14 rounded-[16px] bg-[#17231F] text-[#F6B81A] flex items-center justify-center shrink-0">
                  <Camera className="w-7 h-7" />
                </div>
                <span>{t.scanCropBtn}</span>
              </button>

              {/* COLLAPSED VOICE OPTION: "Listen ▼" */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuickHomeListen(language === 'ps' ? 'ps' : 'ur')}
                    className={`flex-1 min-h-[56px] px-6 py-3 rounded-[16px] font-semibold text-[16px] flex items-center justify-center gap-3 transition-all cursor-pointer ${
                      homePlayingLang
                        ? 'bg-[#E53935] text-white'
                        : 'bg-[#0A4D36] hover:bg-[#0A4D36]/90 text-white'
                    }`}
                  >
                    {homeLoadingLang ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#F6B81A]" />
                    ) : homePlayingLang ? (
                      <div className="flex items-end gap-1 h-4">
                        <span className="w-1 h-4 bg-white rounded-full animate-wave-1" />
                        <span className="w-1 h-4 bg-white rounded-full animate-wave-2" />
                        <span className="w-1 h-4 bg-white rounded-full animate-wave-3" />
                      </div>
                    ) : (
                      <Volume2 className="w-5 h-5 text-[#F6B81A]" />
                    )}
                    <span>
                      {homeLoadingLang
                        ? language === 'ps'
                          ? 'غږ چمتو کیږي...'
                          : 'آواز آ رہی ہے...'
                        : homePlayingLang
                        ? language === 'ps'
                          ? 'غږ ودرول'
                          : 'آواز روکیں'
                        : language === 'ur'
                        ? 'آواز میں مشورہ سنیں'
                        : language === 'ps'
                        ? 'په غږ کې مشوره واورئ'
                        : 'Listen to Advice'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHeroVoiceExpanded((prev) => !prev)}
                    className="min-h-[56px] px-5 py-3 rounded-[16px] bg-[#0A4D36]/70 hover:bg-[#0A4D36] text-white/90 font-normal text-[14px] flex items-center gap-2 transition-all cursor-pointer"
                    aria-expanded={isHeroVoiceExpanded}
                  >
                    <span>
                      {language === 'ur'
                        ? 'زبانیں'
                        : language === 'ps'
                        ? 'ژبې'
                        : 'Listen'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isHeroVoiceExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {isHeroVoiceExpanded && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 animate-card-fade">
                    <button
                      type="button"
                      onClick={() => handleQuickHomeListen('ur')}
                      className="min-h-[52px] px-4 py-2.5 rounded-[16px] bg-white text-[#17231F] font-semibold text-[15px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-[#0F6B4B]" />
                      <span>اردو میں سنیں</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickHomeListen('ps')}
                      className="min-h-[52px] px-4 py-2.5 rounded-[16px] bg-white text-[#17231F] font-semibold text-[15px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-[#0F6B4B]" />
                      <span>په پښتو واورئ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsVoiceModalOpen(true)}
                      className="min-h-[52px] px-4 py-2.5 rounded-[16px] bg-[#0A4D36] text-white font-medium text-[14px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-[#F6B81A]" />
                      <span>
                        {language === 'ur'
                          ? 'تفصیلی آواز گائیڈ'
                          : language === 'ps'
                          ? 'بشپړ غږیز لارښود'
                          : 'Full Voice Guide'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Compact Weather Indicator at Bottom of Hero (Live Google Weather / Open-Meteo) */}
              <div className="pt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-[13px] font-normal text-white/90">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-[#F6B81A] shrink-0" />
                  <span>
                    {liveWeather.district || activeFarm.district} · {liveWeather.temperature}°C ·{' '}
                    {liveWeather.rainProbability >= 50
                      ? language === 'ur'
                        ? `بارش کا امکان (${liveWeather.rainProbability}%) — آج اسپرے نہ کریں`
                        : language === 'ps'
                        ? `د باران امکان (${liveWeather.rainProbability}%) — نن سپرې مه کوئ`
                        : `${liveWeather.condition} (${liveWeather.rainProbability}% Rain Risk — Delay Spray)`
                      : language === 'ur'
                      ? `${liveWeather.condition === 'Partly cloudy' ? 'جزوی ابر آلود' : 'موسم صاف'} · نمی ${liveWeather.humidity}% · ہوا ${liveWeather.windSpeed} km/h (اسپرے کے لیے موزوں)`
                      : language === 'ps'
                      ? `${liveWeather.condition === 'Partly cloudy' ? 'لږې وریځې' : 'موسم صاف'} · نمي ${liveWeather.humidity}% · باد ${liveWeather.windSpeed} km/h (د سپرې لپاره ښه دی)`
                      : `${liveWeather.condition} · Humidity ${liveWeather.humidity}% · Wind ${liveWeather.windSpeed} km/h`}
                  </span>
                </div>
              </div>
            </section>

            {/* 2. RECENT SCANS SECTION (Only real scans performed by user; empty on fresh reload) */}
            <section className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-5 animate-diagnosis-slide">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-[12px] bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[19px] sm:text-[21px] font-bold text-[#17231F] leading-tight">
                      {language === 'ur'
                        ? 'حالیہ اسکینز'
                        : language === 'ps'
                        ? 'وروستي سکینونه'
                        : 'Recent Scans'}
                    </h3>
                    <p className="text-[12px] font-normal text-[#6B7280] mt-0.5">
                      {language === 'ur'
                        ? 'آپ کے اسکین کیے گئے پتوں کا ریکارڈ'
                        : language === 'ps'
                        ? 'ستاسو د سکین شویو پاڼو ریکارډ'
                        : 'History of leaves you scanned'}
                    </p>
                  </div>
                </div>

                {scanHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearRecentScans}
                    className="min-h-[38px] px-3 py-1.5 rounded-[12px] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] font-semibold text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {language === 'ur'
                        ? 'ریکارڈ صاف کریں'
                        : language === 'ps'
                        ? 'ریکارډ پاک کړئ'
                        : 'Clear'}
                    </span>
                  </button>
                )}
              </div>

              {scanHistory.length === 0 ? (
                <div className="p-6 rounded-[16px] bg-[#F7F8F6] text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center">
                    <Sprout className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[16px] font-bold text-[#17231F]">
                      {language === 'ur'
                        ? 'ابھی تک کوئی اسکین نہیں ہوا'
                        : language === 'ps'
                        ? 'تراوسه کوم سکین نه دی شوی'
                        : 'No recent scans yet'}
                    </p>
                    <p className="text-[13px] text-[#6B7280] max-w-md mx-auto">
                      {language === 'ur'
                        ? 'جب آپ پتے کی تصویر اسکین کریں گے تو آپ کے حالیہ اسکین یہاں محفوظ ہو جائیں گے۔'
                        : language === 'ps'
                        ? 'کله چې تاسو د پاڼې تصویر سکین کړئ، ستاسو وروستي سکینونه به دلته ښکاره شي.'
                        : 'Once you scan a plant leaf, your recent scans will appear here for quick review.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {scanHistory.map((scan) => {
                    const scanDisease =
                      language === 'ur'
                        ? scan.translations?.ur?.disease || scan.disease
                        : language === 'ps'
                        ? scan.translations?.ps?.disease || scan.disease
                        : scan.disease;
                    const scanCrop =
                      language === 'ur'
                        ? scan.translations?.ur?.cropName || scan.crop
                        : language === 'ps'
                        ? scan.translations?.ps?.cropName || scan.crop
                        : scan.crop;
                    const scanSevEmoji =
                      scan.severity === 'Healthy'
                        ? '🟢'
                        : scan.severity === 'Severe'
                        ? '🔴'
                        : '🟡';
                    const scanSevLabel =
                      scan.severity === 'Healthy'
                        ? t.sevHealthy
                        : scan.severity === 'Severe'
                        ? t.sevSevere
                        : scan.severity === 'Mild'
                        ? t.sevMild
                        : t.sevModerate;
                    const formattedDate = scan.scanTimestamp
                      ? new Date(scan.scanTimestamp).toLocaleDateString(
                          language === 'ur' ? 'ur-PK' : language === 'ps' ? 'ps-AF' : 'en-US',
                          { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                        )
                      : '';

                    return (
                      <button
                        key={scan.scanId}
                        type="button"
                        onClick={() => handleSelectRecentScan(scan)}
                        className="w-full p-4 rounded-[16px] bg-[#F7F8F6] hover:bg-[#EBF5F0] text-start transition-all flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {scan.imageUrl ? (
                            <img
                              src={scan.imageUrl}
                              alt={scanDisease}
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 rounded-[14px] object-cover shrink-0 shadow-xs"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-[14px] bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center shrink-0">
                              <Sprout className="w-7 h-7" />
                            </div>
                          )}
                          <div className="min-w-0 space-y-1 flex-1">
                            <div className="text-[16px] sm:text-[17px] font-bold text-[#17231F] truncate">
                              {scanDisease}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#6B7280]">
                              <span className="font-semibold text-[#0F6B4B]">{scanCrop}</span>
                              <span>•</span>
                              <span>
                                {scanSevEmoji} {scanSevLabel}
                              </span>
                              {formattedDate && (
                                <>
                                  <span>•</span>
                                  <span>{formattedDate}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="w-9 h-9 rounded-full bg-white text-[#0F6B4B] flex items-center justify-center shrink-0 shadow-2xs">
                          <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 3. BORDERLESS FEATURE CARDS (Whitespace + Subtle Shadow 0 8 24 rgba(0,0,0,0.06)) */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <button
                type="button"
                onClick={() => openMedicineChecker()}
                className="p-6 rounded-[20px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.09)] text-start transition-all flex flex-col justify-between gap-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-[16px] bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center shrink-0">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[20px] font-semibold text-[#17231F]">
                    {language === 'ur'
                      ? 'اسپرے ایڈوائزر (بوتل اسکین)'
                      : language === 'ps'
                      ? 'د سپرے مشیر (بوتل سکین)'
                      : 'AI Spray Advisor'}
                  </h4>
                  <p className="text-[13px] font-normal text-[#6B7280]">
                    {language === 'ur'
                      ? 'بوتل کی تصویر لیں، اصلی/نقلی اور دو دوائیاں ملانا چیک کریں'
                      : language === 'ps'
                      ? 'د بوتل تصویر واخلئ، اصلي/نقلي او د دوه دواییو مکس کول وګورئ'
                      : 'Scan bottle photo, barcode, or check if 2 medicines can be mixed'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('community')}
                className="p-6 rounded-[20px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.09)] text-start transition-all flex flex-col justify-between gap-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-[16px] bg-[#F6B81A]/20 text-[#17231F] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-[#F6B81A]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[20px] font-semibold text-[#17231F]">
                    {language === 'ur'
                      ? 'آس پاس کے گاؤں کی خبر'
                      : language === 'ps'
                      ? 'د نږدې کلیو د ناروغۍ خبر'
                      : 'Nearby Village Alerts'}
                  </h4>
                  <p className="text-[13px] font-normal text-[#6B7280]">
                    {language === 'ur'
                      ? 'مردان اور صوابی کے کھیتوں کی صورتحال'
                      : language === 'ps'
                      ? 'په مردان او صوابۍ کې د ناروغۍ حال'
                      : 'See and hear nearby crop alerts'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('farms')}
                className="p-6 rounded-[20px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.09)] text-start transition-all flex flex-col justify-between gap-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-[16px] bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center shrink-0">
                  <Sprout className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[20px] font-semibold text-[#17231F]">
                    {language === 'ur'
                      ? 'میرا کھیت اور ریکارڈ'
                      : language === 'ps'
                      ? 'زما پټی او ریکارډ'
                      : 'My Farm Progress'}
                  </h4>
                  <p className="text-[13px] font-normal text-[#6B7280]">
                    {activeFarm.cropType} · {activeFarm.district}
                  </p>
                </div>
              </button>
            </section>
          </div>
        )}

        {/* VIEW 2: 3-STEP RECOMMENDATION + VOICE */}
        {activeTab === 'decision' && (
          <div className="space-y-6 animate-diagnosis-slide">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="min-h-[48px] px-5 py-2.5 rounded-[16px] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] text-[#17231F] font-semibold text-[14px] flex items-center gap-2 cursor-pointer"
              >
                <span>
                  {language === 'ur'
                    ? '← واپس ہوم اسکرین پر'
                    : language === 'ps'
                    ? '← بېرته کور پاڼې ته'
                    : '← Back Home'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsScanModalOpen(true)}
                className="min-h-[48px] px-5 py-2.5 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[14px] flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#F6B81A]" />
                <span>{t.scanCropBtn}</span>
              </button>
            </div>

            {currentRecommendation ? (
              <RecommendationView
                result={currentRecommendation}
                language={language}
                onLanguageChange={setLanguage}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                onSaveToTimeline={() => {
                  const newEvent: TimelineEvent = {
                    id: `time-${Date.now()}`,
                    farmId: activeFarmId,
                    dayLabel: `Day ${timelineEvents.length + 1}`,
                    title: `${currentRecommendation.disease}`,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    status: currentRecommendation.severity === 'Healthy' ? 'healthy' : 'detected',
                    description: currentRecommendation.action,
                    crop: currentRecommendation.crop,
                    disease: currentRecommendation.disease,
                    severity: currentRecommendation.severity,
                  };
                  setTimelineEvents((prev) => [newEvent, ...prev]);
                }}
                onOpenVerifierWithCrop={handleOpenVerifierWithCrop}
              />
            ) : (
              <div className="bg-white rounded-[20px] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center">
                  <Sprout className="w-8 h-8" />
                </div>
                <h3 className="text-[20px] font-bold text-[#17231F]">
                  {language === 'ur'
                    ? 'ابھی کوئی پتے کا اسکین منتخب نہیں ہے'
                    : language === 'ps'
                    ? 'تراوسه کوم سکین نه دی غوره شوی'
                    : 'No leaf scan selected yet'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsScanModalOpen(true)}
                  className="min-h-[52px] px-6 py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[15px] inline-flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-[#F6B81A]" />
                  <span>{t.scanCropBtn}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: MY FARMS & TIMELINE */}
        {activeTab === 'farms' && (
          <FarmManager
            language={language}
            farms={farms}
            activeFarmId={activeFarmId}
            onSelectFarm={setActiveFarmId}
            onAddFarm={handleAddFarm}
            timelineEvents={timelineEvents}
            scanHistory={scanHistory}
            onSelectScan={handleSelectRecentScan}
          />
        )}

        {/* VIEW 4: PESTICIDE VERIFIER */}
        {activeTab === 'verify' && (
          <PesticideVerifier
            key={verifyResetKey}
            language={language}
            presetCrop={verifierCrop}
            presetDisease={verifierDisease}
            activeDistrict={liveWeather.district || activeFarm.district}
            hasActiveScan={Boolean(currentRecommendation)}
          />
        )}

        {/* VIEW 5: COMMUNITY INTELLIGENCE */}
        {activeTab === 'community' && <CommunityIntelligence language={language} />}
      </main>

      {/* CROP SCAN MODAL */}
      <CropScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        activeFarm={activeFarm}
        language={language}
        onAnalysisComplete={handleAnalysisComplete}
      />

      {/* HUMAN VOICE GUIDE MODAL */}
      <VoiceGuideModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        recommendation={currentRecommendation}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* NOTIFICATIONS SHEET (Mobile Bottom Drawer / Centered Desktop Sheet) */}
      {alertsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#17231F]/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setAlertsModalOpen(false)}
        >
          <div
            className="bg-white rounded-t-[24px] sm:rounded-[24px] max-w-md w-full max-h-[85dvh] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden animate-card-fade"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1 rounded-full bg-[#D1D5DB]" />
            </div>

            {/* Clean Single-Line Header */}
            <div className="shrink-0 px-5 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-[11px] bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[#17231F] text-[17px] leading-tight">
                    {language === 'ur'
                      ? 'اطلاعات'
                      : language === 'ps'
                      ? 'خبرتیاوې'
                      : 'Notifications'}
                  </h3>
                  <p className="text-[12px] text-[#6B7280] leading-tight mt-0.5 tabular-nums">
                    {unreadAlertCount > 0
                      ? language === 'ur'
                        ? `${unreadAlertCount} نئی اطلاعات`
                        : language === 'ps'
                        ? `${unreadAlertCount} نوې خبرتیاوې`
                        : `${unreadAlertCount} unread updates`
                      : language === 'ur'
                      ? 'سب پڑھی جا چکی ہیں'
                      : language === 'ps'
                      ? 'ټولې لوستل شوي دي'
                      : 'All caught up'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {unreadAlertCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="h-9 px-2.5 rounded-[10px] text-[12px] font-semibold text-[#0F6B4B] hover:bg-[#EBF5F0] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {language === 'ur'
                      ? 'سب پڑھ لیا'
                      : language === 'ps'
                      ? 'ټول ولوستل'
                      : 'Mark read'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAlertsModalOpen(false)}
                  aria-label="Close notifications"
                  className="w-9 h-9 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Notification Feed */}
            <div className="divide-y divide-[#F3F4F6] overflow-y-auto">
              {notifications.map((item) => {
                const isUnread = !readNotificationIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      markNotificationRead(item.id);
                      setAlertsModalOpen(false);
                      setActiveTab(item.targetTab);
                    }}
                    className={`w-full text-start px-5 py-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
                      isUnread
                        ? 'bg-[#F7FBF9] hover:bg-[#EBF5F0]/70'
                        : 'bg-white hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5 ${
                        item.type === 'danger'
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : 'bg-[#EBF5F0] text-[#0F6B4B]'
                      }`}
                    >
                      {item.type === 'danger' ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <CloudSun className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[15px] leading-snug ${
                            isUnread ? 'font-bold text-[#17231F]' : 'font-semibold text-[#4B5563]'
                          }`}
                        >
                          {item.title}
                        </span>
                        {isUnread && (
                          <span
                            className={`text-[11px] font-bold shrink-0 ${
                              item.type === 'danger' ? 'text-[#DC2626]' : 'text-[#0F6B4B]'
                            }`}
                          >
                            {language === 'ur' ? 'نیا' : language === 'ps' ? 'نوی' : 'New'}
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-[#6B7280] leading-snug">
                        {item.meta}
                      </div>
                      <p className="text-[14px] text-[#374151] leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clean Footer CTA */}
            <div className="shrink-0 p-4 bg-[#F9FAFB] border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => {
                  markAllNotificationsRead();
                  setAlertsModalOpen(false);
                  setActiveTab('community');
                }}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-[14px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>
                  {language === 'ur'
                    ? 'پورے ضلع کی صورتحال دیکھیں'
                    : language === 'ps'
                    ? 'د ټولې ولسوالۍ حال وګورئ'
                    : 'See Full District Report'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="sticky bottom-0 inset-x-0 z-40 mt-auto bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] py-2 px-2 sm:px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-5 gap-1 sm:gap-2 items-stretch">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`min-h-[58px] px-1 py-1.5 flex flex-col items-center justify-center gap-1 rounded-[14px] transition-all duration-200 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#EBF5F0] text-[#0F6B4B] font-semibold shadow-[0_2px_10px_rgba(15,107,75,0.12)]'
                : 'text-[#6B7280] hover:text-[#17231F] font-normal'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="text-[11px] sm:text-[12px] leading-tight text-center">{t.navHome}</span>
          </button>

          <button
            type="button"
            onClick={() => openMedicineChecker()}
            className={`min-h-[58px] px-1 py-1.5 flex flex-col items-center justify-center gap-1 rounded-[14px] transition-all duration-200 cursor-pointer ${
              activeTab === 'verify'
                ? 'bg-[#EBF5F0] text-[#0F6B4B] font-semibold shadow-[0_2px_10px_rgba(15,107,75,0.12)]'
                : 'text-[#6B7280] hover:text-[#17231F] font-normal'
            }`}
          >
            <FlaskConical className="w-5 h-5 shrink-0" />
            <span className="text-[11px] sm:text-[12px] leading-tight text-center">{t.navVerify}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsScanModalOpen(true)}
            className="min-h-[58px] px-1 py-1.5 flex flex-col items-center justify-center gap-1 rounded-[14px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white shadow-[0_4px_14px_rgba(15,107,75,0.22)] cursor-pointer transition-all duration-200 active:scale-95"
          >
            <Camera className="w-5 h-5 shrink-0 text-[#F6B81A]" />
            <span className="text-[11px] sm:text-[12px] font-semibold leading-tight text-center">{t.navScan}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="min-h-[58px] px-1 py-1.5 flex flex-col items-center justify-center gap-1 rounded-[14px] bg-[#F6B81A]/20 hover:bg-[#F6B81A]/30 text-[#17231F] font-semibold transition-all duration-200 cursor-pointer"
          >
            <Volume2 className="w-5 h-5 shrink-0 text-[#0F6B4B]" />
            <span className="text-[11px] sm:text-[12px] leading-tight text-center">
              {language === 'ur' ? 'آواز سنیں' : language === 'ps' ? 'غږ واورئ' : 'Voice'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('community')}
            className={`min-h-[58px] px-1 py-1.5 flex flex-col items-center justify-center gap-1 rounded-[14px] transition-all duration-200 cursor-pointer ${
              activeTab === 'community'
                ? 'bg-[#EBF5F0] text-[#0F6B4B] font-semibold shadow-[0_2px_10px_rgba(15,107,75,0.12)]'
                : 'text-[#6B7280] hover:text-[#17231F] font-normal'
            }`}
          >
            <Radio className="w-5 h-5 shrink-0" />
            <span className="text-[11px] sm:text-[12px] leading-tight text-center">{t.navCommunity}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
