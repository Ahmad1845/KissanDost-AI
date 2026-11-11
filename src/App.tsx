import React, { useState } from 'react';
import {
  Camera,
  Home,
  Sprout,
  Radio,
  FlaskConical,
  Building2,
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
import { Language, UserRole, Farm, TimelineEvent, RecommendationResult } from './types';
import { TRANSLATIONS } from './data/translations';
import { Header } from './components/Header';
import { CropScanModal } from './components/CropScanModal';
import { RecommendationView } from './components/RecommendationView';
import { FarmManager } from './components/FarmManager';
import { PesticideVerifier } from './components/PesticideVerifier';
import { CommunityIntelligence } from './components/CommunityIntelligence';
import { GovernmentDashboard } from './components/GovernmentDashboard';
import { VoiceGuideModal } from './components/VoiceGuideModal';
import { SAMPLE_CROP_IMAGES } from './data/knowledgeBase';
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
  action: 'Do NOT spray today because afternoon rain will wash the medicine away. Spray Mancozeb tomorrow morning between 7:00 AM and 10:00 AM.',
  bestTime: 'Tomorrow morning 7:00 AM - 10:00 AM',
  why: [
    'Today afternoon rain will wash the medicine off the leaves and waste your money.',
    'Tomorrow morning the weather will be dry and calm, so the medicine will stick well to the leaves.',
    'Yellow and brown rings on the lower tomato leaves show early blight fungus.',
  ],
  detailedExplanation:
    'Your tomato plants have brown spots on the lower leaves. Because rain is coming this afternoon in Mardan, do not spray today. Spray Mancozeb tomorrow morning between 7 AM and 10 AM when the leaves are dry.',
  weatherSnapshot: {
    district: 'Mardan',
    temperature: 25,
    humidity: 78,
    windSpeed: 7,
    precipitation: 2.4,
    rainProbability: 55,
    condition: 'Afternoon Rain Expected',
    spraySuitability: 'Unfavorable Today - Favorable Tomorrow Morning',
    weatherAdvice: 'Rain expected this afternoon in Mardan. Wait and spray tomorrow morning.',
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
  imageUrl: SAMPLE_CROP_IMAGES[0].dataUrl,
  district: 'Mardan',
  translations: {
    ur: {
      cropName: 'ٹماٹر (Tomato)',
      disease: 'ٹماٹر کے پتوں کا جھلساؤ (Early Blight)',
      action: 'آج شام بارش کا امکان ہے اس لیے آج اسپرے ہرگز نہ کریں ورنہ دوائی دھل جائے گی۔ کل صبح 7 سے 10 بجے کے درمیان مینکوزیب دوائی کا اسپرے کریں۔',
      bestTime: 'کل صبح 7:00 سے 10:00 بجے تک',
      whySummary: 'آج بارش کی وجہ سے دوائی ضائع ہو جائے گی۔ کل صبح ہوا کم ہوگی اور پتے خشک ہوں گے، تب اسپرے پورا اثر کرے گا۔',
      whyPoints: [
        'آج شام مردان میں بارش کا امکان ہے جس سے دوائی دھل جائے گی اور پیسے ضائع ہوں گے۔',
        'کل صبح 7 سے 10 بجے موسم صاف اور ہوا ہلکی ہوگی، دوائی پتوں پر اچھی طرح جم جائے گی۔',
        'نچلے پیلے اور داغدار پتوں کو توڑ کر کھیت سے باہر زمین میں دبا دیں۔',
      ],
      medicineName: 'مینکوزیب (Mancozeb 75% WP / ڈائیتھین M-45)',
      dosageText: 'ایک لیٹر پانی میں ڈھائی گرام (آدھا چمچ) دوائی ملائیں — ایک ایکڑ کے لیے 600 سے 800 گرام',
      safetyText: 'اسپرے کرتے وقت منہ اور ناک پر کپڑا باندھیں اور ہاتھوں پر دستانے پہنیں۔ اسپرے کے بعد 7 دن تک ٹماٹر نہ توڑیں۔',
      voiceScript:
        'السلام علیکم کسان بھائی! آپ کے ٹماٹر کے پودوں پر پتوں کے جھلساؤ یعنی ارلی بلائیٹ کی بیماری لگی ہے۔ غور سے سنیں: آج شام مردان میں بارش کا امکان ہے، اس لیے آج اسپرے ہرگز نہ کریں ورنہ آپ کی دوائی اور پیسے ضائع ہو جائیں گے۔ کل صبح سات بجے سے دس بجے کے درمیان جب پتے خشک ہوں تو مینکوزیب دوائی کا اسپرے کریں۔ ایک لیٹر پانی میں آدھا چمچ یعنی ڈھائی گرام دوائی ملائیں۔ اسپرے کرتے وقت منہ پر کپڑا ضرور باندھیں۔ اللہ آپ کی فصل میں برکت ڈالے۔',
    },
    ps: {
      cropName: 'ټماټر (Tomato)',
      disease: 'د ټماټرو د پاڼو سوځېدل (Early Blight)',
      action: 'نن مازدیګر د باران امکان شته، نو نن بالکل سپرے مه کوئ ګنې دوایي به مو ضایع شي. سبا سهار د ۷ بجو نه تر ۱۰ بجو پورې د مینکوزیب دوایۍ سپرے وکړئ.',
      bestTime: 'سبا سهار د ۷:۰۰ نه تر ۱۰:۰۰ بجو پورې',
      whySummary: 'نن د باران د وجې نه دوایي وینځل کیږي. سبا سهار هوا ارامه او پاڼې وچې وي، نو دوایي به پوره اثر وکړي.',
      whyPoints: [
        'نن مازدیګر په مردان کې د باران امکان شته چې دوایي به له پاڼو ووینځي او پیسې به مو ضایع شي.',
        'سبا سهار د ۷ نه تر ۱۰ بجو پورې هوا صافه او باد کم وي، دوایي به په پاڼو ښه اثر وکړي.',
        'لاندې ژیړې او خرابې پاڼې وشکوئ او له پټي بهر یې په خاوره کې ښخې کړئ.',
      ],
      medicineName: 'مینکوزیب دوایي (Mancozeb 75% WP / ډایتین M-45)',
      dosageText: 'په یو لیټر اوبو کې دوه نیم ګرامه (نیمه چمچه) دوایي مکس کړئ — د یو ایکړ لپاره له ۶۰۰ نه تر ۸۰۰ ګرامه',
      safetyText: 'د سپرے کولو په وخت خوله او پوزه په صافه کپړه وتړئ. له سپرے وروسته تر ۷ ورځو پورې ټماټر مه شکوئ.',
      voiceScript:
        'السلام علیکم زما خوږه زمینداره وروره! ستاسو د ټماټرو په بوټو باندې د پاڼو د سوځېدو یعنې بلایټ بیماري لګېدلې ده. زما خبره په غور واورئ: نن مازدیګر په مردان کې د باران امکان شته، نو نن بالکل سپرے مه کوئ، ګنې باران به دوایي ووینځي او پیسې به مو ضایع شي. سبا سهار د اوو بجو نه تر لسو بجو پورې چې پاڼې وچې وي، د مینکوزیب دوایۍ سپرے وکړئ. په یو لیټر اوبو کې نیمه چمچه یعنې دوه نیم ګرامه دوایي مکس کړئ. د سپرے کولو په وخت خپله خوله او پوزه په صافه کپړه وتړئ. الله پاک دې ستاسو په فصل کې ډېر برکت واچوي.',
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
  const [role, setRole] = useState<UserRole>('farmer');
  const [activeTab, setActiveTab] = useState<'home' | 'scan' | 'decision' | 'farms' | 'verify' | 'community' | 'gov'>('home');
  const [farms, setFarms] = useState<Farm[]>(DEFAULT_FARMS);
  const [activeFarmId, setActiveFarmId] = useState<string>('farm-01');
  const [currentRecommendation, setCurrentRecommendation] = useState<RecommendationResult>(INITIAL_RECOMMENDATION);
  const [scanHistory, setScanHistory] = useState<RecommendationResult[]>([INITIAL_RECOMMENDATION]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState<boolean>(false);
  const [isHeroVoiceExpanded, setIsHeroVoiceExpanded] = useState<boolean>(false);

  const [homePlayingLang, setHomePlayingLang] = useState<Language | null>(null);
  const [homeLoadingLang, setHomeLoadingLang] = useState<Language | null>(null);

  const [verifierCrop, setVerifierCrop] = useState<string>('Tomato');
  const [verifierDisease, setVerifierDisease] = useState<string>('Early Blight');

  const t = TRANSLATIONS[language];
  const isRtl = language === 'ur' || language === 'ps';

  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0];

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
        : `Hello farmer! Your ${currentRecommendation.crop} has ${currentRecommendation.disease}. ${currentRecommendation.action}`;

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

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F7F8F6] text-[#17231F] flex flex-col font-sans"
    >
      {/* Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        role={role}
        onRoleChange={(newRole) => {
          setRole(newRole);
          if (newRole === 'officer') {
            setActiveTab('gov');
          } else {
            setActiveTab('home');
          }
        }}
        activeFarm={activeFarm}
        nearbyAlertCount={2}
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

              {/* Compact Weather Indicator at Bottom of Hero */}
              <div className="pt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-[13px] font-normal text-white/85">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-[#F6B81A] shrink-0" />
                  <span>
                    {activeFarm.district} · 25°C ·{' '}
                    {language === 'ur'
                      ? 'شام کو بارش کا امکان (آج اسپرے نہ کریں)'
                      : language === 'ps'
                      ? 'مازدیګر د باران امکان (نن سپرې مه کوئ)'
                      : 'Rain Expected Today'}
                  </span>
                </div>
                <span className="text-[12px] text-white/65">
                  {language === 'ur'
                    ? 'موسمی ذریعہ: Open-Meteo · آج اپڈیٹ ہوا'
                    : language === 'ps'
                    ? 'د هوا سرچینه: Open-Meteo · نن تازه شوی'
                    : 'Weather Source: Open-Meteo · Updated Today'}
                </span>
              </div>
            </section>

            {/* 2. RECENT DIAGNOSIS CARD: Disease (72x72 + Confidence + Severity) ↓ Recommendation ↓ Voice ↓ More Details */}
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

              {/* Disease Header with 72x72 Image, Severity Indicator & AI Confidence */}
              <div className="flex items-start sm:items-center gap-4">
                {currentRecommendation.imageUrl && (
                  <img
                    src={currentRecommendation.imageUrl}
                    alt={localizedDisease}
                    referrerPolicy="no-referrer"
                    className="w-[72px] h-[72px] rounded-[16px] object-cover shrink-0 shadow-xs"
                  />
                )}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <h3 className="text-[20px] sm:text-[22px] font-bold text-[#17231F] leading-snug">
                    {localizedDisease}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-[13px] font-normal text-[#6B7280]">
                    <span className="font-semibold text-[#17231F]">
                      {severityEmoji} {severityLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-[#0F6B4B] tabular-nums">
                      ✓ AI Confidence {currentRecommendation.confidence}%
                    </span>
                    <span aria-hidden="true" className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[#6B7280]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0F6B4B]" />
                      {language === 'ur'
                        ? 'زرعی ماہرین سے تصدیق شدہ'
                        : language === 'ps'
                        ? 'د کرنې پوهانو لخوا تایید شوی'
                        : 'Verified by Agriculture Experts'}
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
          />
        )}

        {/* VIEW 5: COMMUNITY INTELLIGENCE */}
        {activeTab === 'community' && <CommunityIntelligence language={language} />}

        {/* VIEW 6: GOVERNMENT DASHBOARD */}
        {activeTab === 'gov' && <GovernmentDashboard language={language} />}
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

      {/* ALERTS POPUP MODAL (24px Radius, Pinned Header & Visible Close Button) */}
      {alertsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setAlertsModalOpen(false)}
        >
          <div
            className="bg-white rounded-t-[24px] sm:rounded-[24px] max-w-md w-full max-h-[88dvh] shadow-[0_12px_32px_rgba(0,0,0,0.16)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-5 py-4 bg-[#0F6B4B] text-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <Bell className="w-5 h-5 text-[#F6B81A] shrink-0" />
                <h3 className="font-bold text-white text-[18px] truncate">
                  {t.nearbyAlertsTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAlertsModalOpen(false)}
                className="shrink-0 min-h-[40px] px-3.5 py-1.5 rounded-[12px] bg-[#0A4D36] hover:bg-[#E53935] text-white font-semibold text-[13px] flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>{language === 'ur' ? 'بند کریں' : language === 'ps' ? 'بند کړئ' : 'Close'}</span>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="p-5 rounded-[16px] bg-[#E53935]/10 text-[#17231F] space-y-2">
                <div className="font-semibold text-[16px] text-[#E53935] flex items-center justify-between">
                  <span>
                    🔴{' '}
                    {language === 'ur'
                      ? 'مردان: ٹماٹر کا جھلساؤ'
                      : language === 'ps'
                      ? 'مردان: د رومیانو ناروغي'
                      : 'Mardan: Tomato Leaf Blight'}
                  </span>
                  <span className="text-[12px] font-semibold">
                    {language === 'ur' ? 'زیادہ خطرہ' : language === 'ps' ? 'لوړ خطر' : 'High Risk'}
                  </span>
                </div>
                <p className="text-[15px] font-normal text-[#17231F] leading-relaxed">
                  {language === 'ur'
                    ? 'گجر گڑھی اور تورو کے 28 کھیتوں میں بیماری ملی ہے۔ آج اپنے پودوں کے نچلے پتے چیک کریں۔'
                    : language === 'ps'
                    ? 'په ګجر ګړهي او تورو کې په ۲۸ پټیو کې ناروغي لیدل شوې. نن خپل بوټي وګورئ.'
                    : '28 nearby farms reported leaf spots. Check your lower leaves today.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 p-5 bg-[#F7F8F6]">
              <button
                type="button"
                onClick={() => {
                  setAlertsModalOpen(false);
                  setActiveTab('community');
                }}
                className="w-full min-h-[56px] py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[16px] cursor-pointer"
              >
                {language === 'ur'
                  ? 'پورے ضلع کی صورتحال دیکھیں'
                  : language === 'ps'
                  ? 'د ټولې ولسوالۍ حال وګورئ'
                  : 'See Full Village Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar (Sticky in document flow with elevated active pill) */}
      <nav className="sticky bottom-0 inset-x-0 z-40 mt-auto bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] py-2 px-3 sm:px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-5 gap-2 items-center">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`min-h-[56px] flex flex-col items-center justify-center gap-1 rounded-[16px] transition-all duration-200 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#EBF5F0] text-[#0F6B4B] font-semibold -translate-y-0.5 shadow-[0_4px_12px_rgba(15,107,75,0.14)]'
                : 'text-[#6B7280] hover:text-[#17231F] font-normal'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[12px] truncate max-w-full px-1">{t.navHome}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verify')}
            className={`min-h-[56px] flex flex-col items-center justify-center gap-1 rounded-[16px] transition-all duration-200 cursor-pointer ${
              activeTab === 'verify'
                ? 'bg-[#EBF5F0] text-[#0F6B4B] font-semibold -translate-y-0.5 shadow-[0_4px_12px_rgba(15,107,75,0.14)]'
                : 'text-[#6B7280] hover:text-[#17231F] font-normal'
            }`}
          >
            <FlaskConical className="w-5 h-5" />
            <span className="text-[12px] truncate max-w-full px-1">{t.navVerify}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsScanModalOpen(true)}
            className="min-h-[56px] flex flex-col items-center justify-center gap-1 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white shadow-[0_6px_16px_rgba(15,107,75,0.25)] cursor-pointer transition-all duration-200 active:scale-95 -translate-y-0.5"
          >
            <Camera className="w-5 h-5 text-[#F6B81A]" />
            <span className="text-[12px] font-semibold truncate max-w-full px-1">{t.navScan}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="min-h-[56px] flex flex-col items-center justify-center gap-1 rounded-[16px] bg-[#F6B81A]/20 hover:bg-[#F6B81A]/30 text-[#17231F] font-semibold transition-all duration-200 cursor-pointer"
          >
            <Volume2 className="w-5 h-5 text-[#0F6B4B]" />
            <span className="text-[12px] truncate max-w-full px-1">
              {language === 'ur' ? 'آواز سنیں' : language === 'ps' ? 'غږ واورئ' : 'Voice'}
            </span>
          </button>

          {role === 'officer' ? (
            <button
              type="button"
              onClick={() => setActiveTab('gov')}
              className={`min-h-[56px] flex flex-col items-center justify-center gap-1 rounded-[16px] transition-all duration-200 cursor-pointer ${
                activeTab === 'gov'
                  ? 'bg-[#EBF5F0] text-[#0F6B4B] font-semibold -translate-y-0.5 shadow-[0_4px_12px_rgba(15,107,75,0.14)]'
                  : 'text-[#6B7280] hover:text-[#17231F] font-normal'
              }`}
            >
              <Building2 className="w-5 h-5 text-[#0F6B4B]" />
              <span className="text-[12px] truncate max-w-full px-1">{t.navGov}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('community')}
              className={`min-h-[56px] flex flex-col items-center justify-center gap-1 rounded-[16px] transition-all duration-200 cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-[#EBF5F0] text-[#0F6B4B] font-semibold -translate-y-0.5 shadow-[0_4px_12px_rgba(15,107,75,0.14)]'
                  : 'text-[#6B7280] hover:text-[#17231F] font-normal'
              }`}
            >
              <Radio className="w-5 h-5" />
              <span className="text-[12px] truncate max-w-full px-1">{t.navCommunity}</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
