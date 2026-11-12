import { KP_DISTRICTS_SURVEILLANCE, DistrictStat } from '../../data/knowledgeBase.ts';
import { scanRepository } from '../repositories/scanRepository.ts';

export interface LocalizedDistrictOutbreak extends DistrictStat {
  recentLiveReports: number;
  localizedName: {
    ur: string;
    ps: string;
    en: string;
  };
  localizedAlertText: {
    ur: string;
    ps: string;
    en: string;
  };
}

/**
 * Dedicated Community Outbreak & Epidemiological Surveillance Service (src/backend/community/outbreakService.ts)
 */
export class OutbreakSurveillanceService {
  private districtNamesUr: Record<string, string> = {
    Mardan: 'مردان',
    Swabi: 'صوابی',
    Charsadda: 'چارسدہ',
    Peshawar: 'پشاور',
    Nowshera: 'نوشہرہ',
    Malakand: 'ملاکنڈ',
  };

  private districtNamesPs: Record<string, string> = {
    Mardan: 'مردان',
    Swabi: 'صوابۍ',
    Charsadda: 'چارسده',
    Peshawar: 'پېښور',
    Nowshera: 'نوښار',
    Malakand: 'ملاکنډ',
  };

  private cropUr: Record<string, string> = {
    Tomato: 'ٹماٹر',
    Maize: 'مکئی',
    Wheat: 'گندم',
    Cotton: 'کپاس',
    Potato: 'آلو',
    'Chili & Onion': 'مرچ اور پیاز',
    'Tomato & Citrus': 'ٹماٹر اور مالٹا',
  };

  private cropPs: Record<string, string> = {
    Tomato: 'ټماټر',
    Maize: 'جوار',
    Wheat: 'غنم',
    Cotton: 'پنبه',
    Potato: 'الوګان',
    'Chili & Onion': 'مرچک او پیاز',
    'Tomato & Citrus': 'ټماټر او مالټه',
  };

  private buildLocalizedAlerts(dist: DistrictStat) {
    const urName = this.districtNamesUr[dist.district] || dist.district;
    const psName = this.districtNamesPs[dist.district] || dist.district;
    const urCrop = this.cropUr[dist.primaryCrop] || dist.primaryCrop;
    const psCrop = this.cropPs[dist.primaryCrop] || dist.primaryCrop;

    const ur =
      dist.riskLevel === 'High Risk'
        ? `السلام علیکم میرے پیارے کسان بھائی! آپ کی خیریت چاہتے ہوئے ایک ضروری خبر دینا چاہتا ہوں۔ ہمارے ضلع ${urName} کے قریبی دیہات، خاص طور پر گجر گڑھی اور تورو کے آس پاس ${urCrop} کی فصل پر بیماری تیزی سے پھیل رہی ہے۔ اب تک ${dist.activeOutbreaks} کھیتوں میں اس کی نشاندہی ہوئی ہے۔ گھبرانے کی ضرورت نہیں، بس آج شام یا کل صبح اپنے پودوں کے نچلے پتے غور سے چیک کریں۔ اگر کسی پتے پر دھبے نظر آئیں تو وقت ضائع کیے بغیر صاف موسم میں اسپرے کریں، لیکن بارش یا تیز ہوا میں ہرگز اسپرے نہ کریں تاکہ آپ کے پیسے محفوظ رہیں۔ اللہ آپ کی محنت اور فصل میں خوب برکت ڈالے!`
        : dist.riskLevel === 'Watch'
        ? `السلام علیکم میرے پیارے کسان بھائی! امید ہے آپ اور آپ کی فصلیں خیر و عافیت سے ہوں گی۔ ضلع ${urName} میں صبح اور رات کی نمی کی وجہ سے ${urCrop} کے چند کھیتوں (${dist.activeOutbreaks} کھیتوں) میں ہلکی بیماری دیکھنے میں آئی ہے۔ پریشان ہونے کی بات نہیں، بس احتیاط کے طور پر اگلے دو تین دن صبح کے وقت کھیت کا چکر ضرور لگائیں، خراب نچلے پتے توڑ کر زمین میں دبا دیں اور کھیت کو صاف رکھیں۔ اللہ آپ کی فصل کو ہر آفت سے محفوظ رکھے!`
        : `السلام علیکم کسان بھائی! آپ کے لیے بہت اچھی خبر ہے۔ الحمدللہ ضلع ${urName} میں اس وقت موسم اور فصلوں کی حالت بالکل پرسکون اور محفوظ ہے۔ ${urCrop} کی فصل اچھی جا رہی ہے اور کوئی بڑا خطرہ نہیں ہے۔ پھر بھی ہفتے میں ایک دو بار محبت سے اپنے کھیت کا معائنہ ضرور کریں اور وقت پر پانی دیتے رہیں۔ اللہ آپ کی کمائی میں خوب برکت ڈالے!`;

    const ps =
      dist.riskLevel === 'High Risk'
        ? `السلام علیکم زما خوږه او درنده زمینداره وروره! ستاسو د خیر او صحت په هیله درته د کلي او ضلعې یوه مهمه خبره کوم. زموږ په ضلع ${psName} او شاوخوا کلیو کې په ${psCrop} باندې بیماري لږه تېزه شوې ده او تر اوسه په ${dist.activeOutbreaks} پټیو کې راپور شوې ده. هیڅ مه پرېشانه کېږئ، بس نن یا سبا سهار خپل پټی او د بوټو لاندې پاڼې په مینه او غور سره وګورئ. که کومه خرابه پاڼه وینئ نو په صافه وچه هوا کې یې درملنه وکړئ، خو د باران یا تېز باد په وخت کې سپرے مه کوئ ترڅو ستاسو پیسې ضایع نشي. الله پاک دې ستاسو په فصل کې ډېر برکت واچوي!`
        : dist.riskLevel === 'Watch'
        ? `السلام علیکم زما ګرانه زمینداره وروره! هیله ده تاسو او ستاسو فصلونه روغ رمټ وي. په ضلع ${psName} کې د شپې د یخنۍ او شبنم د وجې نه په ${dist.activeOutbreaks} پټیو کې په ${psCrop} باندې لږه بیماري لیدل شوې ده. د اندېښنې خبره نشته، خو د احتیاط په توګه په راتلونکو دوه درې ورځو کې سهار خپل پټی چیک کوئ، خرابې پاڼې وشکوئ او اوبه په حساب ورکړئ. الله دې ستاسو پټی له هر تاوانه وساتي!`
        : `السلام علیکم زما خوږه زمینداره وروره! ستاسو لپاره ډېره ښه خبره ده. الحمدلله په ضلع ${psName} کې په دې وخت کې د ${psCrop} فصلونه بالکل روغ، شنه او خوندي دي او کومه لویه خطره نشته. بیا هم په هفته کې یو دوه ځله خپل پټی په شوق سره ګورئ او وخت په وخت اوبه ورکوئ. الله پاک دې ستاسو په خوارۍ او فصل کې برکت واچوي!`;

    const en =
      dist.riskLevel === 'High Risk'
        ? `Assalam-o-Alaikum, dear farmer brother! Here is an important local update for ${dist.district}: ${dist.primaryDisease} on ${dist.primaryCrop} has recently been spotted in ${dist.activeOutbreaks} nearby farms. Don't worry—early checking keeps your crop completely safe. Take a walk through your field this morning to inspect the lower leaves, pluck badly spotted ones, and avoid spraying if rain or strong wind is expected. Wishing you a healthy and blessed harvest!`
        : dist.riskLevel === 'Watch'
        ? `Assalam-o-Alaikum, dear friend! In ${dist.district} district, cool night dew has brought mild signs of ${dist.primaryDisease} on ${dist.primaryCrop} in about ${dist.activeOutbreaks} farms. No need to stress—just inspect your lower leaves over the next couple of days, keep weeds cleared around water channels, and spray only if needed in calm morning weather.`
        : `Assalam-o-Alaikum, dear farmer brother! Great news from ${dist.district} district—local crops including ${dist.primaryCrop} are looking healthy and safe with only ${dist.activeOutbreaks} minor reports. Keep up your regular watering and weekly field walks. May your harvest be prosperous!`;

    return { ur, ps, en };
  }

  getOutbreakHotspots() {
    const reports = scanRepository.getOutbreakReports();
    const districtCounts: Record<string, { count: number; severe: number }> = {};

    reports.forEach((rep) => {
      if (!districtCounts[rep.district]) {
        districtCounts[rep.district] = { count: 0, severe: 0 };
      }
      districtCounts[rep.district].count += 1;
      if (rep.severity === 'Severe') districtCounts[rep.district].severe += 1;
    });

    const districts: LocalizedDistrictOutbreak[] = KP_DISTRICTS_SURVEILLANCE.map((d) => {
      const live = districtCounts[d.district];
      const liveCount = live ? live.count : 0;
      const combinedTotal = d.activeOutbreaks + liveCount;
      const riskLevel: 'Normal' | 'Watch' | 'High Risk' =
        combinedTotal >= 20 ? 'High Risk' : combinedTotal >= 10 ? 'Watch' : 'Normal';

      const updatedStat: DistrictStat = {
        ...d,
        activeOutbreaks: combinedTotal,
        riskLevel,
      };

      return {
        ...updatedStat,
        recentLiveReports: liveCount,
        localizedName: {
          ur: this.districtNamesUr[d.district] || d.district,
          ps: this.districtNamesPs[d.district] || d.district,
          en: d.district,
        },
        localizedAlertText: this.buildLocalizedAlerts(updatedStat),
      };
    });

    return {
      summary: {
        totalDistrictsMonitored: districts.length,
        highRiskHotspots: districts.filter((d) => d.riskLevel === 'High Risk').length,
        totalAnonymousReports: reports.length + 1470,
      },
      districts,
      recentAnonymousFeed: reports.slice(0, 8),
    };
  }
}

export const outbreakService = new OutbreakSurveillanceService();
