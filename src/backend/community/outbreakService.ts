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

  private buildLocalizedAlerts(dist: DistrictStat) {
    const urName = this.districtNamesUr[dist.district] || dist.district;
    const psName = this.districtNamesPs[dist.district] || dist.district;

    const ur =
      dist.riskLevel === 'High Risk'
        ? `خبردار کسان بھائی! ضلع ${urName} کے دیہات جیسے گجر گڑھی اور تورو میں ٹماٹر کے پتوں کے جھلساؤ کی بیماری تیزی سے پھیل رہی ہے۔ اب تک ${dist.activeOutbreaks} کھیتوں میں یہ بیماری دیکھی گئی ہے۔ آج ہی اپنے کھیت کے نچلے پتوں کو غور سے چیک کریں اور بارش کے دوران اسپرے نہ کریں۔`
        : dist.riskLevel === 'Watch'
        ? `کسان بھائی! ضلع ${urName} میں رات کی نمی کی وجہ سے فصل پر پتوں کے دھبوں کی شکایات آ رہی ہیں۔ اپنے کھیت کا معائنہ کرتے رہیں۔`
        : `الحمدللہ! ضلع ${urName} میں اس وقت فصلوں کی صورتحال معمول کے مطابق اور محفوظ ہے۔`;

    const ps =
      dist.riskLevel === 'High Risk'
        ? `السلام علیکم زما خوږو زمیندارانو وروڼو! په ضلع ${psName} او شاوخوا کلیو لکه ګجر ګړهي او تورو کې د ټماټرو د پاڼو د سوځېدو بیماري تېزه خپره شوې ده. تر اوسه په ${dist.activeOutbreaks} پټیو کې دا بیماري لیدل شوې ده. نن خپل فصل او لاندې پاڼې په غور چیک کړئ او د باران په وخت کې سپرے مه کوئ.`
        : dist.riskLevel === 'Watch'
        ? `السلام علیکم زمینداره وروره! په ضلع ${psName} کې د هوا د نمی او شبنم د وجې نه په ځینو پټیو کې د پاڼو د داغونو بیماري لیدل شوې ده. د خپل پټي خیال ساتئ.`
        : `الحمدلله! په ضلع ${psName} کې په دې وخت کې فصلونه بالکل روغ او محفوظ دي.`;

    const en = `In ${dist.district} district, ${dist.activeOutbreaks} farms reported ${dist.primaryDisease} on ${dist.primaryCrop}. Status is ${dist.riskLevel}. Check your lower crop leaves regularly.`;

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
