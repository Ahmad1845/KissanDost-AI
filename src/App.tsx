import React, { useState, useEffect } from 'react';
import {
  Camera,
  Home,
  Sprout,
  Radio,
  FlaskConical,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CloudSun,
  Volume2,
  Loader2,
  Square,
  Bell,
  X,
  ChevronDown,
  ShieldCheck,
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

const INITIAL_RECOMMENDATION: RecommendationResult = {
  scanId: 'scan-init-01',
  crop: 'Tomato',
  disease: 'Leaf Spot Blight (Early Blight)',
  pathogen: 'Alternaria solani',
  severity: 'Moderate',
  confidence: 96,
  action: 'Spray Mancozeb 75% WP (2.5g per litre of water) in the morning between 7:00 AM and 10:00 AM when wind is calm.',
  bestTime: 'Morning 7:00 AM - 10:00 AM (Weather Favorable)',
  why: [
    'Weather in Mardan is partly cloudy and calm (17°C, wind 5 km/h), suitable for morning spray.',
    'Morning hours allow the medicine to stick well to the leaves without washing off.',
    'Yellow and brown rings on the lower tomato leaves show early blight fungus.',
  ],
  detailedExplanation:
    'Your tomato plants have brown spots on the lower leaves. Weather in Mardan is calm and favorable, so spray Mancozeb between 7 AM and 10 AM when the leaves are dry.',
  weatherSnapshot: {
    district: 'Mardan',
    temperature: 17,
    humidity: 90,
    windSpeed: 5,
    precipitation: 0,
    rainProbability: 26,
    condition: 'Partly cloudy',
    spraySuitability: 'Favorable',
    weatherAdvice: 'Partly cloudy (17°C, humidity 90%, wind 5 km/h). Favorable window to spray.',
  },
  approvedTreatments: [
    {
      name: 'Mancozeb 75% WP (Dithane M-45)',
      dosage: '2.5 grams in 1 litre water (half spoon per litre)',
      withholding: 'Wait 7 days before picking tomatoes',
      ppe: 'Cover mouth and nose with a cloth and wear gloves while spraying',
    },
    {
      name: 'Chlorothalonil 75% WP',
      dosage: '2 grams in 1 litre water',
      withholding: 'Wait 5 days before picking tomatoes',
      ppe: 'Cover mouth and eyes while spraying',
    },
  ],
  organicAlternatives: [
    'Mix Neem oil or Neem seed water (5%) and spray on leaves',
    'Pluck the badly spotted bottom leaves and bury them outside the field',
  ],
  nextReviewDays: 3,
  consultOfficer: false,
  groundedSources: [
    { title: 'Tomato Leaf Spot Farmer Guide - Mardan & Peshawar', source: 'KP Agriculture Dept' },
    { title: 'Safe Crop Spray Guide', source: 'PARC' },
  ],
  scanTimestamp: new Date().toISOString(),
  imageUrl: '',
  district: 'Mardan',
  translations: {
    ur: {
      cropName: 'ٹماٹر (Tomato)',
      disease: 'ٹماٹر کے پتوں کا جھلساؤ (Early Blight)',
      action: 'صبح 7 سے 10 بجے کے درمیان جب موسم صاف اور ہوا ہلکی ہو تو مینکوزیب (ڈائیتھین M-45) دوائی کا اسپرے کریں۔',
      bestTime: 'صبح 7:00 سے 10:00 بجے تک (موسم موزوں ہے)',
      whySummary: 'مردان میں موسم جزوی ابر آلود اور ہوا ہلکی ہے، اس لیے صبح کے وقت اسپرے پورا اثر کرے گا۔',
      whyPoints: [
        'نچلے پتوں پر گول بھورے دھبے اور پیلاہٹ نظر آ رہی ہے',
        'صبح 7 سے 10 بجے ہوا ہلکی ہوگی اور دوائی پتوں پر اچھی طرح جم جائے گی',
        'نچلے پیلے اور داغدار پتوں کو توڑ کر کھیت سے باہر زمین میں دبا دیں',
      ],
      medicineName: 'مینکوزیب (Mancozeb 75% WP / ڈائیتھین M-45)',
      dosageText: 'ایک لیٹر پانی میں ڈھائی گرام (آدھا چمچ) دوائی ملائیں — ایک ایکڑ کے لیے 600 سے 800 گرام',
      safetyText: 'اسپرے کرتے وقت منہ اور ناک پر کپڑا باندھیں اور ہاتھوں پر دستانے پہنیں۔ اسپرے کے بعد 7 دن تک ٹماٹر نہ توڑیں۔',
      voiceScript:
        'السلام علیکم میرے پیارے کسان بھائی! خوش آمدید، میں آپ کا کسان دوست بول رہا ہوں۔ آپ کے ٹماٹر کے پودوں پر پتوں کے جھلساؤ یعنی ارلی بلائیٹ کے ہلکے آثار نظر آ رہے ہیں، لیکن گھبرانے کی بالکل بات نہیں ہے۔ اس وقت مردان میں موسم اسپرے کے لیے بہت اچھا اور پرسکون ہے، اس لیے صبح سات بجے سے دس بجے کے درمیان مینکوزیب دوائی کا اسپرے کریں۔ ایک لیٹر پانی میں آدھا چمچ یعنی ڈھائی گرام دوائی ملائیں، اور اسپرے سے پہلے نچلے داغدار پتے توڑ کر دبا دیں۔ اسپرے کرتے وقت منہ پر صاف کپڑا ضرور باندھیں اور سات دن تک ٹماٹر نہ توڑیں۔ اللہ آپ کی محنت میں خوب برکت ڈالے!',
    },
    ps: {
      cropName: 'ټماټر (Tomato)',
      disease: 'د ټماټرو د پاڼو سوځېدل (Early Blight)',
      action: 'سهار د ۷ بجو نه تر ۱۰ بجو پورې چې هوا ارامه وي د مینکوزیب (ډایتین M-45) دوایۍ سپرے وکړئ.',
      bestTime: 'سهار د ۷:۰۰ نه تر ۱۰:۰۰ بجو پورې (موسم ښه دی)',
      whySummary: 'په مردان کې هوا ارامه ده، نو سهار مهال سپرے به په پاڼو پوره اثر وکړي.',
      whyPoints: [
        'په لاندې پاڼو باندې نصواري داغونه او ژیړوالی ښکاري',
        'سهار د ۷ نه تر ۱۰ بجو پورې باد کم وي، دوایي به په پاڼو ښه اثر وکړي',
        'لاندې ژیړې او خرابې پاڼې وشکوئ او له پټي بهر یې په خاوره کې ښخې کړئ',
      ],
      medicineName: 'مینکوزیب دوایي (Mancozeb 75% WP / ډایتین M-45)',
      dosageText: 'په یو لیټر اوبو کې دوه نیم ګرامه (نیمه چمچه) دوایي مکس کړئ — د یو ایکړ لپاره له ۶۰۰ نه تر ۸۰۰ ګرامه',
      safetyText: 'د سپرے کولو په وخت خوله او پوزه په صافه کپړه وتړئ. له سپرے وروسته تر ۷ ورځو پورې ټماټر مه شکوئ.',
      voiceScript:
        'السلام علیکم زما خوږه زمینداره وروره! ستاسو کسان دوست له تاسو سره خبرې کوي، هیله ده روغ جوړ به یئ. ستاسو د ټماټرو په بوټو باندې د پاڼو د سوځېدو یعنې ارلي بلایټ بیماري ښکاري، خو هیڅ مه پرېشانه کېږئ، وختي علاج یې ډېر اسانه دی. اوس په مردان کې موسم د سپرے لپاره ډېر ښه دی، نو سهار د اوو بجو نه تر لسو بجو پورې د مینکوزیب دوایۍ سپرے وکړئ. په یو لیټر اوبو کې نیمه چمچه یعنې دوه نیم ګرامه دوایي مکس کړئ او لاندې خرابې پاڼې له پټي پاکې کړئ. د سپرے پر مهال خوله په کپړه وتړئ او تر اوو ورځو پورې ټماټر مه شکوئ. الله پاک دې ستاسو په فصل او روزي کې ډېر برکت واچوي!',
    },
  },
};

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
  const [currentRecommendation, setCurrentRecommendation] = useState<RecommendationResult>(INITIAL_RECOMMENDATION);
  const [scanHistory, setScanHistory] = useState<RecommendationResult[]>([INITIAL_RECOMMENDATION]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState<boolean>(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [isHeroVoiceExpanded, setIsHeroVoiceExpanded] = useState<boolean>(false);

  const [homePlayingLang, setHomePlayingLang] = useState<Language | null>(null);
  const [homeLoadingLang, setHomeLoadingLang] = useState<Language | null>(null);

  const [verifierCrop, setVerifierCrop] = useState<string>('Tomato');
  const [verifierDisease, setVerifierDisease] = useState<string>('Early Blight');
  const [liveWeather, setLiveWeather] = useState<WeatherSnapshot>(INITIAL_RECOMMENDATION.weatherSnapshot);

  const t = TRANSLATIONS[language];
  const isRtl = language === 'ur' || language === 'ps';

  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0];

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/v1/weather?district=${encodeURIComponent(activeFarm.district)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.weather) {
          setLiveWeather(data.weather);
          setCurrentRecommendation((prev) =>
            prev.scanId === 'scan-init-01'
              ? { ...prev, district: activeFarm.district, weatherSnapshot: data.weather }
              : prev
          );
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

    const ur = currentRecommendation.translations?.ur;
    const ps = currentRecommendation.translations?.ps;

    const script =
      targetLang === 'ur'
        ? ur?.voiceScript || `${ur?.disease || currentRecommendation.disease}۔ ${ur?.action || currentRecommendation.action}`
        : targetLang === 'ps'
        ? ps?.voiceScript || `${ps?.disease || currentRecommendation.disease}۔ ${ps?.action || currentRecommendation.action}`
        : `Assalamu Alaikum, dear farmer brother! Welcome back—I am speaking as your Kissan Dost. Your ${currentRecommendation.crop} crop is showing signs of ${currentRecommendation.disease}, so there is no need to worry at all when we treat it in time. ${currentRecommendation.action} Take your time spraying calmly in the morning, cover your nose and mouth with a clean cloth, and check the leaves again in a few days. May your hard work bring a rich, healthy harvest!`;

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
    setScanHistory((prev) => [result, ...prev]);
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

  const handleOpenVerifierWithCrop = (crop: string, disease: string) => {
    setVerifierCrop(crop);
    setVerifierDisease(disease);
    setActiveTab('verify');
  };

  const localizedDisease =
    language === 'ur'
      ? currentRecommendation.translations?.ur?.disease || currentRecommendation.disease
      : language === 'ps'
      ? currentRecommendation.translations?.ps?.disease || currentRecommendation.disease
      : currentRecommendation.disease;

  const localizedAction =
    language === 'ur'
      ? currentRecommendation.translations?.ur?.action || currentRecommendation.action
      : language === 'ps'
      ? currentRecommendation.translations?.ps?.action || currentRecommendation.action
      : currentRecommendation.action;

  const localizedBestTime =
    language === 'ur'
      ? currentRecommendation.translations?.ur?.bestTime || currentRecommendation.bestTime
      : language === 'ps'
      ? currentRecommendation.translations?.ps?.bestTime || currentRecommendation.bestTime
      : currentRecommendation.bestTime;

  const severityEmoji =
    currentRecommendation.severity === 'Healthy'
      ? '🟢'
      : currentRecommendation.severity === 'Severe'
      ? '🔴'
      : '🟡';

  const severityLabel =
    currentRecommendation.severity === 'Healthy'
      ? t.sevHealthy
      : currentRecommendation.severity === 'Severe'
      ? t.sevSevere
      : currentRecommendation.severity === 'Mild'
      ? t.sevMild
      : t.sevModerate;

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

            {/* 2. RECENT DIAGNOSIS CARD: Disease ↓ Recommendation ↓ Voice ↓ More Details */}
            <section className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6 animate-diagnosis-slide">
              {/* Top Row: Section Kicker & Spray Window */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[13px] font-normal text-[#6B7280]">
                  {t.recentScan} · {activeFarm.district}
                </span>
                <span className="text-[13px] font-semibold text-[#0F6B4B]">
                  {localizedBestTime}
                </span>
              </div>

              {/* Disease Header with 72x72 Image or Dummy Leaf Icon Placeholder */}
              <div className="flex items-start sm:items-center gap-4">
                {currentRecommendation.imageUrl ? (
                  <img
                    src={currentRecommendation.imageUrl}
                    alt={localizedDisease}
                    referrerPolicy="no-referrer"
                    className="w-[72px] h-[72px] rounded-[16px] object-cover shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-[16px] bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center shrink-0">
                    <Sprout className="w-8 h-8" />
                  </div>
                )}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <h3 className="text-[20px] sm:text-[22px] font-bold text-[#17231F] leading-snug">
                    {localizedDisease}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-[13px] font-normal text-[#6B7280]">
                    <span className="font-semibold text-[#17231F]">
                      {severityEmoji} {severityLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendation Body (Regular 400 weight, 16px, clean light-green surface without heavy border) */}
              <div className="p-5 rounded-[16px] bg-[#EBF5F0] space-y-1.5">
                <div className="flex items-center gap-2 text-[#0F6B4B] font-semibold text-[13px]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {language === 'ur'
                      ? 'ابھی کیا کرنا ہے:'
                      : language === 'ps'
                      ? 'اوس باید څه وکړئ:'
                      : 'Recommended Action:'}
                  </span>
                </div>
                <p className="text-[16px] font-normal text-[#17231F] leading-relaxed">
                  {localizedAction}
                </p>
              </div>

              {/* Primary 56px Action Buttons: Voice ↓ More Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="min-h-[56px] px-6 py-3.5 rounded-[16px] bg-[#F6B81A] hover:bg-[#F6B81A]/90 text-[#17231F] font-semibold text-[16px] flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>
                    {language === 'ur'
                      ? 'آواز میں سنیں'
                      : language === 'ps'
                      ? 'په غږ واورئ'
                      : 'Listen in Voice'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('decision')}
                  className="min-h-[56px] px-6 py-3.5 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[16px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span>{t.viewDetails}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </section>

            {/* 3. BORDERLESS FEATURE CARDS (Whitespace + Subtle Shadow 0 8 24 rgba(0,0,0,0.06)) */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <button
                type="button"
                onClick={() => setActiveTab('verify')}
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
            onSelectScan={(scan) => {
              setCurrentRecommendation(scan);
              setVerifierCrop(scan.crop);
              setVerifierDisease(scan.disease);
              setActiveTab('decision');
            }}
          />
        )}

        {/* VIEW 4: PESTICIDE VERIFIER */}
        {activeTab === 'verify' && (
          <PesticideVerifier
            language={language}
            presetCrop={verifierCrop}
            presetDisease={verifierDisease}
            activeDistrict={liveWeather.district || activeFarm.district}
            hasActiveScan={scanHistory.length > 1 || currentRecommendation.scanId !== 'scan-init-01'}
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
            onClick={() => setActiveTab('verify')}
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
