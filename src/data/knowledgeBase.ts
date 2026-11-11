// KP Agriculture Extension & PARC Knowledge Base (src/data/knowledgeBase.ts)
export interface KnowledgeDoc {
  id: string;
  crop: string;
  disease: string;
  source: 'KP Agriculture Dept' | 'PARC' | 'FAO' | 'University of Agriculture Peshawar';
  title: string;
  symptoms: string[];
  favorableWeather: {
    tempRange: string;
    humidity: string;
    rainRisk: string;
  };
  decisionRules: {
    condition: string;
    action: string;
    sprayWindow: string;
    reason: string;
  }[];
  approvedTreatments: {
    name: string;
    activeIngredient: string;
    dosage: string;
    withholdingPeriod: string;
    safetyPPE: string;
    isRestricted: boolean;
  }[];
  organicAlternatives: string[];
  preventionTips: string[];
}

export const AGRICULTURAL_KNOWLEDGE_BASE: KnowledgeDoc[] = [
  {
    id: 'kb-tom-early-blight',
    crop: 'Tomato',
    disease: 'Early Blight (Alternaria solani)',
    source: 'KP Agriculture Dept',
    title: 'Advisory 2026/EB: Management of Tomato Early Blight in Mardan & Peshawar Valley',
    symptoms: [
      'Concentric dark brown rings resembling target board on older leaves',
      'Yellow halos surrounding leaf spots',
      'Stem lesions and dark leathery sunken spots on fruit stem end',
      'Premature leaf drop leading to sun-scald on developing tomatoes'
    ],
    favorableWeather: {
      tempRange: '24°C - 29°C',
      humidity: '> 80% relative humidity',
      rainRisk: 'High risk after rain showers followed by warm sunshine'
    },
    decisionRules: [
      {
        condition: 'Mild severity (under 10% leaf area affected) + Dry forecast',
        action: 'Monitor field daily, prune affected lower leaves, withhold chemical spraying for 72 hours',
        sprayWindow: 'Not immediately required; morning inspection',
        reason: 'Low infection load does not justify chemical cost; biological balance maintained'
      },
      {
        condition: 'Moderate severity (10-30% leaf area) + Rain forecasted within 6 hours',
        action: 'Delay spraying until rain passes; apply contact protectant Mancozeb tomorrow morning between 7:00 AM - 10:00 AM',
        sprayWindow: 'Tomorrow morning 7:00 AM - 10:00 AM (wind < 8 km/h)',
        reason: 'Immediate spray will wash off with rain; morning conditions allow complete leaf drying and optimal adherence'
      },
      {
        condition: 'Moderate severity + Dry weather next 48h',
        action: 'Apply Mancozeb 75% WP or Chlorothalonil 75% WP within 24 hours',
        sprayWindow: 'Early morning (7-10 AM) or late afternoon (4-6 PM)',
        reason: 'Calm winds and moderate temperatures prevent chemical drift and phototoxicity'
      },
      {
        condition: 'Severe infection (> 30% crop affected)',
        action: 'Immediate curative intervention with Difenoconazole + Azoxystrobin; consult District Agriculture Officer',
        sprayWindow: 'Next available dry window with wind < 10 km/h',
        reason: 'Systemic curative fungicide required to arrest vascular mycelial spread'
      }
    ],
    approvedTreatments: [
      {
        name: 'Mancozeb 75% WP (Dithane M-45)',
        activeIngredient: 'Mancozeb (Dithiocarbamate)',
        dosage: '2.0 - 2.5 g per litre water (600g - 800g per acre)',
        withholdingPeriod: '7 days before harvest',
        safetyPPE: 'Wear nitrile gloves, cloth mask, and protective goggles during preparation',
        isRestricted: false
      },
      {
        name: 'Chlorothalonil 75% WP',
        activeIngredient: 'Chlorothalonil',
        dosage: '2.0 g per litre water (500g per acre)',
        withholdingPeriod: '5 days before harvest',
        safetyPPE: 'Eye protection mandatory; avoid inhalation mist',
        isRestricted: false
      },
      {
        name: 'Score 250 EC',
        activeIngredient: 'Difenoconazole',
        dosage: '0.5 ml per litre water (150 ml per acre)',
        withholdingPeriod: '10 days before harvest',
        safetyPPE: 'Standard chemical safety gear',
        isRestricted: false
      }
    ],
    organicAlternatives: [
      'Neem seed kernel extract (5% NSKE) spray',
      'Copper oxychloride organic formulation',
      'Trichoderma harzianum bio-fungicide foliar drench'
    ],
    preventionTips: [
      'Drip irrigation instead of flood or overhead watering to keep foliage dry',
      'Stake plants to ensure 45cm clearance from moist soil',
      '3-year crop rotation away from Solanaceae (potato, brinjal, tobacco)'
    ]
  },
  {
    id: 'kb-wheat-yellow-rust',
    crop: 'Wheat',
    disease: 'Stripe Rust / Yellow Rust (Puccinia striiformis)',
    source: 'PARC',
    title: 'National Wheat Rust Surveillance: Early Intervention Guidelines for Khyber Pakhtunkhwa',
    symptoms: [
      'Bright yellow powdery pustules arranged in parallel stripes along leaf veins',
      'Chlorotic streaks on younger leaves',
      'Yellow dust rubbing off onto clothing or fingers upon contact',
      'Shriveled grain filling and premature crop yellowing'
    ],
    favorableWeather: {
      tempRange: '10°C - 20°C',
      humidity: 'Dewy mornings and prolonged canopy moisture',
      rainRisk: 'Windy conditions following light rain accelerate airborne spore dispersal'
    },
    decisionRules: [
      {
        condition: 'Early appearance in focus patches (< 5% flag leaf incidence)',
        action: 'Spot spray affected perimeter with Propiconazole (Tilt 250 EC); check neighboring fields',
        sprayWindow: 'Mid-morning after dew dries (9:00 AM - 12:00 PM)',
        reason: 'Spraying on wet dew dilutes chemical concentration; dry leaves ensure systemic absorption'
      },
      {
        condition: 'Moderate to severe incidence on flag leaf during heading stage',
        action: 'Full field spray with Triazole fungicide immediately; report to ARDC district focal person',
        sprayWindow: 'Early morning or calm evening',
        reason: 'Flag leaf generates 75% of grain yield; prompt protection prevents severe yield drop'
      }
    ],
    approvedTreatments: [
      {
        name: 'Tilt 250 EC (Propiconazole)',
        activeIngredient: 'Propiconazole 25% EC',
        dosage: '0.75 - 1.0 ml per litre water (200 ml per acre)',
        withholdingPeriod: '30 days before harvest',
        safetyPPE: 'Nitrile gloves, eye shield, respirator mask',
        isRestricted: false
      },
      {
        name: 'Nativo 75 WG',
        activeIngredient: 'Tebuconazole 50% + Trifloxystrobin 25%',
        dosage: '100 g per acre in 100 litres water',
        withholdingPeriod: '21 days before harvest',
        safetyPPE: 'Wear protective coveralls and face shield',
        isRestricted: false
      }
    ],
    organicAlternatives: [
      'Sulfur dust (300 mesh) at early onset in cool weather',
      'Fermented cow urine drench with botanical extracts (traditional)'
    ],
    preventionTips: [
      'Plant rust-resistant certified cultivars (e.g. Faisalabad-2008, Markaz-19, Pirsabak-2015)',
      'Avoid excessive nitrogen fertilization which creates dense lush foliage favoring fungus',
      'Eradicate volunteer wheat and barberry host shrubs along canal banks'
    ]
  },
  {
    id: 'kb-maize-leaf-blight',
    crop: 'Maize',
    disease: 'Northern Corn Leaf Blight (Exserohilum turcicum)',
    source: 'University of Agriculture Peshawar',
    title: 'Advisory for Maize Farmers: Swabi, Mardan, and Charsadda Summer Crop Management',
    symptoms: [
      'Long elliptical grayish-green or tan lesions (cigar-shaped) on lower leaves',
      'Lesions expanding up to 15 cm long with wavy margins',
      'Premature blighting and desiccation of corn foliage during silking',
      'Reduced cob weight and poor grain kernel development'
    ],
    favorableWeather: {
      tempRange: '18°C - 27°C',
      humidity: '> 85% relative humidity with frequent rain spells',
      rainRisk: 'Fungal conidia spread rapidly by rain splash and high winds'
    },
    decisionRules: [
      {
        condition: 'Lesions restricted to lower leaves before silking + dry spell forecast',
        action: 'Monitor field progression every 48 hours; no chemical spray required yet',
        sprayWindow: 'Morning inspection routine',
        reason: 'Maize can withstand moderate lower canopy spotting without yield impact if weather remains dry'
      },
      {
        condition: 'Lesions approaching ear leaf 2 weeks before or after silking + rain forecasted',
        action: 'Spray Azoxystrobin + Difenoconazole or Mancozeb as soon as rain stops and leaves dry',
        sprayWindow: 'Early morning following rain cessation',
        reason: 'Protecting the ear leaf is critical for kernel photosynthesis and cob fullness'
      }
    ],
    approvedTreatments: [
      {
        name: 'Amistar Top 325 SC',
        activeIngredient: 'Azoxystrobin 200g/L + Difenoconazole 125g/L',
        dosage: '1.0 ml per litre water (200 ml per acre)',
        withholdingPeriod: '14 days before harvest',
        safetyPPE: 'Gloves, boots, mask, and protective eyewear',
        isRestricted: false
      },
      {
        name: 'Dithane M-45',
        activeIngredient: 'Mancozeb 75% WP',
        dosage: '2.5 g per litre water (750 g per acre)',
        withholdingPeriod: '7 days before fodder harvest',
        safetyPPE: 'Standard PPE',
        isRestricted: false
      }
    ],
    organicAlternatives: [
      'Bacillus subtilis bio-fungicide foliar spray',
      'Neem oil formulation (10,000 ppm) at 2 ml/L'
    ],
    preventionTips: [
      'Incorporate maize stubble deeply after harvest to bury overwintering mycelia',
      'Maintain plant spacing (75 cm between rows, 20 cm between plants) for airflow',
      'Select hybrid seeds certified by CCRI Pirsabak'
    ]
  },
  {
    id: 'kb-healthy-general',
    crop: 'General',
    disease: 'Healthy Crop (No Disease Detected)',
    source: 'KP Agriculture Dept',
    title: 'Good Agricultural Practices (GAP): Maintaining Healthy Canopy & Crop Vigour',
    symptoms: [
      'Vibrant green leaves with uniform coloration and intact margins',
      'Firm stems and healthy turgid root system',
      'Absence of fungal pustules, necrotic spots, or pest webbing'
    ],
    favorableWeather: {
      tempRange: 'Optimal seasonal range',
      humidity: 'Balanced aeration',
      rainRisk: 'Normal rainfall'
    },
    decisionRules: [
      {
        condition: 'Crop is healthy',
        action: 'No pesticide spraying required. Maintain scheduled irrigation and balanced organic nutrition.',
        sprayWindow: 'Do not spray chemicals',
        reason: 'Unnecessary pesticide application wastes farmer money and harms beneficial pollinators and predatory insects'
      }
    ],
    approvedTreatments: [],
    organicAlternatives: ['Foliar micronutrient spray (Zinc & Boron) if entering flowering stage'],
    preventionTips: [
      'Scout crop twice weekly in an "X" or "W" pattern across the field',
      'Keep field borders weed-free to eliminate alternate insect hosts'
    ]
  }
];

export interface VerifiedPesticide {
  tradeName: string;
  genericName: string;
  targetDiseases: string[];
  targetCrops: string[];
  status: 'Suitable' | 'Not Recommended' | 'Restricted / Banned';
  reason: string;
  dosage: string;
  safetyAdvice: string;
  withholdingDays: number;
}

export const VERIFIED_PESTICIDES_DB: VerifiedPesticide[] = [
  {
    tradeName: 'Mancozeb 75 WP / Dithane M-45',
    genericName: 'Mancozeb',
    targetDiseases: ['Early Blight', 'Late Blight', 'Leaf Spot', 'Rust', 'Anthracnose'],
    targetCrops: ['Tomato', 'Potato', 'Wheat', 'Maize', 'Onion'],
    status: 'Suitable',
    reason: 'Official KP Agriculture Dept approved broad-spectrum contact fungicide with multi-site activity.',
    dosage: '600g - 800g per acre in 100-120 litres water (2-2.5g/L)',
    safetyAdvice: 'Wear rubber gloves and cloth mask. Do not spray during peak noon heat.',
    withholdingDays: 7
  },
  {
    tradeName: 'Tilt 250 EC',
    genericName: 'Propiconazole',
    targetDiseases: ['Yellow Rust', 'Stripe Rust', 'Brown Rust', 'Powdery Mildew'],
    targetCrops: ['Wheat', 'Barley', 'Rice'],
    status: 'Suitable',
    reason: 'Systemic curative and protective triazole fungicide recommended by PARC wheat program.',
    dosage: '200 ml per acre in 100 litres water',
    safetyAdvice: 'Wash sprayer thoroughly; hazardous to aquatic life. Keep animals away from treated field for 48 hours.',
    withholdingDays: 28
  },
  {
    tradeName: 'Score 250 EC',
    genericName: 'Difenoconazole',
    targetDiseases: ['Early Blight', 'Leaf Blight', 'Powdery Mildew', 'Scab'],
    targetCrops: ['Tomato', 'Maize', 'Potato', 'Apple'],
    status: 'Suitable',
    reason: 'High efficacy curative systemic triazole for moderate-to-severe leaf spot infections.',
    dosage: '150 - 200 ml per acre',
    safetyAdvice: 'Use protective eyewear and apron. Avoid spray inhalation.',
    withholdingDays: 14
  },
  {
    tradeName: 'Chlorothalonil 75 WP (Kavach)',
    genericName: 'Chlorothalonil',
    targetDiseases: ['Early Blight', 'Late Blight', 'Anthracnose'],
    targetCrops: ['Tomato', 'Potato', 'Vegetables'],
    status: 'Suitable',
    reason: 'Protective multi-site contact fungicide; excellent rainfastness once dried.',
    dosage: '500g per acre in 100L water',
    safetyAdvice: 'Potential skin irritant; wash thoroughly with soap and clean water immediately after application.',
    withholdingDays: 5
  },
  {
    tradeName: 'Paraquat 20% SL',
    genericName: 'Paraquat Dichloride',
    targetDiseases: [],
    targetCrops: ['Non-selective herbicide / Desiccant'],
    status: 'Restricted / Banned',
    reason: 'DANGEROUS: Paraquat is an unselective toxic herbicide, NOT a fungicide or disease cure! Applying this will kill your entire tomato/wheat crop and poses severe human toxicity risk.',
    dosage: 'DO NOT USE ON CROPS FOR DISEASE',
    safetyAdvice: 'Fatal if swallowed or absorbed through skin. Report unauthorized sales to District Agriculture authorities.',
    withholdingDays: 999
  },
  {
    tradeName: 'DDT / Endosulfan / Monocrotophos',
    genericName: 'Organochlorine / Persistent pesticide',
    targetDiseases: [],
    targetCrops: [],
    status: 'Restricted / Banned',
    reason: 'Strictly BANNED in Pakistan under Agricultural Pesticides Ordinance and international Stockholm Convention.',
    dosage: 'Prohibited',
    safetyAdvice: 'Illegal possession or distribution carries legal penalties. Do not apply under any circumstances.',
    withholdingDays: 999
  },
  {
    tradeName: 'Lambda-cyhalothrin 2.5 EC (Karate)',
    genericName: 'Pyrethroid Insecticide',
    targetDiseases: ['Fruit Borer', 'Armyworm', 'Aphids'],
    targetCrops: ['Tomato', 'Maize', 'Cotton'],
    status: 'Not Recommended',
    reason: 'This is an INSECTICIDE for insects/worms, NOT an antifungal agent. It will not cure fungal blight or rust and adds unnecessary chemical expense.',
    dosage: 'Only suitable if insect pests are visibly present alongside disease',
    safetyAdvice: 'Toxic to bees; never spray during active morning bloom periods.',
    withholdingDays: 7
  }
];

export interface DistrictStat {
  district: string;
  activeOutbreaks: number;
  totalScans: number;
  primaryCrop: string;
  primaryDisease: string;
  riskLevel: 'Normal' | 'Watch' | 'High Risk';
  villagesReported: number;
  lat: number;
  lng: number;
}

export const KP_DISTRICTS_SURVEILLANCE: DistrictStat[] = [
  {
    district: 'Mardan',
    activeOutbreaks: 28,
    totalScans: 412,
    primaryCrop: 'Tomato & Sugarcane',
    primaryDisease: 'Early Blight',
    riskLevel: 'High Risk',
    villagesReported: 14,
    lat: 34.1989,
    lng: 72.0404
  },
  {
    district: 'Swabi',
    activeOutbreaks: 19,
    totalScans: 305,
    primaryCrop: 'Maize & Tobacco',
    primaryDisease: 'Corn Leaf Blight',
    riskLevel: 'Watch',
    villagesReported: 9,
    lat: 34.1202,
    lng: 72.4705
  },
  {
    district: 'Charsadda',
    activeOutbreaks: 15,
    totalScans: 260,
    primaryCrop: 'Sugarcane & Maize',
    primaryDisease: 'Red Rot & Leaf Spot',
    riskLevel: 'Watch',
    villagesReported: 8,
    lat: 34.1482,
    lng: 71.7406
  },
  {
    district: 'Peshawar',
    activeOutbreaks: 9,
    totalScans: 198,
    primaryCrop: 'Wheat & Vegetables',
    primaryDisease: 'Wheat Stripe Rust',
    riskLevel: 'Normal',
    villagesReported: 6,
    lat: 34.0151,
    lng: 71.5249
  },
  {
    district: 'Nowshera',
    activeOutbreaks: 12,
    totalScans: 184,
    primaryCrop: 'Wheat & Vegetables',
    primaryDisease: 'Wheat Stripe Rust',
    riskLevel: 'Watch',
    villagesReported: 7,
    lat: 34.0153,
    lng: 71.9747
  },
  {
    district: 'Malakand',
    activeOutbreaks: 5,
    totalScans: 112,
    primaryCrop: 'Tomato & Citrus',
    primaryDisease: 'Citrus Canker / Blight',
    riskLevel: 'Normal',
    villagesReported: 4,
    lat: 34.5030,
    lng: 71.9304
  }
];

export interface SampleCropImage {
  id: string;
  name: string;
  crop: string;
  suspectedCondition: string;
  dataUrl: string;
  description: string;
}

// Generate high quality SVG data URLs for instant one-click testing
function createSampleSvg(title: string, color: string, spotColor: string, detail: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <radialGradient id="leafGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="${color}" />
        <stop offset="70%" stop-color="#14532d" />
        <stop offset="100%" stop-color="#052e16" />
      </radialGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="2" dy="8" stdDeviation="6" flood-opacity="0.3"/>
      </filter>
    </defs>
    <rect width="600" height="600" fill="#1c1917" />
    <path d="M 0 0 L 600 600 M 0 600 L 600 0" stroke="#292524" stroke-width="1" />
    
    <!-- Realistic Leaf Shape -->
    <g transform="translate(60, 50)" filter="url(#shadow)">
      <path d="M 240,40 C 370,120 440,260 380,410 C 320,530 180,490 120,400 C 60,300 110,140 240,40 Z" fill="url(#leafGrad)" />
      <!-- Leaf Veins -->
      <path d="M 240,50 Q 250,250 250,470" stroke="#86efac" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.6"/>
      <path d="M 245,150 Q 320,130 360,110" stroke="#86efac" stroke-width="2.5" fill="none" opacity="0.5"/>
      <path d="M 245,210 Q 170,190 130,180" stroke="#86efac" stroke-width="2.5" fill="none" opacity="0.5"/>
      <path d="M 248,270 Q 340,250 380,240" stroke="#86efac" stroke-width="2.5" fill="none" opacity="0.5"/>
      <path d="M 248,340 Q 180,330 140,320" stroke="#86efac" stroke-width="2.5" fill="none" opacity="0.5"/>
      
      <!-- Disease spots -->
      ${spotColor !== 'none' ? `
        <!-- Concentric spot 1 -->
        <circle cx="210" cy="220" r="34" fill="#ca8a04" opacity="0.9" />
        <circle cx="210" cy="220" r="26" fill="${spotColor}" />
        <circle cx="210" cy="220" r="16" fill="#451a03" />
        <circle cx="210" cy="220" r="8" fill="#1c1917" />
        
        <!-- Concentric spot 2 -->
        <circle cx="320" cy="280" r="42" fill="#ca8a04" opacity="0.9" />
        <circle cx="320" cy="280" r="32" fill="${spotColor}" />
        <circle cx="320" cy="280" r="20" fill="#451a03" />
        <circle cx="320" cy="280" r="9" fill="#1c1917" />

        <!-- Smaller spots -->
        <circle cx="170" cy="330" r="20" fill="${spotColor}" />
        <circle cx="170" cy="330" r="11" fill="#451a03" />
        <circle cx="310" cy="180" r="18" fill="${spotColor}" />
        <circle cx="270" cy="380" r="24" fill="${spotColor}" />
      ` : `
        <!-- Clean healthy highlights -->
        <ellipse cx="220" cy="190" rx="30" ry="80" fill="#86efac" opacity="0.25" transform="rotate(-15, 220, 190)"/>
      `}
    </g>

    <!-- Overlay Tag -->
    <rect x="40" y="500" width="520" height="70" rx="14" fill="#0f172a" fill-opacity="0.92" stroke="#334155" stroke-width="1"/>
    <text x="65" y="530" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="19" font-weight="bold">${title}</text>
    <text x="65" y="554" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">${detail}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_CROP_IMAGES: SampleCropImage[] = [
  {
    id: 'sample-early-blight',
    name: 'Tomato Leaf with Blight Lesion',
    crop: 'Tomato',
    suspectedCondition: 'Early / Late Blight (جھلساؤ)',
    dataUrl: '/assets/aistudio/images__1__ffc3a2eb.jpg',
    description: 'Real field specimen showing a prominent brown necrotic blight wedge surrounded by a yellow chlorotic halo on a tomato leaf.'
  },
  {
    id: 'sample-wheat-rust',
    name: 'Wheat Leaves with Yellow Stripes',
    crop: 'Wheat',
    suspectedCondition: 'Yellow / Stripe Rust',
    dataUrl: createSampleSvg('Wheat Canopy: Stripe Rust (Puccinia striiformis)', '#4ade80', '#eab308', 'Linear rows of bright yellow uredinial powdery pustules'),
    description: 'Field sample exhibiting parallel yellow powdery pustules along leaf veins typical of KP wheat rust.'
  },
  {
    id: 'sample-maize-blight',
    name: 'Maize Foliar Cigar Spot',
    crop: 'Maize',
    suspectedCondition: 'Northern Corn Leaf Blight',
    dataUrl: createSampleSvg('Maize Leaf: Northern Leaf Blight (Exserohilum turcicum)', '#16a34a', '#854d0e', 'Elongated tan cigar-shaped necrotic lesions'),
    description: 'Maize foliage demonstrating elongated grayish-tan elliptical lesions prior to tasseling.'
  },
  {
    id: 'sample-healthy-tomato',
    name: 'Healthy Tomato Canopy',
    crop: 'Tomato',
    suspectedCondition: 'Healthy (No Symptoms)',
    dataUrl: createSampleSvg('Tomato: Healthy Vigor Canopy', '#22c55e', 'none', 'Uniform green pigmentation, turgid leaves, zero necrosis'),
    description: 'Optimal healthy tomato leaf sample demonstrating zero signs of infection or nutrient stress.'
  }
];

