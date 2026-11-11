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
    tagline: 'یوازې یو انځور واخلئ — په خپله ژبه په غږ کې مشوره واورئ',
    navHome: 'زما پټی',
    navScan: 'انځور واخلئ',
    navFarms: 'زما کښتونه',
    navHistory: 'زړه تاریخچه',
    navCommunity: 'د کلي خبر',
    navVerify: 'درمل وګورئ',
    navGov: 'زراعت افسر',
    navProfile: 'پېژندنه',

    greeting: 'السلام علیکم، احمد زمینداره وروره!',
    yourFarm: 'ستاسو پټی (کښت)',
    scanCropBtn: 'د پاڼې انځور واخلئ',
    scanSubtext: 'لوستلو ته اړتیا نشته! انځور واخلئ او په پښتو یا اردو غږ کې بشپړه درملنه واورئ',
    recentScan: 'ستاسو د فصل تازه حال',
    nearbyAlertsTitle: 'د شاوخوا کلیو خبرتیا',
    nearbyAlertBadge: 'په مردان کې د رومیانو د پاڼو ناروغي خپره شوې ده',
    viewDetails: 'بشپړه مشوره وګورئ او واورئ',

    voiceGuideBtn: 'غږیز لارښود (پښتو / اردو)',
    voiceModalTitle: 'غږیدونکی کسان دوست (اصلي انساني غږ)',
    voiceModalSubtitle: 'لاندې خپله ژبه وټاکئ او تڼۍ کېکاږئ، کسان دوست به تاسو ته په ساده پښتو کې ټوله مشوره واوروي',
    voiceChooseLang: '۱. خپله ژبه وټاکئ:',
    voiceChooseSpeaker: '۲. د چا غږ اورېدل غواړئ؟',
    speakerElder: 'کاکا / مشر لارښود (تجربه کار زمیندار)',
    speakerFemale: 'خور / باجي (د کرنې پوهه خور)',
    playAdviceBtn: 'مشوره په غږ کې واورئ',
    playingAudioText: 'کسان دوست خبرې کوي... په غور یې واورئ',
    preparingVoiceText: 'غږ چمتو کیږي، یوه شیبه صبر وکړئ...',

    scanModalTitle: 'د خرابې پاڼې انځور وښایاست',
    takePhoto: 'په کیمره انځور واخلئ',
    uploadImage: 'له موبایل څخه انځور راواخلئ',
    useSampleImage: 'یا د ازموینې لپاره لاندې پر یوه انځور ګوته کېږدئ:',
    cameraAccessPrompt: 'پاڼه سمه د کیمرې مخې ته ونیسئ',
    selectCropLabel: 'کوم فصل دی؟',
    selectStageLabel: 'د کښت حالت',
    startAnalysisBtn: 'پاڼه وګورئ او مشوره واورئ',
    consentCheckbox: 'زما د کلي نورو زمیندارانو ته هم خبر ورکړئ (ستاسو نوم پټ ساتل کیږي)',

    analyzingTitle: 'کسان دوست پاڼه ګوري...',
    stepDetectingCrop: 'پاڼه کتل کیږي',
    stepIdentifyingDisease: 'ناروغي معلومیږي',
    stepCheckingWeather: 'د نن ورځې هوا او باران کتل کیږي',
    stepRetrievingKnowledge: 'سم درمل لټول کیږي',
    stepGeneratingRecommendation: 'په پښتو ژبه غږ چمتو کیږي',
    estimatedTime: 'یوازې څو ثانیې صبر وکړئ...',

    diagnosisTitle: 'د فصل حال او اسانه علاج',
    severityLabel: 'د خطر نښه',
    confidenceLabel: 'ډاډ',
    recommendedActionTitle: 'اوس باید څه وکړئ؟',
    bestSprayWindow: 'د درمل شیندلو سم وخت',
    whyTitle: 'ولې دا مشوره درکړل شوه؟',
    weatherSummaryTitle: 'د نن هوا او باران',
    nextReviewDate: 'بیا کله وګورئ؟',
    consultOfficerAlert: 'ناروغي زیاته ده — له دولتي زراعت افسر سره وړیا مشوره وکړئ (شمېره: 1925)',
    listenVoice: 'په پښتو غږ واورئ',
    stopVoice: 'غږ بند کړئ',
    shareBtn: 'په واټس اپ ولېږئ',
    saveBtn: 'خوندي کړئ',
    feedbackHelpful: 'ایا تاسو په دې مشوره په اسانۍ پوه شوئ؟',
    feedbackNotHelpful: 'پوه نه شوم',
    feedbackThankYou: 'مننه زمینداره وروره! الله دې ستاسو په فصل کې برکت واچوي.',

    step1Title: '۱. په فصل کومه ناروغي ده؟',
    step2Title: '۲. درمل کله وشیندئ؟ (د هوا حال)',
    step3Title: '۳. کوم درمل او څومره اندازه واچوئ؟',
    homeRemedyTitle: 'بې له پیسو کلیوالي او کورنۍ طریقه:',

    sevHealthy: 'بالکل روغ (خوندي)',
    sevMild: 'لږه ناروغي (پام کوئ)',
    sevModerate: 'منځنۍ ناروغي (درملنه وکړئ)',
    sevSevere: 'زیات خطر (ژر درملنه وکړئ)',

    verifierTitle: 'درمل اصلي دي که تاواني؟ دلته یې وګورئ',
    verifierSubtitle: 'له دوکاندار څخه د درملو اخیستلو مخکې لاندې د درملو پر نوم ګوته کېږدئ او پوه شئ چې ستاسو د فصل لپاره سم دي که نه',
    searchPesticidePlaceholder: 'د درملو نوم ولیکئ یا لاندې تڼۍ کېکاږئ...',
    verifyBottleBtn: 'درمل وګورئ',
    dosageLabel: 'په یو ایکړ کې څومره درمل واچوئ؟',
    safetyAdviceLabel: 'د درمل شیندلو پر وخت ضروري احتیاط:',
    withholdingLabel: 'له حاصل شکولو څو ورځې مخکې درمل بند کړئ؟',
    alternativeRemedies: 'کلیوالي او ارزانه لارې',
    warningRestricted: 'پام کوئ! دا درمل به ستاسو فصل وسوځوي — هیڅکله یې مه کاروئ',

    communityTitle: 'ستاسو د ولسوالۍ او کلي خبر',
    communitySubtitle: 'پوه شئ چې ستاسو په شاوخوا سیمو کې کومه ناروغي خپره شوې ترڅو مخکې له مخکې احتیاط وکړئ',
    activeHotspots: 'د زیاتې ناروغۍ سیمې',
    totalAnonymousReports: 'د زمیندارانو راپورونه',
    districtSurveillance: 'خپله ولسوالي وټاکئ:',
    outbreakAlert: 'د کلي لپاره ضروري خبرداری',

    govTitle: 'د خیبر پښتونخوا د کرنې ریاست ډشبورډ',
    govBadge: 'د زراعت افسر پاڼه',
    districtOverview: 'د ولسوالیو حالت',
    diseaseDistribution: 'د ناروغیو کچه',
    exportReportBtn: 'راپور چاپ کړئ',
    broadcastAlertBtn: 'زمیندارانو ته پیغام ولېږئ',
    broadcastModalTitle: 'زمیندارانو ته خبرداری خپور کړئ',
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
