// Scan & Outbreak Repository (src/backend/repositories/scanRepository.ts)
export interface OutbreakReportRecord {
  id: string;
  district: string;
  village: string;
  crop: string;
  disease: string;
  severity: string;
  timestamp: string;
}

export interface FeedbackRecord {
  scanId: string;
  rating: number;
  helpful: boolean;
  comments: string;
  createdAt: string;
}

/**
 * Repository Layer for Diagnosis History, Outbreak Reports, and Farmer Feedback
 * Supports paginated queries and clean data access abstraction.
 */
export class ScanAndOutbreakRepository {
  private diagnosisHistory: any[] = [];
  private outbreakReports: OutbreakReportRecord[] = [
    {
      id: 'rep-001',
      district: 'Mardan',
      village: 'Gujar Garhi',
      crop: 'Tomato',
      disease: 'Leaf Blight (پتوں کا جھلساؤ)',
      severity: 'Moderate',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'rep-002',
      district: 'Mardan',
      village: 'Toru',
      crop: 'Tomato',
      disease: 'Leaf Blight (پتوں کا جھلساؤ)',
      severity: 'Severe',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'rep-003',
      district: 'Swabi',
      village: 'Topi',
      crop: 'Maize',
      disease: 'Leaf Spot (مکئی کے پتوں کے دھبے)',
      severity: 'Mild',
      timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
    },
    {
      id: 'rep-004',
      district: 'Nowshera',
      village: 'Akora Khattak',
      crop: 'Wheat',
      disease: 'Yellow Rust (گندم کی پیلی کنگی)',
      severity: 'Moderate',
      timestamp: new Date(Date.now() - 3600000 * 42).toISOString(),
    },
  ];
  private feedbacks: FeedbackRecord[] = [];

  saveDiagnosis(record: any): void {
    this.diagnosisHistory.unshift(record);
    if (this.diagnosisHistory.length > 200) {
      this.diagnosisHistory = this.diagnosisHistory.slice(0, 200);
    }
  }

  getPaginatedHistory(page: number = 1, limit: number = 20, district?: string) {
    const filtered = district
      ? this.diagnosisHistory.filter((item) => item.district?.toLowerCase() === district.toLowerCase())
      : this.diagnosisHistory;

    const start = (Math.max(1, page) - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      },
    };
  }

  addOutbreakReport(report: Omit<OutbreakReportRecord, 'id' | 'timestamp'>): OutbreakReportRecord {
    const entry: OutbreakReportRecord = {
      id: `rep-${Date.now().toString(36)}`,
      ...report,
      timestamp: new Date().toISOString(),
    };
    this.outbreakReports.unshift(entry);
    if (this.outbreakReports.length > 100) {
      this.outbreakReports = this.outbreakReports.slice(0, 100);
    }
    return entry;
  }

  getOutbreakReports(): OutbreakReportRecord[] {
    return this.outbreakReports;
  }

  saveFeedback(feedback: Omit<FeedbackRecord, 'createdAt'>): FeedbackRecord {
    const record: FeedbackRecord = {
      ...feedback,
      createdAt: new Date().toISOString(),
    };
    this.feedbacks.unshift(record);
    return record;
  }

  getFeedbacks(): FeedbackRecord[] {
    return this.feedbacks;
  }
}

export const scanRepository = new ScanAndOutbreakRepository();
