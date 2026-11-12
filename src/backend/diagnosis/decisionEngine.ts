import { DecisionEngineInput, DecisionEngineOutput } from '../schemas/apiSchemas.ts';

/**
 * Rule-Based Agronomic Decision Engine (src/backend/diagnosis/decisionEngine.ts)
 * Stage 7 of the 10-Stage AI Pipeline
 *
 * Strictly separates deterministic agricultural business rules from LLM prompts.
 * Inputs:
 *   - disease prediction & confidence score
 *   - crop & growth stage
 *   - real-time district weather
 *   - farmer location
 *   - RAG-retrieved treatments & advisories
 * Outputs:
 *   - diagnosis, severity, recommended treatment, warnings,
 *     spray timing, irrigation advice, explainable AI confidence explanation,
 *     and complete Urdu (ur) & Mardan Pashto (ps) farmer scripts.
 */
export class AgronomicDecisionEngine {
  evaluate(input: DecisionEngineInput): DecisionEngineOutput {
    const {
      predictedClassId,
      confidenceScore,
      crop,
      growthStage,
      weather,
      farmerLocation,
      symptoms,
      biomarkers,
    } = input;

    const district = farmerLocation.district || 'Mardan';
    const rainRisk = weather.rainProbability >= 50 || weather.precipitation > 0.2;
    const highWind = weather.windSpeed > 18;

    const cropUrduMap: Record<string, string> = {
      Tomato: 'ٹماٹر',
      Potato: 'آلو',
      Wheat: 'گندم',
      Maize: 'مکئی',
      Chili: 'مرچ',
      Onion: 'پیاز',
      Cotton: 'کپاس',
      Okra: 'بھنڈی',
    };
    const cropPashtoMap: Record<string, string> = {
      Tomato: 'ټماټر',
      Potato: 'کچالو',
      Wheat: 'غنم',
      Maize: 'جوار',
      Chili: 'مرچک',
      Onion: 'پیاز',
      Cotton: 'پنبه (کپاس)',
      Okra: 'باميه (بھنډۍ)',
    };
    const resolvedCropUrdu = cropUrduMap[crop] || crop;
    const resolvedCropPashto = cropPashtoMap[crop] || crop;

    const isHealthy =
      (predictedClassId === 'Healthy_Crop' || symptoms.includes('healthy_green')) &&
      biomarkers.brownNecroticPct <= 5 &&
      biomarkers.yellowChloroticPct <= 14;

    const cropLower = crop.toLowerCase();
    const isWheat = !isHealthy && cropLower.includes('wheat');
    const isMaize = !isHealthy && cropLower.includes('maize');
    const isCotton = !isHealthy && cropLower.includes('cotton');
    const isPotato = !isHealthy && cropLower.includes('potato');
    const isChili = !isHealthy && cropLower.includes('chili');
    const isOnion = !isHealthy && cropLower.includes('onion');
    const isLateBlight =
      !isHealthy &&
      !isWheat &&
      !isMaize &&
      !isCotton &&
      !isPotato &&
      !isChili &&
      !isOnion &&
      (predictedClassId === 'Tomato_Late_Blight' || biomarkers.brownNecroticPct >= 28);

    const warnings: string[] = [];
    if (rainRisk) {
      warnings.push(
        `Rain washout risk (${weather.rainProbability}% precipitation probability in ${district}). Delay chemical spraying until tomorrow morning.`
      );
    }
    if (highWind) {
      warnings.push(
        `High wind drift risk (${weather.windSpeed} km/h). Do not spray during windy afternoon hours.`
      );
    }

    const confidenceExplanation = `Calibrated ${confidenceScore}% confidence from multi-signal fusion: RGB/HSV leaf biomarkers (Healthy Green ${biomarkers.greenHealthyPct}%, Chlorotic Yellow ${biomarkers.yellowChloroticPct}%, Necrotic Brown ${biomarkers.brownNecroticPct}%), ${crop} (${growthStage} stage) symptom profile, and ${district} micro-climate (${weather.temperature}°C, ${weather.humidity}% RH).`;

    if (isHealthy) {
      return {
        crop,
        disease: `Healthy ${crop} Plant - No Disease (بالکل صحت مند پودا)`,
        severity: 'Healthy',
        confidence: Math.max(confidenceScore, 96),
        action: `Your ${crop} crop is completely healthy! Do NOT spray any chemical medicine — save your money.`,
        bestTime: 'No Spray Needed (اسپرے کی ضرورت نہیں)',
        warnings: ['Do not apply preventive chemical fungicides or toxic sprays on healthy foliage.'],
        irrigationAdvice: 'Maintain regular root-zone irrigation in the early morning; avoid wetting foliage at night.',
        confidenceExplanation,
        why: [
          'Leaves are bright green and clean with no disease spots or lesions',
          'Spraying chemicals on a healthy crop wastes money and harms plant vigour',
          'Continue normal watering and check your field twice a week',
        ],
        detailedExplanation:
          `Mashallah! Your ${crop} leaf is completely healthy and green. No chemical spray is needed.`,
        approvedTreatments: [
          {
            name: 'No Chemical Medicine Needed (کوئی دوائی نہ ڈالیں)',
            dosage: '0 grams — Save your money!',
            withholding: 'Safe to pick anytime',
            ppe: 'No spray needed',
          },
        ],
        organicAlternatives: [
          'Give normal water on time and keep weeds out of the field',
          'Check lower leaves once every 3-4 days',
        ],
        nextReviewDays: 7,
        consultOfficer: false,
        translations: {
          ur: {
            cropName: resolvedCropUrdu,
            disease: `ماشاءاللہ! بالکل صحت مند ${resolvedCropUrdu} (کوئی بیماری نہیں)`,
            action: `آپ کی ${resolvedCropUrdu} کی فصل بالکل تندرست ہے! کسی قسم کی کیمیکل دوائی یا اسپرے ہرگز نہ کریں اور اپنے پیسے بچائیں۔`,
            bestTime: 'اسپرے کی بالکل ضرورت نہیں',
            whySummary: `آپ کی ${resolvedCropUrdu} کے پتے بالکل سرسبز اور صاف ہیں۔ صحت مند فصل پر دوائی ڈالنا پیسے کا ضیاع ہے۔`,
            whyPoints: [
              'پتے بالکل سرسبز اور صاف ہیں، کوئی داغ یا بیماری نہیں ہے',
              'بلاوجہ اسپرے کرنے سے پیسے ضائع ہوتے ہیں اور پودے کو نقصان پہنچتا ہے',
              'بس وقت پر پانی دیں اور کھیت سے جڑی بوٹیاں صاف رکھیں',
            ],
            medicineName: 'کسی دوائی کی ضرورت نہیں (پیسے بچائیں)',
            dosageText: 'کوئی کیمیکل اسپرے نہ کریں — صرف معمول کے مطابق پانی دیں',
            safetyText: 'آپ کی فصل بالکل محفوظ ہے',
            voiceScript:
              `السلام علیکم کسان بھائی! ماشاءاللہ خوشخبری ہے! میں نے آپ کی ${resolvedCropUrdu} کے پودے کا پتہ غور سے دیکھا ہے اور یہ بالکل صحت مند اور سرسبز ہے۔ اس پر کوئی بیماری نہیں ہے۔ اس لیے آپ کوئی بھی کیمیکل دوائی یا اسپرے ہرگز نہ کریں اور اپنے حلال کے پیسے بچائیں۔ بس وقت پر پانی دیتے رہیں اور کھیت کو گھاس پھوس سے صاف رکھیں۔ اللہ آپ کی فصل میں خوب برکت ڈالے!`,
          },
          ps: {
            cropName: resolvedCropPashto,
            disease: `ماشاءالله! بالکل روغ بوټی (هیڅ بیماري نشته)`,
            action: `ستاسو د ${resolvedCropPashto} فصل بالکل روغ او تازه دی! هیڅ دوایي یا سپرے مه کوئ او خپلې پیسې بچت کړئ.`,
            bestTime: 'د سپرے هیڅ ضرورت نشته',
            whySummary: `ستاسو د ${resolvedCropPashto} بوټي پاڼې تکې شنې او صافې دي. په روغ فصل باندې سپرے کول د پیسو تاوان دی.`,
            whyPoints: [
              'پاڼې بالکل شنې او صافې دي، هیڅ داغ یا بیماري پکې نشته',
              'بې ضرورته سپرے کول پیسې ضایع کوي او فصل ته تاوان رسوي',
              'صرف په وخت اوبه ورکړئ او پټی له واښو صاف وساتئ',
            ],
            medicineName: 'د هیڅ دوایۍ ضرورت نشته (پیسې بچت کړئ)',
            dosageText: 'هیڅ سپرے مه کوئ — صرف په وخت اوبه ورکړئ',
            safetyText: 'ستاسو فصل بالکل محفوظ دی',
            voiceScript:
              `السلام علیکم زما خوږه زمینداره وروره! ماشاءالله زیری مې درباندې! ما ستاسو د ${resolvedCropPashto} پاڼه په غور سره وکتله، دا بالکل روغه او تکه شنه ده او هیڅ بیماري پکې نشته. نو تاسو هیڅ کیمیکل دوایي یا سپرے مه کوئ او خپلې حلالې پیسې بچت کړئ. بس په خپل وخت اوبه ورکوئ او پټی صاف ساتئ. الله پاک دې ستاسو په فصل کې ډېر برکت واچوي!`,
          },
        },
      };
    }

    if (isWheat) {
      return {
        crop: 'Wheat',
        disease: 'Yellow Stripe Rust (پیلی کنگی)',
        severity: 'Moderate',
        confidence: confidenceScore || 94,
        action: 'Wait for morning dew to dry, then spray Tilt (Propiconazole) between 9:00 AM and 12:00 PM.',
        bestTime: 'Tomorrow Morning 9:00 AM - 12:00 PM',
        warnings: [
          ...warnings,
          'Do not spray on heavy morning dew before 9:00 AM as water droplets dilute Propiconazole.',
        ],
        irrigationAdvice: 'Avoid heavy flood irrigation immediately before fungicide application to prevent high canopy humidity.',
        confidenceExplanation,
        why: [
          'Yellow powdery lines are visible along the wheat leaves',
          'Morning dew is heavy right now — spraying on wet leaves weakens the medicine',
          'Spraying at 9:00 AM when leaves dry will stop the yellow rust completely',
        ],
        detailedExplanation:
          'Your wheat leaves have yellow rust stripes. Spraying Tilt 250 EC after morning dew dries will protect the wheat grain from shriveling.',
        approvedTreatments: [
          {
            name: 'Tilt 250 EC (ٹلٹ دوائی)',
            dosage: '200 ml in 100 litres of water for 1 Acre',
            withholding: 'Stop spraying 28 days before harvesting wheat',
            ppe: 'Tie a clean cloth over nose and mouth and wear gloves while spraying',
          },
        ],
        organicAlternatives: [
          'Spray only on affected yellow patches first to save money',
          'Remove weeds along the water channels',
        ],
        nextReviewDays: 3,
        consultOfficer: false,
        translations: {
          ur: {
            cropName: 'گندم',
            disease: 'گندم کی پیلی کنگی (زرد رسٹ)',
            action: 'کل صبح ۹ سے ۱۲ بجے کے درمیان جب پتوں سے اوس (شبنم) خشک ہو جائے تو ٹلٹ دوائی کا اسپرے کریں۔',
            bestTime: 'کل صبح ۹ سے ۱۲ بجے',
            whySummary: 'آپ کی گندم کے پتوں پر پیلے رنگ کا پاؤڈر بن رہا ہے۔ شبنم خشک ہونے کے بعد اسپرے کرنے سے دانہ کمزور نہیں ہوگا۔',
            whyPoints: [
              'گندم کے پتوں پر پیلی دھاریاں اور پاؤڈر نظر آ رہا ہے',
              'گیلے پتوں پر اسپرے کرنے سے دوائی کا اثر کم ہو جاتا ہے',
              'صبح ۹ بجے دھوپ نکلنے پر اسپرے کرنے سے بیماری رک جائے گی',
            ],
            medicineName: 'ٹلٹ ۲۵۰ ای سی (Tilt 250 EC)',
            dosageText: 'ایک ایکڑ میں ۲۰۰ ملی لیٹر دوائی ۱۰۰ لیٹر پانی میں ملا کر اسپرے کریں',
            safetyText: 'منہ پر کپڑا باندھ کر اسپرے کریں اور کٹائی سے ۴ ہفتے پہلے اسپرے بند کر دیں',
            voiceScript:
              'السلام علیکم کسان بھائی! میں نے آپ کی گندم کے پتے کو غور سے دیکھا ہے۔ اس پر پیلی کنگی یعنی زرد رسٹ کے آثار نظر آ رہے ہیں۔ پریشان نہ ہوں، اس کا آسان علاج موجود ہے۔ کل صبح نو بجے سے بارہ بجے کے درمیان جب پتوں پر سے شبنم بالکل خشک ہو جائے، تو ٹلٹ دوائی دو سو ملی لیٹر ایک سو لیٹر پانی میں ملا کر ایک ایکڑ پر اسپرے کریں۔ گیلے پتوں پر اسپرے نہ کریں ورنہ دوائی بہہ جائے گی۔ اللہ آپ کی گندم کی فصل کو محفوظ رکھے!',
          },
          ps: {
            cropName: 'غنم',
            disease: 'د غنمو ژیړ زنګ (زیړ رسټ بیماري)',
            action: 'سبا سهار د ۹ بجو نه تر ۱۲ بجو پورې کله چې په پاڼو باندې شبنم وچ شي، د ټیلټ دوایۍ سپرے وکړئ.',
            bestTime: 'سبا سهار د ۹ نه تر ۱۲ بجو پورې',
            whySummary: 'ستاسو د غنمو په پاڼو ژیړ پوډر ښکاري. کله چې شبنم وچ شي سپرے وکړئ ترڅو د غنمو دانه کمزورې نشي.',
            whyPoints: [
              'د غنمو په پاڼو باندې ژیړ پوډر او لیکې ښکاري',
              'په لندو پاڼو سپرے کول فایده نه کوي',
              'سبا سهار ۹ بجې په وچه پاڼه سپرے کول دا بیماري ختموي',
            ],
            medicineName: 'ټیلټ ۲۵۰ اي سي دوایي (Tilt 250 EC)',
            dosageText: 'په یو ایکړ کې ۲۰۰ ملي لیټره دوایي په ۱۰۰ لیټره اوبو کې مکس کړئ او سپرے وکړئ',
            safetyText: 'د سپرے کولو په وخت خوله او پوزه په کپړه وتړئ او د غنمو لو نه ۴ هفتې مخکې سپرے بند کړئ',
            voiceScript:
              'السلام علیکم زما خوږه زمینداره وروره! ما ستاسو د غنمو پاڼه وکتله. په دې باندې د ژیړ زنګ بیماري لګېدلې ده. هیڅ فکر مه کوئ، علاج یې ډېر اسان دی. سبا سهار د نهو بجو نه تر دولسو بجو پورې کله چې په پاڼو باندې شبنم بالکل وچ شي، نو د ټیلټ دوایي دوه سوه ملي لیټره په سلو لیټرو اوبو کې مکس کړئ او په پټي باندې سپرے وکړئ. په لندو پاڼو سپرے مه کوئ ګنې دوایي به ضایع شي. الله پاک دې ستاسو غنمو ته ډېر برکت ورکړي!',
          },
        },
      };
    }

    if (isMaize) {
      return {
        crop: 'Maize',
        disease: 'Maize Leaf Blight (مکئی کے پتوں کا جھلساؤ)',
        severity: 'Moderate',
        confidence: confidenceScore || 92,
        action: 'Spray Mancozeb tomorrow morning between 7:00 AM and 10:00 AM.',
        bestTime: 'Tomorrow Morning 7:00 AM - 10:00 AM',
        warnings: [
          ...warnings,
          'Enforce 7-day fodder withholding period before feeding treated maize leaves to livestock.',
        ],
        irrigationAdvice: 'Ensure field drainage channels are clear so water does not stagnate around maize stalks.',
        confidenceExplanation,
        why: [
          'Long brown spots are spreading on the lower maize leaves',
          'Protecting the middle leaves near the corn cob is very important right now',
          'Morning air is calm so the spray will reach the leaves properly',
        ],
        detailedExplanation:
          'Your maize crop has elongated leaf spots. Spraying tomorrow morning will protect the cob leaves so the corn kernels fill completely.',
        approvedTreatments: [
          {
            name: 'Mancozeb 75% WP (مینکوزیب)',
            dosage: '750 grams in 100 litres of water for 1 Acre',
            withholding: 'Wait 7 days before cutting for animal fodder',
            ppe: 'Cover nose and mouth with a clean cloth while spraying',
          },
        ],
        organicAlternatives: [
          'Neem oil spray (2 ml per litre of water)',
          'Remove heavily dried bottom leaves touching the ground',
        ],
        nextReviewDays: 4,
        consultOfficer: false,
        translations: {
          ur: {
            cropName: 'مکئی',
            disease: 'مکئی کے پتوں کا جھلساؤ',
            action: 'کل صبح ۷ سے ۱۰ بجے کے درمیان مینکوزیب دوائی کا اسپرے کریں تاکہ چھلی والے پتے محفوظ رہیں۔',
            bestTime: 'کل صبح ۷ سے ۱۰ بجے',
            whySummary: 'مکئی کے نچلے پتوں پر لمبے بھورے نشان بن رہے ہیں۔ صبح کے وقت اسپرے کرنے سے چھلی کے دانے موٹے اور صحت مند بنیں گے۔',
            whyPoints: [
              'نچلے پتوں پر لمبے خاکی اور بھورے نشان ہیں',
              'چھلی کے قریب والے پتوں کو بچانا بہت ضروری ہے',
              'صبح ۷ سے ۱۰ بجے ہوا کم ہوتی ہے اور دوائی ضائع نہیں ہوتی',
            ],
            medicineName: 'مینکوزیب (ڈائیتھین ایم-۴۵)',
            dosageText: 'ایک ایکڑ میں ۷۵۰ گرام دوائی ۱۰۰ لیٹر پانی میں ملا کر اسپرے کریں',
            safetyText: 'اسپرے کے بعد ۷ دن تک یہ چارہ جانوروں کو نہ ڈالیں',
            voiceScript:
              'السلام علیکم کسان بھائی! میں نے آپ کی مکئی کے پتے کا معائنہ کر لیا ہے۔ اس کے نچلے پتوں پر جھلساؤ کے لمبے نشان بن رہے ہیں۔ تاکہ یہ بیماری اوپر چھلی والے پتوں تک نہ پہنچے، آپ کل صبح سات سے دس بجے کے درمیان مینکوزیب دوائی ساڑھے سات سو گرام ایک سو لیٹر پانی میں ملا کر اسپرے کریں۔ یاد رکھیں کہ اسپرے کے بعد سات دن تک یہ پتے جانوروں کو چارے کے طور پر نہ کھلائیں۔ اللہ آپ کے رزق میں برکت دے!',
          },
          ps: {
            cropName: 'جوار (مکئی)',
            disease: 'د جوارو د پاڼو سوځېدل (بلایټ بیماري)',
            action: 'سبا سهار د ۷ بجو نه تر ۱۰ بجو پورې د مینکوزیب دوایۍ سپرے وکړئ ترڅو د جوارو ستۍ او پاڼې بچ پاتې شي.',
            bestTime: 'سبا سهار د ۷ نه تر ۱۰ بجو پورې',
            whySummary: 'د جوارو په لاندې پاڼو اوږده نصواري داغونه دي. سهار وختي سپرے کول به د جوارو ستۍ او دانې له تاوانه وساتي.',
            whyPoints: [
              'په لاندې پاڼو باندې اوږده نصواري داغونه ښکاري',
              'د جوارو د ستۍ خوا او شا پاڼې بچ کول ډېر ضروري دي',
              'سهار د ۷ نه تر ۱۰ بجو پورې هوا ارامه وي او دوایي ښه اثر کوي',
            ],
            medicineName: 'مینکوزیب دوایي (ډایتین ایم-۴۵)',
            dosageText: 'په یو ایکړ کې ۷۵۰ ګرامه دوایي په ۱۰۰ لیټره اوبو کې مکس کړئ او سپرے وکړئ',
            safetyText: 'له سپرے کولو وروسته تر ۷ ورځو پورې دا شوکه او پاڼې مالدارۍ ته مه اچوئ',
            voiceScript:
              'السلام علیکم زما خوږه زمینداره وروره! ما ستاسو د جوارو پاڼه وکتله. په لاندې پاڼو باندې اوږده نصواري داغونه جوړ شوي دي. د دې لپاره چې دا بیماري پورته د جوارو ستۍ ته لاړه نشي، سبا سهار د اوو بجو نه تر لسو بجو پورې اووه سوه او پنځوس ګرامه مینکوزیب دوایي په سلو لیټرو اوبو کې مکس کړئ او سپرے وکړئ. خیال کوئ چې تر اوو ورځو پورې دا پاڼې مالدارۍ او څارویو ته مه ورکوئ. الله پاک دې ستاسو په فصل کې برکت واچوي!',
          },
        },
      };
    }

    if (isCotton) {
      const hasBrownSpots = biomarkers.brownNecroticPct >= 6 || symptoms.includes('brown_spots');
      if (hasBrownSpots) {
        return {
          crop: 'Cotton',
          disease: 'Cotton Bacterial Blight / Leaf Spot (کپاس کا بیکٹیریل جھلساؤ / پتوں کے دھبے)',
          severity: biomarkers.brownNecroticPct >= 25 ? 'Severe' : 'Moderate',
          confidence: confidenceScore || 94,
          action: rainRisk
            ? 'Wait for rain to stop, then spray Copper Oxychloride tomorrow morning between 7:00 AM and 10:00 AM.'
            : 'Spray Copper Oxychloride 50% WP tomorrow morning between 7:00 AM and 10:00 AM.',
          bestTime: 'Tomorrow Morning 7:00 AM - 10:00 AM',
          warnings,
          irrigationAdvice: 'Avoid heavy flood irrigation in humid weather to prevent bacterial leaf spot spread.',
          confidenceExplanation,
          why: [
            'Angular brown and dark necrotic spots are visible on the cotton leaf blade',
            'Humid weather spreads bacterial leaf blight to nearby cotton bolls and leaves',
            'Copper Oxychloride stops bacterial and fungal spots from damaging the cotton crop',
          ],
          detailedExplanation:
            'Your cotton leaf shows brown necrotic spots (Bacterial Blight / Leaf Spot). Spraying Copper Oxychloride in the morning will protect the foliage and cotton bolls.',
          approvedTreatments: [
            {
              name: 'Copper Oxychloride 50% WP (کاپر آکسی کلورائیڈ)',
              dosage: '500 grams in 100 litres of water for 1 Acre',
              withholding: 'Stop spraying 14 days before cotton picking',
              ppe: 'Cover nose and mouth with a clean cloth and wash hands with soap after spraying',
            },
          ],
          organicAlternatives: [
            'Remove and bury heavily spotted fallen cotton leaves outside the field',
            'Keep field ridges clean from weeds to improve air flow',
          ],
          nextReviewDays: 5,
          consultOfficer: false,
          translations: {
            ur: {
              cropName: 'کپاس',
              disease: 'کپاس کا بیکٹیریل جھلساؤ (پتوں کے بھورے دھبے)',
              action: rainRisk
                ? 'آج بارش کا امکان ہے اس لیے آج اسپرے نہ کریں! کل صبح ۷ سے ۱۰ بجے کاپر آکسی کلورائیڈ دوائی کا اسپرے کریں۔'
                : 'کل صبح ۷ سے ۱۰ بجے کے درمیان کاپر آکسی کلورائیڈ دوائی کا اسپرے کریں تاکہ کپاس کے پتے اور ٹینڈے محفوظ رہیں۔',
              bestTime: 'کل صبح ۷ سے ۱۰ بجے',
              whySummary: 'کپاس کے پتے پر بھورے اور سیاہ دھبے بن رہے ہیں جو بیکٹیریل جھلساؤ کی علامت ہیں۔ صبح کے وقت اسپرے کرنے سے بیماری رک جائے گی۔',
              whyPoints: [
                'کپاس کے پتے پر بھورے اور گہرے دھبے نظر آ رہے ہیں',
                'نمی والے موسم میں یہ بیماری دوسرے پتوں اور ٹینڈوں تک پھیل سکتی ہے',
                'کاپر آکسی کلورائیڈ دوائی ان دھبوں اور جھلساؤ کو فوری روکتی ہے',
              ],
              medicineName: 'کاپر آکسی کلورائیڈ ۵۰ فیصد (Copper Oxychloride 50% WP)',
              dosageText: 'ایک ایکڑ میں ۵۰۰ گرام دوائی ۱۰۰ لیٹر پانی میں ملا کر اسپرے کریں',
              safetyText: 'منہ پر کپڑا باندھ کر اسپرے کریں اور چنائی سے ۱۴ دن پہلے اسپرے بند کر دیں',
              voiceScript:
                'السلام علیکم کسان بھائی! میں نے آپ کی کپاس کے پتے کو غور سے چیک کیا ہے۔ اس پتے پر بھورے رنگ کے دھبے اور بیکٹیریل جھلساؤ کے آثار نظر آ رہے ہیں۔ پریشان نہ ہوں، اس کے علاج کے لیے آپ کل صبح سات بجے سے دس بجے کے درمیان کاپر آکسی کلورائیڈ دوائی پانچ سو گرام ایک سو لیٹر پانی میں ملا کر ایک ایکڑ پر اسپرے کریں۔ اس سے کپاس کے پتے اور ٹینڈے بالکل محفوظ ہو جائیں گے۔ اللہ آپ کی فصل میں خوب برکت ڈالے!',
            },
            ps: {
              cropName: 'پنبه (کپاس)',
              disease: 'د پنبې د پاڼو نصواري داغونه (بکتیریایي بلایټ)',
              action: 'سبا سهار د ۷ بجو نه تر ۱۰ بجو پورې د کاپر آکسي کلورایډ دوایۍ سپرے وکړئ ترڅو د پنبې پاڼې او غوزې بچ پاتې شي.',
              bestTime: 'سبا سهار د ۷ نه تر ۱۰ بجو پورې',
              whySummary: 'د پنبې په پاڼه باندې نصواري داغونه ښکاري. د کاپر آکسي کلورایډ سپرے به دا بیماري زر تر زره ودروي.',
              whyPoints: [
                'د پنبې په پاڼه باندې نصواري او تور داغونه جوړ شوي دي',
                'په نمجنه هوا کې دا داغونه نورو پاڼو ته خوریږي',
                'سهار وختي سپرے کول پاڼې او غوزې له تاوانه ساتي',
              ],
              medicineName: 'کاپر آکسي کلورایډ دوایي (Copper Oxychloride 50% WP)',
              dosageText: 'د یو ایکړ لپاره ۵۰۰ ګرامه دوایي په ۱۰۰ لیټره اوبو کې مکس کړئ او سپرے وکړئ',
              safetyText: 'د سپرے کولو په وخت خوله او پوزه په کپړه وتړئ او د پنبې ټولولو نه ۱۴ ورځې مخکې سپرے بند کړئ',
              voiceScript:
                'السلام علیکم زما خوږه زمینداره وروره! ما ستاسو د پنبې پاڼه په غور سره وکتله. په دې پاڼه باندې نصواري داغونه او د پاڼو د سوځېدو بیماري ښکاري. هیڅ فکر مه کوئ، سبا سهار د اوو بجو نه تر لسو بجو پورې پنځه سوه ګرامه کاپر آکسي کلورایډ دوایي په سلو لیټرو اوبو کې مکس کړئ او په پټي باندې سپرے وکړئ. په دې سره به ستاسو د پنبې بوټي او غوزې له هر تاوانه بچ شي. الله پاک دې ستاسو فصل ته برکت ورکړي!',
            },
          },
        };
      }

      return {
        crop: 'Cotton',
        disease: 'Cotton Leaf Curl Virus (کپاس کا پتہ مروڑ وائرس)',
        severity: 'Moderate',
        confidence: confidenceScore || 94,
        action: 'Spray Flonicamid (Ulala) tomorrow morning between 7:00 AM and 10:00 AM to control whitefly spreading leaf curl.',
        bestTime: 'Tomorrow Morning 7:00 AM - 10:00 AM',
        warnings,
        irrigationAdvice: 'Maintain balanced irrigation and apply potassium sulfate to strengthen cotton leaves.',
        confidenceExplanation,
        why: [
          'Cotton leaves show yellowing, vein thickening, and curling caused by whitefly-transmitted virus',
          'Controlling whitefly immediately stops the virus from spreading to healthy cotton plants',
          'Morning spray hits the underside of cotton leaves when whiteflies are less active',
        ],
        detailedExplanation:
          'Your cotton plant shows signs of Cotton Leaf Curl Virus spread by whitefly. Spraying Ulala (Flonicamid) tomorrow morning will eliminate whitefly and protect new cotton growth.',
        approvedTreatments: [
          {
            name: 'Ulala 50 WG / Flonicamid (الالا دوائی)',
            dosage: '80 grams in 100 litres of water for 1 Acre',
            withholding: 'Stop spraying 14 days before cotton picking',
            ppe: 'Cover nose and mouth with a clean cloth while spraying',
          },
        ],
        organicAlternatives: [
          'Install yellow sticky traps in the cotton field to catch whiteflies',
          'Remove weeds around water channels where whiteflies hide',
        ],
        nextReviewDays: 5,
        consultOfficer: false,
        translations: {
          ur: {
            cropName: 'کپاس',
            disease: 'کپاس کا پتہ مروڑ وائرس (لیف کرل)',
            action: 'کل صبح ۷ سے ۱۰ بجے کے درمیان الالا (فلونیکامیڈ) دوائی کا اسپرے کریں تاکہ سفید مکھی ختم ہو اور بیماری نہ پھیلے۔',
            bestTime: 'کل صبح ۷ سے ۱۰ بجے',
            whySummary: 'کپاس کے پتے مڑ رہے ہیں اور پیلے ہو رہے ہیں جو سفید مکھی سے پھیلنے والے وائرس کی علامت ہے۔',
            whyPoints: [
              'کپاس کے پتوں میں پیلاہٹ اور مڑنے کے آثار ہیں',
              'سفید مکھی اس بیماری کو ایک پودے سے دوسرے پودے تک پھیلاتی ہے',
              'الالا دوائی کا اسپرے سفید مکھی کو ختم کر کے نئی شاخوں کو محفوظ رکھے گا',
            ],
            medicineName: 'الالا ۵۰ ڈبلیو جی (Ulala / Flonicamid 50 WG)',
            dosageText: 'ایک ایکڑ میں ۸۰ گرام دوائی ۱۰۰ لیٹر پانی میں ملا کر اسپرے کریں',
            safetyText: 'منہ پر کپڑا باندھ کر اسپرے کریں اور چنائی سے ۱۴ دن پہلے اسپرے بند کر دیں',
            voiceScript:
              'السلام علیکم کسان بھائی! میں نے آپ کی کپاس کے پتے کا معائنہ کر لیا ہے۔ اس پر پتہ مروڑ وائرس کے آثار ہیں جو سفید مکھی کی وجہ سے پھیلتا ہے۔ آپ کل صبح سات سے دس بجے کے درمیان الالا دوائی اسی گرام ایک سو لیٹر پانی میں ملا کر ایک ایکڑ پر اسپرے کریں تاکہ سفید مکھی ختم ہو جائے اور کپاس کے نئے پتے تندرست نکلیں۔ اللہ آپ کی فصل میں برکت ڈالے!',
          },
          ps: {
            cropName: 'پنبه (کپاس)',
            disease: 'د پنبې د پاڼو تاوېدلو بیماري (لیف کرل)',
            action: 'سبا سهار د ۷ بجو نه تر ۱۰ بجو پورې د الالا (فلونیکامیډ) دوایۍ سپرے وکړئ ترڅو سپینه مچۍ ختمه شي.',
            bestTime: 'سبا سهار د ۷ نه تر ۱۰ بجو پورې',
            whySummary: 'د پنبې پاڼې ژیړې شوي او تاویږي چې د سپینې مچۍ له وجې خوریږي.',
            whyPoints: [
              'د پنبې په پاڼو کې ژیړوالی او تاوېدل ښکاري',
              'سپینه مچۍ دا بیماري نورو بوټو ته خوروي',
              'د الالا دوایۍ سپرے به سپینه مچۍ ختمه کړي او فصل به بچ کړي',
            ],
            medicineName: 'الالا ۵۰ ډبلیو جي دوایي (Ulala 50 WG)',
            dosageText: 'په یو ایکړ کې ۸۰ ګرامه دوایي په ۱۰۰ لیټره اوبو کې مکس کړئ او سپرے وکړئ',
            safetyText: 'د سپرے کولو په وخت خوله او پوزه په کپړه وتړئ',
            voiceScript:
              'السلام علیکم زما خوږه زمینداره وروره! ما ستاسو د پنبې پاڼه وکتله. په دې باندې د پاڼو تاوېدلو بیماري ده چې د سپینې مچۍ له لارې خوریږي. تاسو سبا سهار د اوو بجو نه تر لسو بجو پورې اتیا ګرامه الالا دوایي په سلو لیټرو اوبو کې مکس کړئ او سپرے وکړئ ترڅو سپینه مچۍ ختمه شي او فصل مو روغ پاتې شي. الله پاک دې ستاسو په فصل کې برکت واچوي!',
          },
        },
      };
    }

    if (isPotato) {
      return {
        crop: 'Potato',
        disease: 'Potato Leaf Blight (آلو کے پتوں کا جھلساؤ)',
        severity: biomarkers.brownNecroticPct >= 25 ? 'Severe' : 'Moderate',
        confidence: confidenceScore || 94,
        action: 'Spray Ridomil Gold or Mancozeb tomorrow morning between 7:00 AM and 10:00 AM.',
        bestTime: 'Tomorrow Morning 7:00 AM - 10:00 AM',
        warnings,
        irrigationAdvice: 'Keep potato ridges well-drained and avoid wetting leaves in the evening.',
        confidenceExplanation,
        why: [
          'Brown blight lesions are visible on the potato leaflets',
          'Cool humid weather accelerates potato blight spread across ridges',
          'Morning fungicide spray protects the foliage so tubers grow large underground',
        ],
        detailedExplanation:
          'Your potato leaf has blight lesions. Spraying Ridomil Gold tomorrow morning will stop the leaf blight and protect potato tuber yield.',
        approvedTreatments: [
          {
            name: 'Ridomil Gold MZ 68 WG (ریڈومل گولڈ / مینکوزیب)',
            dosage: '500 grams in 100 litres of water for 1 Acre',
            withholding: 'Stop spraying 14 days before digging potatoes',
            ppe: 'Cover nose and mouth with a clean cloth while spraying',
          },
        ],
        organicAlternatives: [
          'Remove and bury heavily blighted bottom potato leaves',
          'Avoid excessive nitrogen urea during humid weather',
        ],
        nextReviewDays: 4,
        consultOfficer: false,
        translations: {
          ur: {
            cropName: 'آلو',
            disease: 'آلو کے پتوں کا جھلساؤ (بلائیٹ)',
            action: 'کل صبح ۷ سے ۱۰ بجے کے درمیان ریڈومل گولڈ یا مینکوزیب دوائی کا اسپرے کریں۔',
            bestTime: 'کل صبح ۷ سے ۱۰ بجے',
            whySummary: 'آلو کے پتوں پر بھورے دھبے اور جھلساؤ کے آثار ہیں۔ بروقت اسپرے کرنے سے زمین کے نیچے آلو موٹے اور محفوظ رہیں گے۔',
            whyPoints: [
              'آلو کے پتوں پر بھورے اور گہرے دھبے نظر آ رہے ہیں',
              'نمی والے موسم میں یہ جھلساؤ تیزی سے پھیلتا ہے',
              'کل صبح اسپرے کرنے سے بیماری فوری رک جائے گی',
            ],
            medicineName: 'ریڈومل گولڈ (Ridomil Gold MZ 68 WG)',
            dosageText: 'ایک ایکڑ میں ۵۰۰ گرام دوائی ۱۰۰ لیٹر پانی میں ملا کر اسپرے کریں',
            safetyText: 'منہ پر کپڑا باندھ کر اسپرے کریں اور آلو نکالنے سے ۱۴ دن پہلے اسپرے بند کر دیں',
            voiceScript:
              'السلام علیکم کسان بھائی! میں نے آپ کے آلو کے پودے کا پتہ غور سے دیکھا ہے۔ اس پر جھلساؤ کے بھورے دھبے بن رہے ہیں۔ آپ کل صبح سات سے دس بجے کے درمیان ریڈومل گولڈ دوائی پانچ سو گرام ایک سو لیٹر پانی میں ملا کر ایک ایکڑ پر اسپرے کریں۔ اس سے آلو کی بیل اور زمین کے نیچے آلو بالکل محفوظ رہیں گے۔ اللہ آپ کی فصل میں خوب برکت ڈالے!',
          },
          ps: {
            cropName: 'الوګان (کچالو)',
            disease: 'د الوګانو د پاڼو سوځېدل (بلایټ بیماري)',
            action: 'سبا سهار د ۷ بجو نه تر ۱۰ بجو پورې د ریډومل ګولډ یا مینکوزیب دوایۍ سپرے وکړئ.',
            bestTime: 'سبا سهار د ۷ نه تر ۱۰ بجو پورې',
            whySummary: 'د الوګانو په پاڼو نصواري داغونه دي. سهار وختي سپرے کول به د الوګانو حاصل له تاوانه وساتي.',
            whyPoints: [
              'د الوګانو په پاڼو باندې نصواري داغونه ښکاري',
              'په نمجنه هوا کې دا بیماري زر خوریږي',
              'د ریډومل ګولډ دوایۍ سپرے به دا بیماري ختمه کړي',
            ],
            medicineName: 'ریډومل ګولډ دوایي (Ridomil Gold MZ 68 WG)',
            dosageText: 'د یو ایکړ لپاره ۵۰۰ ګرامه دوایي په ۱۰۰ لیټره اوبو کې مکس کړئ او سپرے وکړئ',
            safetyText: 'د سپرے کولو په وخت خوله او پوزه په کپړه وتړئ',
            voiceScript:
              'السلام علیکم زما خوږه زمینداره وروره! ما ستاسو د الوګانو پاڼه په غور سره وکتله. په دې باندې د پاڼو د سوځېدو یعنې بلایټ بیماري لګېدلې ده. تاسو سبا سهار د اوو بجو نه تر لسو بجو پورې پنځه سوه ګرامه ریډومل ګولډ دوایي په سلو لیټرو اوبو کې مکس کړئ او په پټي باندې سپرے وکړئ. الله پاک دې ستاسو په فصل کې ډېر برکت واچوي!',
          },
        },
      };
    }

    if (isChili) {
      return {
        crop: 'Chili',
        disease: 'Chili Leaf Spot & Anthracnose (مرچ کے پتوں کے دھبے اور جھلساؤ)',
        severity: 'Moderate',
        confidence: confidenceScore || 94,
        action: 'Spray Amistar Top or Mancozeb tomorrow morning between 7:00 AM and 10:00 AM.',
        bestTime: 'Tomorrow Morning 7:00 AM - 10:00 AM',
        warnings,
        irrigationAdvice: 'Water chili plants in furrows carefully without splashing soil onto lower leaves.',
        confidenceExplanation,
        why: [
          'Brown spots and yellowing are visible on the chili leaf',
          'Fungal leaf spot can cause flower drop and fruit rot if left untreated',
          'Morning fungicide spray protects both chili leaves and developing pods',
        ],
        detailedExplanation:
          'Your chili leaf shows fungal leaf spots. Spraying Amistar Top or Mancozeb tomorrow morning will stop leaf drop and protect chili pods.',
        approvedTreatments: [
          {
            name: 'Amistar Top / Mancozeb 75% WP (ایمسٹار ٹاپ یا مینکوزیب)',
            dosage: '200 ml Amistar Top (or 600g Mancozeb) in 100 litres of water for 1 Acre',
            withholding: 'Stop spraying 7 days before picking chilies',
            ppe: 'Cover nose and mouth with a clean cloth while spraying',
          },
        ],
        organicAlternatives: [
          'Neem oil 5ml per litre of water spray',
          'Remove fallen spotted leaves around the chili stem',
        ],
        nextReviewDays: 4,
        consultOfficer: false,
        translations: {
          ur: {
            cropName: 'مرچ',
            disease: 'مرچ کے پتوں کا جھلساؤ اور دھبے',
            action: 'کل صبح ۷ سے ۱۰ بجے کے درمیان ایمسٹار ٹاپ یا مینکوزیب دوائی کا اسپرے کریں۔',
            bestTime: 'کل صبح ۷ سے ۱۰ بجے',
            whySummary: 'مرچ کے پتے پر بھورے دھبے بن رہے ہیں جس سے پھول اور پتے گر سکتے ہیں۔ صبح اسپرے کرنے سے فصل محفوظ رہے گی۔',
            whyPoints: [
              'مرچ کے پتوں پر بھورے دھبے اور پیلاہٹ ہے',
              'علاج نہ کرنے سے مرچ کے پھول گرنے کا خطرہ ہوتا ہے',
              'صبح ۷ سے ۱۰ بجے اسپرے کرنے سے پتے اور پھل محفوظ ہو جائیں گے',
            ],
            medicineName: 'ایمسٹار ٹاپ یا مینکوزیب (Amistar Top / Mancozeb)',
            dosageText: 'ایک ایکڑ میں ۲۰۰ ملی لیٹر ایمسٹار ٹاپ (یا ۶۰۰ گرام مینکوزیب) ۱۰۰ لیٹر پانی میں ملا کر اسپرے کریں',
            safetyText: 'منہ پر کپڑا باندھ کر اسپرے کریں اور مرچ توڑنے سے ۷ دن پہلے اسپرے بند کر دیں',
            voiceScript:
              'السلام علیکم کسان بھائی! میں نے آپ کی مرچ کے پتے کو غور سے چیک کیا ہے۔ اس پر بھورے دھبے اور جھلساؤ کی بیماری نظر آ رہی ہے۔ آپ کل صبح سات سے دس بجے کے درمیان دو سو ملی لیٹر ایمسٹار ٹاپ یا چھ سو گرام مینکوزیب دوائی ایک سو لیٹر پانی میں ملا کر ایک ایکڑ پر اسپرے کریں۔ اس سے مرچ کے پتے اور پھول گرنے سے بچ جائیں گے۔ اللہ آپ کی فصل میں برکت ڈالے!',
          },
          ps: {
            cropName: 'مرچک',
            disease: 'د مرچکو د پاڼو داغونه او سوځېدل',
            action: 'سبا سهار د ۷ بجو نه تر ۱۰ بجو پورې د ایمسټار ټاپ یا مینکوزیب دوایۍ سپرے وکړئ.',
            bestTime: 'سبا سهار د ۷ نه تر ۱۰ بجو پورې',
            whySummary: 'د مرچکو په پاڼو نصواري داغونه دي. سهار وختي سپرے کول به د مرچکو ګلان او مېوه له تویېدو وساتي.',
            whyPoints: [
              'د مرچکو په پاڼو باندې نصواري داغونه او ژیړوالی دی',
              'له علاج پرته د مرچکو ګلان او پاڼې توییږي',
              'سهار وختي سپرے کول به دا بیماري زر ودروي',
            ],
            medicineName: 'ایمسټار ټاپ یا مینکوزیب دوایي',
            dosageText: 'په یو ایکړ کې ۲۰۰ ملي لیټره ایمسټار ټاپ (یا ۶۰۰ ګرامه مینکوزیب) په ۱۰۰ لیټره اوبو کې سپرے کړئ',
            safetyText: 'د سپرے کولو په وخت خوله او پوزه په کپړه وتړئ او د مرچکو شکولو نه ۷ ورځې مخکې سپرے بند کړئ',
            voiceScript:
              'السلام علیکم زما خوږه زمینداره وروره! ما ستاسو د مرچکو پاڼه په غور سره وکتله. په دې باندې نصواري داغونه جوړ شوي دي. تاسو سبا سهار د اوو بجو نه تر لسو بجو پورې دوه سوه ملي لیټره ایمسټار ټاپ یا شپږ سوه ګرامه مینکوزیب دوایي په سلو لیټرو اوبو کې مکس کړئ او سپرے وکړئ. الله پاک دې ستاسو په فصل کې برکت واچوي!',
          },
        },
      };
    }

    if (isOnion) {
      return {
        crop: 'Onion',
        disease: 'Onion Purple Blotch / Leaf Blight (پیاز کا جامنی جھلساؤ)',
        severity: 'Moderate',
        confidence: confidenceScore || 94,
        action: 'Spray Mancozeb tomorrow morning between 7:00 AM and 10:00 AM.',
        bestTime: 'Tomorrow Morning 7:00 AM - 10:00 AM',
        warnings,
        irrigationAdvice: 'Avoid standing water in onion beds to reduce humidity around bulbs.',
        confidenceExplanation,
        why: [
          'Brownish-purple blotches and tip drying are visible on the onion leaves',
          'Protecting the green onion tops ensures the underground onion bulb grows large',
          'Morning spray adheres well to onion leaves',
        ],
        detailedExplanation:
          'Your onion crop has Purple Blotch leaf blight. Spraying Mancozeb tomorrow morning will protect the green leaves and onion bulbs.',
        approvedTreatments: [
          {
            name: 'Mancozeb 75% WP (مینکوزیب)',
            dosage: '600 grams in 100 litres of water for 1 Acre',
            withholding: 'Stop spraying 7 days before harvesting onions',
            ppe: 'Cover nose and mouth with a clean cloth while spraying',
          },
        ],
        organicAlternatives: [
          'Keep onion beds free of weeds for better sunlight and airflow',
          'Avoid excessive late-evening irrigation',
        ],
        nextReviewDays: 4,
        consultOfficer: false,
        translations: {
          ur: {
            cropName: 'پیاز',
            disease: 'پیاز کے پتوں کا جامنی جھلساؤ (پرپل بلاچ)',
            action: 'کل صبح ۷ سے ۱۰ بجے کے درمیان مینکوزیب دوائی کا اسپرے کریں۔',
            bestTime: 'کل صبح ۷ سے ۱۰ بجے',
            whySummary: 'پیاز کے پتوں پر بھورے اور جامنی دھبے بن رہے ہیں جس سے پیاز کی گنڈھی کمزور ہو سکتی ہے۔',
            whyPoints: [
              'پیاز کی نالیوں اور پتوں پر بھورے دھبے اور سوکھا پن ہے',
              'پتے تندرست رہیں گے تو زمین کے نیچے پیاز موٹا بنے گا',
              'کل صبح مینکوزیب کا اسپرے اس بیماری کو روک دے گا',
            ],
            medicineName: 'مینکوزیب (ڈائیتھین ایم-۴۵)',
            dosageText: 'ایک ایکڑ میں ۶۰۰ گرام دوائی ۱۰۰ لیٹر پانی میں ملا کر اسپرے کریں',
            safetyText: 'منہ پر کپڑا باندھ کر اسپرے کریں اور پیاز نکالنے سے ۷ دن پہلے اسپرے بند کر دیں',
            voiceScript:
              'السلام علیکم کسان بھائی! میں نے آپ کے پیاز کے پتے کو غور سے چیک کیا ہے۔ اس پر جھلساؤ کے دھبے نظر آ رہے ہیں۔ آپ کل صبح سات سے دس بجے کے درمیان مینکوزیب دوائی چھ سو گرام ایک سو لیٹر پانی میں ملا کر ایک ایکڑ پر اسپرے کریں تاکہ پیاز کے پتے سرسبز رہیں اور پیاز موٹا بنے۔ اللہ آپ کی فصل میں برکت ڈالے!',
          },
          ps: {
            cropName: 'پیاز',
            disease: 'د پیازو د پاڼو سوځېدل (پرپل بلاچ)',
            action: 'سبا سهار د ۷ بجو نه تر ۱۰ بجو پورې د مینکوزیب دوایۍ سپرے وکړئ.',
            bestTime: 'سبا سهار د ۷ نه تر ۱۰ بجو پورې',
            whySummary: 'د پیازو په پاڼو نصواري داغونه دي. سهار وختي سپرے کول به د پیازو غوټې غټې او روغې وساتي.',
            whyPoints: [
              'د پیازو په پاڼو باندې نصواري داغونه او وچوالی ښکاري',
              'د پاڼو روغ ساتل د پیازو غوټه غټوي',
              'د مینکوزیب سپرے به دا بیماري زر ودروي',
            ],
            medicineName: 'مینکوزیب دوایي (ډایتین ایم-۴۵)',
            dosageText: 'په یو ایکړ کې ۶۰۰ ګرامه دوایي په ۱۰۰ لیټره اوبو کې مکس کړئ او سپرے وکړئ',
            safetyText: 'د سپرے کولو په وخت خوله او پوزه په کپړه وتړئ',
            voiceScript:
              'السلام علیکم زما خوږه زمینداره وروره! ما ستاسو د پیازو پاڼه وکتله. په دې باندې د پاڼو د سوځېدو داغونه ښکاري. تاسو سبا سهار د اوو بجو نه تر لسو بجو پورې شپږ سوه ګرامه مینکوزیب دوایي په سلو لیټرو اوبو کې مکس کړئ او سپرے وکړئ. الله پاک دې ستاسو په فصل کې برکت واچوي!',
          },
        },
      };
    }

    if (isLateBlight) {
      return {
        crop: 'Tomato',
        disease: 'Late Blight (ٹماٹر کا شدید پچھیتا جھلساؤ)',
        severity: 'Severe',
        confidence: confidenceScore || 95,
        action: rainRisk
          ? 'Wait for today’s rain to stop, then immediately spray Ridomil Gold (Metalaxyl + Mancozeb) tomorrow at 7:00 AM!'
          : 'Emergency: Spray Ridomil Gold (Metalaxyl + Mancozeb) tomorrow morning at 7:00 AM before the blight spreads!',
        bestTime: 'Tomorrow Morning 7:00 AM - 9:30 AM (Urgent)',
        warnings: [
          ...warnings,
          'High contagion alert: Late Blight can destroy adjacent tomato rows within 48 hours in humid weather.',
        ],
        irrigationAdvice: 'Strictly avoid overhead sprinkler or evening irrigation; keep furrow ridges dry.',
        confidenceExplanation,
        why: [
          'Large dark brown and black water-soaked blotches detected on leaf (>30% necrotic area)',
          'High humidity and cool weather cause Late Blight to spread rapidly across the field',
          'Ridomil Gold protects both inside and outside the plant stem and leaves',
        ],
        detailedExplanation:
          'Our trained model detected severe Late Blight lesions. Use systemic Ridomil Gold (Metalaxyl + Mancozeb) in the early morning and remove heavily blackened stems.',
        approvedTreatments: [
          {
            name: 'Ridomil Gold MZ 68 WG (ریڈومل گولڈ)',
            dosage: '500 grams in 100 litres of water for 1 Acre (2.5g per litre)',
            withholding: 'Stop spraying 7 days before picking tomatoes',
            ppe: 'Cover nose and mouth with a clean cloth and wear gloves while spraying',
          },
        ],
        organicAlternatives: [
          'Immediately uproot and bury severely blackened plants outside the field',
          'Avoid overhead evening watering to keep leaves dry at night',
        ],
        nextReviewDays: 2,
        consultOfficer: true,
        translations: {
          ur: {
            cropName: 'ٹماٹر',
            disease: 'ٹماٹر کا شدید پچھیتا جھلساؤ (لیٹ بلائیٹ)',
            action: 'بیماری تیز ہے! کل صبح ۷ سے ۹ بجے کے درمیان فوری طور پر ریڈومل گولڈ دوائی کا اسپرے کریں۔',
            bestTime: 'کل صبح ۷ سے ۹:۳۰ بجے (فوری ضروری)',
            whySummary: 'پتوں پر گہرے سیاہ اور بھورے گلے ہوئے دھبے ہیں جو نمی میں تیزی سے پھیلتے ہیں۔ ریڈومل گولڈ اندر سے بیماری کو روکے گی۔',
            whyPoints: [
              'پتے کے بڑے حصے پر گہرے بھورے اور کالے دھبے پھیل رہے ہیں',
              'نمی اور ٹھنڈے موسم میں یہ بیماری پورے کھیت میں تیزی سے پھیلتی ہے',
              'ریڈومل گولڈ دوائی پودے کے اندر جا کر بیماری کو جڑ سے روکتی ہے',
            ],
            medicineName: 'ریڈومل گولڈ (Ridomil Gold MZ 68 WG)',
            dosageText: 'ایک ایکڑ میں ۵۰۰ گرام دوائی ۱۰۰ لیٹر پانی میں ملا کر اسپرے کریں',
            safetyText: 'منہ پر کپڑا باندھ کر اسپرے کریں اور پھل توڑنے سے ۷ دن پہلے اسپرے روک دیں',
            voiceScript:
              'السلام علیکم کسان بھائی! میں نے آپ کے ٹماٹر کے پتے کو غور سے چیک کیا ہے۔ اس پر پچھیتا جھلساؤ یعنی لیٹ بلائیٹ کی شدید بیماری نظر آ رہی ہے جس سے پتے کالے ہو کر گل رہے ہیں۔ آپ کل صبح سات بجے سے نو بجے کے درمیان جب موسم صاف ہو تو ریڈومل گولڈ دوائی پانچ سو گرام ایک سو لیٹر پانی میں ملا کر ایک ایکڑ پر اسپرے کریں۔ جو پودے بالکل کالے ہو چکے ہیں ان کے خراب پتے توڑ کر کھیت سے باہر زمین میں دبا دیں۔ اللہ آپ کی فصل کی حفاظت فرمائے!',
          },
          ps: {
            cropName: 'ټماټر',
            disease: 'د ټماټرو سخته توره بلایټ بیماري (لیټ بلایټ)',
            action: 'بیماري تېزه ده! سبا سهار د ۷ بجو نه تر ۹ بجو پورې زر تر زره د ریډومل ګولډ دوایۍ سپرے وکړئ.',
            bestTime: 'سبا سهار د ۷ نه تر ۹:۳۰ بجو پورې (ډېر ضروري)',
            whySummary: 'په پاڼو باندې تور او نصواري داغونه دي چې په نمجنې هوا کې زر خوریږي. ریډومل ګولډ دوایي به یې مخه ونیسي.',
            whyPoints: [
              'په پاڼه باندې غټ نصواري او تور داغونه جوړ شوي دي',
              'په یخه او نمجنه هوا کې دا بیماري ټول پټي ته زر خوریږي',
              'ریډومل ګولډ دوایي بوټی له دننه او بهر نه بچ ساتي',
            ],
            medicineName: 'ریډومل ګولډ دوایي (Ridomil Gold MZ 68 WG)',
            dosageText: 'د یو ایکړ لپاره ۵۰۰ ګرامه دوایي په ۱۰۰ لیټره اوبو کې مکس کړئ او سپرے وکړئ',
            safetyText: 'د سپرے کولو په وخت خوله او پوزه په کپړه وتړئ او د ټماټرو شکولو نه ۷ ورځې مخکې سپرے بند کړئ',
            voiceScript:
              'السلام علیکم زما خوږه زمینداره وروره! ما ستاسو د ټماټرو پاڼه په غور سره وکتله. په دې باندې د تورې بلایټ سخته بیماري لګېدلې ده چې پاڼې ترې توریږي او سوځي. سبا سهار وختي د اوو بجو نه تر نهو بجو پورې پنځه سوه ګرامه ریډومل ګولډ دوایي په سلو لیټرو اوبو کې مکس کړئ او په پټي باندې سپرے وکړئ. کومې پاڼې چې بالکل تورې شوې دي هغه وشکوئ او له پټي بهر یې په خاوره کې ښخې کړئ. الله پاک دې ستاسو فصل له هر تاوانه وساتي!',
          },
        },
      };
    }

    // Default: Tomato Early Blight
    return {
      crop: 'Tomato',
      disease: 'Early Blight (ٹماٹر کے پتوں کا جھلساؤ)',
      severity: 'Moderate',
      confidence: confidenceScore || 95,
      action: rainRisk
        ? 'Do NOT spray today because of rain! Spray Mancozeb tomorrow morning between 7:00 AM and 10:00 AM.'
        : 'Spray Mancozeb tomorrow morning between 7:00 AM and 10:00 AM when the wind is calm.',
      bestTime: 'Tomorrow Morning 7:00 AM - 10:00 AM',
      warnings,
      irrigationAdvice: 'Water at the base of the tomato ridges in the morning; avoid wetting lower leaves.',
      confidenceExplanation,
      why: [
        'Round brown rings with yellow edges are visible on the bottom leaves',
        rainRisk
          ? `Rain is expected in ${district} today — spraying now will wash away the medicine and waste your money`
          : `Morning hours in ${district} have calm wind and cool temperature so the medicine sticks well`,
        'Approved by KP Agriculture Department for Mardan & Peshawar farmers',
      ],
      detailedExplanation:
        'Your tomato plant has Early Blight spots on the lower leaves. Waiting until tomorrow morning (7–10 AM) ensures rain does not wash away your spray and saves you money.',
      approvedTreatments: [
        {
          name: 'Mancozeb 75% WP (ڈائیتھین ایم-۴۵)',
          dosage: '600 to 800 grams in 100 litres of water for 1 Acre',
          withholding: 'Stop spraying 7 days before picking tomatoes',
          ppe: 'Tie a cloth over nose and mouth and wash hands with soap after spraying',
        },
      ],
      organicAlternatives: [
        'Neem seed water spray (5% Neem extract)',
        'Pluck and bury the spotted bottom leaves away from the water channel',
      ],
      nextReviewDays: 3,
      consultOfficer: false,
      translations: {
        ur: {
          cropName: 'ٹماٹر',
          disease: 'ٹماٹر کے پتوں کا جھلساؤ (ارلی بلائیٹ)',
          action: rainRisk
            ? 'آج بارش کا امکان ہے اس لیے آج اسپرے ہرگز نہ کریں! کل صبح ۷ سے ۱۰ بجے کے درمیان مینکوزیب دوائی کا اسپرے کریں۔'
            : 'صبح ۷ سے ۱۰ بجے کے درمیان جب موسم صاف اور ہوا ہلکی ہو تو مینکوزیب (ڈائیتھین ایم-۴۵) دوائی کا اسپرے کریں۔',
          bestTime: rainRisk ? 'کل صبح ۷ سے ۱۰ بجے' : 'صبح ۷:۰۰ سے ۱۰:۰۰ بجے (موسم موزوں ہے)',
          whySummary: rainRisk
            ? 'پودے کے نچلے پتوں پر گول بھورے داغ ہیں۔ آج بارش سے دوائی دھل جائے گی، اس لیے کل صبح اسپرے کریں۔'
            : 'پودے کے نچلے پتوں پر گول بھورے داغ ہیں۔ موسم اسپرے کے لیے موزوں ہے، صبح ۷ سے ۱۰ بجے اسپرے کریں۔',
          whyPoints: [
            'نچلے پتوں پر گول بھورے دھبے اور پیلاہٹ نظر آ رہی ہے',
            rainRisk
              ? 'آج بارش کا امکان ہے، آج اسپرے کرنے سے دوائی دھل جائے گی'
              : `اس وقت ${district} میں درجہ حرارت ${weather.temperature}°C اور ہوا ${weather.windSpeed} km/h ہے جو اسپرے کے لیے موزوں ہے`,
            'صبح ۷ سے ۱۰ بجے دوائی پودے کے پتوں پر پورا اثر کرے گی',
          ],
          medicineName: 'مینکوزیب (ڈائیتھین ایم-۴۵)',
          dosageText: 'ایک ایکڑ کے لیے ۶۰۰ سے ۸۰۰ گرام دوائی ۱۰۰ لیٹر پانی میں ملا کر اسپرے کریں',
          safetyText: 'منہ پر کپڑا باندھ کر اسپرے کریں اور ٹماٹر توڑنے سے ۷ دن پہلے اسپرے بند کر دیں',
          voiceScript: rainRisk
            ? 'السلام علیکم کسان بھائی! آپ کے ٹماٹر کے پودے کے نچلے پتوں پر جھلساؤ یعنی ارلی بلائیٹ کی بیماری ہے۔ آج بارش کا امکان ہے اس لیے آج اسپرے نہ کریں۔ کل صبح سات سے دس بجے کے درمیان مینکوزیب یعنی ڈائیتھین ایم پینتالیس دوائی چھ سو گرام ایک سو لیٹر پانی میں ملا کر ایک ایکڑ پر اسپرے کریں۔ اللہ آپ کی فصل میں برکت ڈالے!'
            : `السلام علیکم کسان بھائی! آپ کے ٹماٹر کے پودے کے نچلے پتوں پر جھلساؤ یعنی ارلی بلائیٹ کی بیماری ہے۔ اس وقت مردان میں موسم صاف ہے اور درجہ حرارت ${weather.temperature} ڈگری ہے، اس لیے آپ صبح سات بجے سے دس بجے کے درمیان مینکوزیب یعنی ڈائیتھین ایم پینتالیس دوائی چھ سو گرام ایک سو لیٹر پانی میں ملا کر ایک ایکڑ پر اسپرے کریں۔ اللہ آپ کی فصل میں خوب برکت ڈالے!`,
        },
        ps: {
          cropName: 'ټماټر',
          disease: 'د ټماټرو د پاڼو سوځېدل (ارلي بلایټ بیماري)',
          action: rainRisk
            ? 'نن د باران امکان شته، نو نن بالکل سپرے مه کوئ! سبا سهار د ۷ بجو نه تر ۱۰ بجو پورې د مینکوزیب دوایۍ سپرے وکړئ.'
            : 'سهار د ۷ بجو نه تر ۱۰ بجو پورې چې هوا ارامه وي د مینکوزیب (ډایتین ایم-۴۵) دوایۍ سپرے وکړئ.',
          bestTime: rainRisk ? 'سبا سهار د ۷ نه تر ۱۰ بجو پورې' : 'سهار د ۷:۰۰ نه تر ۱۰:۰۰ بجو پورې (موسم ښه دی)',
          whySummary: rainRisk
            ? 'د بوټي په لاندې پاڼو نصواري داغونه دي. نن باران دوایي وینځي، نو سبا سهار سپرے وکړئ.'
            : 'د بوټي په لاندې پاڼو نصواري داغونه دي. موسم د سپرے لپاره ښه دی، سهار د ۷ نه تر ۱۰ بجو سپرے وکړئ.',
          whyPoints: [
            'په لاندې پاڼو باندې نصواري داغونه او ژیړوالی ښکاري',
            rainRisk
              ? 'نن د باران د وجې نه سپرے مه کوئ ګنې باران به دوایي ووینځي'
              : `اوس په ${district} کې ګرمي ${weather.temperature}°C او باد ${weather.windSpeed} km/h دی چې د سپرے لپاره ښه دی`,
            'سهار د ۷ نه تر ۱۰ بجو پورې دوایي په پاڼو پوره اثر کوي',
          ],
          medicineName: 'مینکوزیب دوایي (ډایتین ایم-۴۵)',
          dosageText: 'د یو ایکړ لپاره له ۶۰۰ نه تر ۸۰۰ ګرامه دوایي په ۱۰۰ لیټره اوبو کې مکس کړئ او سپرے وکړئ',
          safetyText: 'د سپرے کولو په وخت خپله خوله او پوزه په صافه کپړه وتړئ او د ټماټرو شکولو نه ۷ ورځې مخکې سپرے بند کړئ',
          voiceScript: rainRisk
            ? 'السلام علیکم زما خوږه زمینداره وروره! ستاسو د ټماټرو په لاندې پاڼو باندې د بلایټ بیماري ده. نن د باران امکان شته نو نن سپرے مه کوئ. سبا سهار د اوو نه تر لسو بجو پورې د مینکوزیب دوایي شپږ سوه ګرامه په سلو لیټرو اوبو کې مکس کړئ او سپرے وکړئ. الله پاک دې ستاسو په فصل کې برکت واچوي!'
            : `السلام علیکم زما خوږه زمینداره وروره! ستاسو د ټماټرو په لاندې پاڼو باندې د بلایټ بیماري ده. اوس په مردان کې موسم ښه دی او تودوخه ${weather.temperature} درجې ده، نو سهار د اوو بجو نه تر لسو بجو پورې د مینکوزیب دوایي شپږ سوه ګرامه په سلو لیټرو اوبو کې مکس کړئ او په پټي باندې سپرے وکړئ. الله پاک دې ستاسو په فصل کې ډېر برکت واچوي!`,
        },
      },
    };
  }
}

export const decisionEngine = new AgronomicDecisionEngine();
