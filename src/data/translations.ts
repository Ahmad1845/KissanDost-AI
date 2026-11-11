export type Language = 'en' | 'ur' | 'ps';

export interface TranslationStrings {
  appName: string;
  tagline: string;
  navHome: string;
  navScan: string;
  navFarms: string;
  navHistory: string;
  navCommunity: string;
  navVerify: string;
  navGov: string;
  navProfile: string;

  greeting: string;
  yourFarm: string;
  scanCropBtn: string;
  scanSubtext: string;
  recentScan: string;
  nearbyAlertsTitle: string;
  nearbyAlertBadge: string;
  viewDetails: string;

  // Voice Guide Modal
  voiceGuideBtn: string;
  voiceModalTitle: string;
  voiceModalSubtitle: string;
  voiceChooseLang: string;
  voiceChooseSpeaker: string;
  speakerElder: string;
  speakerFemale: string;
  playAdviceBtn: string;
  playingAudioText: string;
  preparingVoiceText: string;

  // Crop Scan
  scanModalTitle: string;
  takePhoto: string;
  uploadImage: string;
  useSampleImage: string;
  cameraAccessPrompt: string;
  selectCropLabel: string;
  selectStageLabel: string;
  startAnalysisBtn: string;
  consentCheckbox: string;

  // Pipeline
  analyzingTitle: string;
  stepDetectingCrop: string;
  stepIdentifyingDisease: string;
  stepCheckingWeather: string;
  stepRetrievingKnowledge: string;
  stepGeneratingRecommendation: string;
  estimatedTime: string;

  // Recommendation Card (Simple 3-Step Farmer View)
  diagnosisTitle: string;
  severityLabel: string;
  confidenceLabel: string;
  recommendedActionTitle: string;
  bestSprayWindow: string;
  whyTitle: string;
  weatherSummaryTitle: string;
  nextReviewDate: string;
  consultOfficerAlert: string;
  listenVoice: string;
  stopVoice: string;
  shareBtn: string;
  saveBtn: string;
  feedbackHelpful: string;
  feedbackNotHelpful: string;
  feedbackThankYou: string;

  // 3 Simple Questions for Farmers
  step1Title: string;
  step2Title: string;
  step3Title: string;
  homeRemedyTitle: string;

  // Severity labels (Simple Traffic Light)
  sevHealthy: string;
  sevMild: string;
  sevModerate: string;
  sevSevere: string;

  // Pesticide Verification
  verifierTitle: string;
  verifierSubtitle: string;
  searchPesticidePlaceholder: string;
  verifyBottleBtn: string;
  dosageLabel: string;
  safetyAdviceLabel: string;
  withholdingLabel: string;
  alternativeRemedies: string;
  warningRestricted: string;

  // Community Intelligence
  communityTitle: string;
  communitySubtitle: string;
  activeHotspots: string;
  totalAnonymousReports: string;
  districtSurveillance: string;
  outbreakAlert: string;

  // Gov Dashboard
  govTitle: string;
  govBadge: string;
  districtOverview: string;
  diseaseDistribution: string;
  exportReportBtn: string;
  broadcastAlertBtn: string;
  broadcastModalTitle: string;
}

export const TRANSLATIONS: Record<Language, TranslationStrings> = {
  ur: {
    appName: 'کسان دوست',
    tagline: 'صرف ایک تصویر کھینچیں — اپنی زبان میں آواز میں مشورہ سنیں',
    navHome: 'میرا کھیت',
    navScan: 'تصویر لیں',
    navFarms: 'میری فصلیں',
    navHistory: 'پرانا ریکارڈ',
    navCommunity: 'گاؤں کی خبر',
    navVerify: 'دوائی چیک کریں',
    navGov: 'زراعت آفیسر',
    navProfile: 'پروفائل',

    greeting: 'السلام علیکم، احمد کسان بھائی!',
    yourFarm: 'آپ کا کھیت',
    scanCropBtn: 'پتے کی تصویر کھینچیں',
    scanSubtext: 'پڑھنے کی ضرورت نہیں! تصویر لیں اور اردو یا پشتو آواز میں پورا علاج سنیں',
    recentScan: 'آپ کی فصل کا تازہ حال',
    nearbyAlertsTitle: 'آس پاس کے کھیتوں کی خبر',
    nearbyAlertBadge: 'مردان میں ٹماٹر کے پتوں کی بیماری پھیل رہی ہے',
    viewDetails: 'پورا مشورہ دیکھیں اور سنیں',

    voiceGuideBtn: 'آواز والا رہنما (اردو / پشتو)',
    voiceModalTitle: 'بولنے والا کسان دوست (انسانی آواز)',
    voiceModalSubtitle: 'نیچے اپنی زبان منتخب کریں اور بٹن دبائیں، کسان دوست آپ کو آسان الفاظ میں پورا مشورہ سنائے گا',
    voiceChooseLang: '۱. اپنی زبان منتخب کریں:',
    voiceChooseSpeaker: '۲. کس کی آواز سننا چاہتے ہیں؟',
    speakerElder: 'چاچا / کاکا (تجربہ کار کسان دوست)',
    speakerFemale: 'باجی / خور (زرعی ماہر بہن)',
    playAdviceBtn: 'مشورہ آواز میں سنیں',
    playingAudioText: 'کسان دوست بول رہا ہے... دھیان سے سنیں',
    preparingVoiceText: 'آواز تیار ہو رہی ہے، بس ایک لمحہ...',

    scanModalTitle: 'خراب پتے کی تصویر دکھائیں',
    takePhoto: 'کیمرے سے تصویر کھینچیں',
    uploadImage: 'موبائل سے تصویر لگائیں',
    useSampleImage: 'یا چیک کرنے کے لیے نیچے دی گئی کسی ایک تصویر پر ہاتھ لگائیں:',
    cameraAccessPrompt: 'پتے کو کیمرے کے سامنے صاف رکھیں',
    selectCropLabel: 'کونسی فصل ہے؟',
    selectStageLabel: 'فصل کی حالت',
    startAnalysisBtn: 'پتہ چیک کریں اور مشورہ سنیں',
    consentCheckbox: 'میرے گاؤں کے دوسرے کسان بھائیوں کو بھی خبردار کریں (آپ کا نام خفیہ رہے گا)',

    analyzingTitle: 'کسان دوست پتہ دیکھ رہا ہے...',
    stepDetectingCrop: 'پتہ چیک ہو رہا ہے',
    stepIdentifyingDisease: 'بیماری دیکھی جا رہی ہے',
    stepCheckingWeather: 'آج کا موسم اور بارش دیکھی جا رہی ہے',
    stepRetrievingKnowledge: 'صحیح دوائی تلاش کی جا رہی ہے',
    stepGeneratingRecommendation: 'آپ کی زبان میں آواز تیار ہو رہی ہے',
    estimatedTime: 'صرف چند سیکنڈ انتظار کریں...',

    diagnosisTitle: 'فصل کا حال اور آسان علاج',
    severityLabel: 'خطرے کا نشان',
    confidenceLabel: 'تسلی',
    recommendedActionTitle: 'ابھی کیا کرنا ہے؟',
    bestSprayWindow: 'اسپرے کا صحیح وقت',
    whyTitle: 'یہ مشورہ کیوں دیا گیا؟',
    weatherSummaryTitle: 'آج کا موسم اور بارش',
    nextReviewDate: 'دوبارہ کب دیکھیں؟',
    consultOfficerAlert: 'بیماری زیادہ ہے — سرکاری زراعت آفیسر سے مفت مشورہ کریں (فون: 1925)',
    listenVoice: 'اردو آواز میں سنیں',
    stopVoice: 'آواز روکیں',
    shareBtn: 'واٹس ایپ پر بھیجیں',
    saveBtn: 'محفوظ کریں',
    feedbackHelpful: 'کیا آپ کو یہ مشورہ آسانی سے سمجھ آ گیا؟',
    feedbackNotHelpful: 'سمجھ نہیں آیا',
    feedbackThankYou: 'شکریہ کسان بھائی! اللہ آپ کی فصل میں برکت ڈالے۔',

    step1Title: '۱. فصل کو کیا بیماری ہے؟',
    step2Title: '۲. اسپرے کب کریں؟ (موسم کا حال)',
    step3Title: '۳. کونسی دوائی اور کتنی مقدار ڈالیں؟',
    homeRemedyTitle: 'بغیر پیسوں کے دیسی اور گھریلو طریقہ:',

    sevHealthy: 'بالکل ٹھیک (محفوظ)',
    sevMild: 'تھوڑی بیماری (احتیاط)',
    sevModerate: 'درمیانی بیماری (علاج کریں)',
    sevSevere: 'زیادہ خطرہ (فوری علاج)',

    verifierTitle: 'دوائی اصلی ہے یا نقصان دہ؟ یہاں چیک کریں',
    verifierSubtitle: 'دکاندار سے دوائی خریدنے سے پہلے نیچے دوائی کے نام پر ہاتھ لگائیں اور جانیں کہ یہ آپ کی فصل کے لیے ٹھیک ہے یا نہیں',
    searchPesticidePlaceholder: 'دوائی کا نام لکھیں یا نیچے بٹن دبائیں...',
    verifyBottleBtn: 'دوائی چیک کریں',
    dosageLabel: 'ایک ایکڑ میں کتنی دوائی ڈالیں؟',
    safetyAdviceLabel: 'اسپرے کرتے وقت ضروری احتیاط:',
    withholdingLabel: 'پھل یا فصل کاٹنے سے کتنے دن پہلے اسپرے روکیں؟',
    alternativeRemedies: 'دیسی اور سستے طریقے',
    warningRestricted: 'خبردار! یہ دوائی فصل جلا دے گی — ہرگز استعمال نہ کریں',

    communityTitle: 'آپ کے ضلع اور گاؤں کی خبر',
    communitySubtitle: 'معلوم کریں کہ آپ کے آس پاس کے علاقوں میں کونسی بیماری پھیل رہی ہے تاکہ آپ پہلے سے احتیاط کر سکیں',
    activeHotspots: 'زیادہ بیماری والے علاقے',
    totalAnonymousReports: 'کسانوں کی اطلاعات',
    districtSurveillance: 'اپنے ضلع پر ہاتھ لگائیں:',
    outbreakAlert: 'گاؤں کے لیے ضروری الرٹ',

    govTitle: 'محکمہ زراعت خیبر پختونخوا ڈیش بورڈ',
    govBadge: 'زرعی افسر ویو',
    districtOverview: 'اضلاع کی صورتحال',
    diseaseDistribution: 'بیماریوں کا تناسب',
    exportReportBtn: 'رپورٹ پرنٹ کریں',
    broadcastAlertBtn: 'کسانوں کو پیغام بھیجیں',
    broadcastModalTitle: 'کسانوں کے لیے الرٹ جاری کریں',
  },
  ps: {
    appName: 'کسان دوست',
    tagline: 'صرف یو تصویر واخلئ — په خپله پښتو ژبه کې مشوره واورئ',
    navHome: 'زما پټی',
    navScan: 'تصویر واخلئ',
    navFarms: 'زما فصلونه',
    navHistory: 'زړه ریکارډ',
    navCommunity: 'د کلي خبر',
    navVerify: 'دوایي چیک کړئ',
    navGov: 'زراعت افسر',
    navProfile: 'پروفایل',

    greeting: 'السلام علیکم، احمد زمینداره وروره!',
    yourFarm: 'ستاسو پټی',
    scanCropBtn: 'د پاڼې تصویر واخلئ',
    scanSubtext: 'لوستلو ته ضرورت نشته! تصویر واخلئ او په ساده پښتو یا اردو غږ کې پوره علاج واورئ',
    recentScan: 'ستاسو د فصل تازه حال',
    nearbyAlertsTitle: 'د شاوخوا کلیو خبر',
    nearbyAlertBadge: 'په مردان کې د ټماټرو د پاڼو بیماري خپریږي',
    viewDetails: 'پوره مشوره وګورئ او واورئ',

    voiceGuideBtn: 'غږ والا لارښود (پښتو / اردو)',
    voiceModalTitle: 'خبرې کوونکی کسان دوست (اصلي پښتو غږ)',
    voiceModalSubtitle: 'لاندې خپله ژبه وټاکئ او بټن کېکاږئ، کسان دوست به تاسو ته د مردان په ساده پښتو کې پوره مشوره واوروي',
    voiceChooseLang: '۱. خپله ژبه وټاکئ:',
    voiceChooseSpeaker: '۲. د چا غږ اورېدل غواړئ؟',
    speakerElder: 'کاکا / مشر کسان دوست (تجربه کار زمیندار)',
    speakerFemale: 'خور / باجي (د زراعت ماهره خور)',
    playAdviceBtn: 'مشوره په غږ کې واورئ',
    playingAudioText: 'کسان دوست خبرې کوي... په غور یې واورئ',
    preparingVoiceText: 'غږ تیارېږي، بس یوه لحظه صبر وکړئ...',

    scanModalTitle: 'د خرابې پاڼې تصویر وښایئ',
    takePhoto: 'په کیمره تصویر واخلئ',
    uploadImage: 'له موبایل نه تصویر راواخلئ',
    useSampleImage: 'یا د چیک کولو لپاره لاندې پر یو تصویر ګوته کېږدئ:',
    cameraAccessPrompt: 'پاڼه صافه د کیمرې مخې ته ونیسئ',
    selectCropLabel: 'کوم فصل دی؟',
    selectStageLabel: 'د فصل حالت',
    startAnalysisBtn: 'پاڼه چیک کړئ او مشوره واورئ',
    consentCheckbox: 'زما د کلي نورو زمیندارانو ته هم خبر ورکړئ (ستاسو نوم به پټ وي)',

    analyzingTitle: 'کسان دوست پاڼه ګوري...',
    stepDetectingCrop: 'پاڼه چیک کیږي',
    stepIdentifyingDisease: 'بیماري معلومیږي',
    stepCheckingWeather: 'د نن موسم او باران کتل کیږي',
    stepRetrievingKnowledge: 'صحیح دوایي لټول کیږي',
    stepGeneratingRecommendation: 'په پښتو کې غږ تیارېږي',
    estimatedTime: 'صرف څو ثانیې انتظار وکړئ...',

    diagnosisTitle: 'د فصل حال او اسان علاج',
    severityLabel: 'د خطر نخښه',
    confidenceLabel: 'تسلي',
    recommendedActionTitle: 'اوس باید څه وکړئ؟',
    bestSprayWindow: 'د سپرے کولو صحیح وخت',
    whyTitle: 'دا مشوره ولې درکړل شوه؟',
    weatherSummaryTitle: 'د نن موسم او باران',
    nextReviewDate: 'دوباره کله وګورئ؟',
    consultOfficerAlert: 'بیماري زیاته ده — له سرکاري زراعت افسر سره مفت مشوره وکړئ (فون: 1925)',
    listenVoice: 'په پښتو غږ واورئ',
    stopVoice: 'غږ ودرول',
    shareBtn: 'په واټس اپ ولېږئ',
    saveBtn: 'محفوظ کړئ',
    feedbackHelpful: 'ایا تاسو په دې مشوره اسانه پوه شوئ؟',
    feedbackNotHelpful: 'پوه نه شوم',
    feedbackThankYou: 'مننه زمینداره وروره! الله دې ستاسو په فصل کې برکت واچوي.',

    step1Title: '۱. په فصل باندې کومه بیماري ده؟',
    step2Title: '۲. سپرے کله وکړئ؟ (د موسم حال)',
    step3Title: '۳. کومه دوایي او څومره اندازه واچوئ؟',
    homeRemedyTitle: 'بې له پیسو دیسي او کلیواله طریقه:',

    sevHealthy: 'بالکل روغ (محفوظ)',
    sevMild: 'لږه بیماري (احتیاط)',
    sevModerate: 'درمیانه بیماري (علاج وکړئ)',
    sevSevere: 'زیات خطر (زر علاج وکړئ)',

    verifierTitle: 'دوایي اصلي ده که نقلي؟ دلته چیک کړئ',
    verifierSubtitle: 'له دوکاندار نه د دوایۍ اخیستلو مخکې لاندې د دوایۍ پر نوم ګوته کېږدئ او وګورئ چې ستاسو د فصل لپاره سمه ده که نه',
    searchPesticidePlaceholder: 'د دوایۍ نوم ولیکئ یا لاندې بټن کېکاږئ...',
    verifyBottleBtn: 'دوایي چیک کړئ',
    dosageLabel: 'په یو ایکړ کې څومره دوایي واچوئ؟',
    safetyAdviceLabel: 'د سپرے کولو په وخت ضروري احتیاط:',
    withholdingLabel: 'له فصل شکولو څو ورځې مخکې سپرے بند کړئ؟',
    alternativeRemedies: 'دیسي او ارزانه طریقې',
    warningRestricted: 'خبردار! دا دوایي به ستاسو فصل وسوځوي — بالکل یې مه استعمالوئ',

    communityTitle: 'ستاسو د ضلعې او کلي خبر',
    communitySubtitle: 'پوه شئ چې ستاسو په شاوخوا کلیو کې کومه بیماري خپره شوې ترڅو مخکې له مخکې احتیاط وکړئ',
    activeHotspots: 'د زیاتې بیمارۍ علاقې',
    totalAnonymousReports: 'د زمیندارانو اطلاعات',
    districtSurveillance: 'خپله ضلع وټاکئ:',
    outbreakAlert: 'د کلي لپاره ضروري الرټ',

    govTitle: 'د خیبر پښتونخوا د زراعت محکمې ډشبورډ',
    govBadge: 'د زراعت افسر پاڼه',
    districtOverview: 'د ضلعو صورتحال',
    diseaseDistribution: 'د بیماریو تناسب',
    exportReportBtn: 'راپور پرنټ کړئ',
    broadcastAlertBtn: 'زمیندارانو ته پیغام ولېږئ',
    broadcastModalTitle: 'زمیندارانو ته الرټ جاري کړئ',
  },
  en: {
    appName: 'KissanDost',
    tagline: 'Take one photo — Listen to clear advice in Urdu, Pashto, or English',
    navHome: 'My Field',
    navScan: 'Take Photo',
    navFarms: 'My Crops',
    navHistory: 'History',
    navCommunity: 'Village Alert',
    navVerify: 'Check Medicine',
    navGov: 'Officer View',
    navProfile: 'Profile',

    greeting: 'Salam, Farmer Ahmad!',
    yourFarm: 'Your Field',
    scanCropBtn: 'Take Leaf Photo',
    scanSubtext: 'No reading needed! Take a photo and listen to the complete treatment in human Urdu or Pashto voice',
    recentScan: 'Latest Crop Check',
    nearbyAlertsTitle: 'Nearby Village Alerts',
    nearbyAlertBadge: 'Tomato Leaf Blight spreading in Mardan',
    viewDetails: 'See & Listen to Full Advice',

    voiceGuideBtn: 'Voice Guide (Urdu / Pashto)',
    voiceModalTitle: 'Speaking KissanDost (Natural Human Voice)',
    voiceModalSubtitle: 'Pick your language below and press Play. KissanDost will explain the full crop advice in simple, everyday words.',
    voiceChooseLang: '1. Choose Language:',
    voiceChooseSpeaker: '2. Choose Speaker Voice:',
    speakerElder: 'Chacha / Kaka (Elder Farmer Advisor)',
    speakerFemale: 'Baji / Khor (Sister Agri Advisor)',
    playAdviceBtn: 'Play Voice Advice Now',
    playingAudioText: 'KissanDost is speaking... Listen carefully',
    preparingVoiceText: 'Preparing natural voice, one moment...',

    scanModalTitle: 'Show Photo of Sick Leaf',
    takePhoto: 'Take Photo with Camera',
    uploadImage: 'Pick Photo from Phone',
    useSampleImage: 'Or tap any sample leaf picture below to test:',
    cameraAccessPrompt: 'Hold the leaf clearly in front of the camera',
    selectCropLabel: 'Which Crop?',
    selectStageLabel: 'Crop Stage',
    startAnalysisBtn: 'Check Leaf & Hear Advice',
    consentCheckbox: 'Warn other farmers in my village if disease is found (your name stays private)',

    analyzingTitle: 'KissanDost is checking your leaf...',
    stepDetectingCrop: 'Looking at the leaf',
    stepIdentifyingDisease: 'Finding the problem',
    stepCheckingWeather: 'Checking today’s rain & wind',
    stepRetrievingKnowledge: 'Picking the safest medicine',
    stepGeneratingRecommendation: 'Preparing voice advice',
    estimatedTime: 'Wait just a few seconds...',

    diagnosisTitle: 'Crop Condition & Simple Plan',
    severityLabel: 'Danger Level',
    confidenceLabel: 'Certainty',
    recommendedActionTitle: 'What To Do Now',
    bestSprayWindow: 'Best Time to Spray',
    whyTitle: 'Why this advice?',
    weatherSummaryTitle: 'Today’s Weather & Rain',
    nextReviewDate: 'When to check again?',
    consultOfficerAlert: 'Serious problem — Call Free Agriculture Helpline (1925)',
    listenVoice: 'Listen in Voice',
    stopVoice: 'Stop Voice',
    shareBtn: 'Send on WhatsApp',
    saveBtn: 'Save to My Field',
    feedbackHelpful: 'Was this advice easy to understand?',
    feedbackNotHelpful: 'Hard to understand',
    feedbackThankYou: 'Thank you! May your harvest be blessed.',

    step1Title: '1. What is the problem on the crop?',
    step2Title: '2. When should I spray? (Weather Check)',
    step3Title: '3. Which medicine and how much to mix?',
    homeRemedyTitle: 'Free Home & Desi Methods:',

    sevHealthy: 'Healthy & Safe',
    sevMild: 'Small Problem (Watch)',
    sevModerate: 'Medium Problem (Treat)',
    sevSevere: 'High Danger (Act Fast)',

    verifierTitle: 'Is This Medicine Safe or Fake? Check Here',
    verifierSubtitle: 'Before buying from a dealer, tap a medicine below to see if it is safe for your crop or dangerous.',
    searchPesticidePlaceholder: 'Type medicine name or tap a button below...',
    verifyBottleBtn: 'Check Medicine',
    dosageLabel: 'How much to mix for 1 Acre?',
    safetyAdviceLabel: 'Safety Rules While Spraying:',
    withholdingLabel: 'When to stop spraying before harvest?',
    alternativeRemedies: 'Desi & Natural Options',
    warningRestricted: 'DANGER! This chemical will burn your crop — DO NOT USE',

    communityTitle: 'Your Village & District News',
    communitySubtitle: 'See which crop diseases are spreading near your village so you can protect your field early',
    activeHotspots: 'High Disease Areas',
    totalAnonymousReports: 'Farmer Reports',
    districtSurveillance: 'Tap Your District:',
    outbreakAlert: 'Village Warning',

    govTitle: 'KP Agriculture Extension Dashboard',
    govBadge: 'Officer View',
    districtOverview: 'District Status',
    diseaseDistribution: 'Disease Share',
    exportReportBtn: 'Print Report',
    broadcastAlertBtn: 'Send Alert to Farmers',
    broadcastModalTitle: 'Send District Alert',
  },
};
