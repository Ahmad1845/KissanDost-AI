import { AGRICULTURAL_KNOWLEDGE_BASE, VERIFIED_PESTICIDES_DB } from '../../data/knowledgeBase.ts';
import { RankedRagDocument } from '../schemas/apiSchemas.ts';
import { embeddingScorer } from '../embeddings/embeddingScorer.ts';

/**
 * Retrieval-Augmented Generation (RAG) Service (src/backend/rag/ragService.ts)
 *
 * Responsibilities:
 * - Retrieve agricultural extension documents (KP Agriculture Dept & PARC manuals)
 * - Retrieve verified medicine registry information
 * - Retrieve government advisories & withholding safety rules
 * - Rank retrieved documents via `embeddingScorer` (`embeddings/embeddingScorer.ts`)
 * - Pass only the top-K relevant context to the Decision Engine & Gemini LLM
 */
export class AgriculturalRagService {
  retrieveAndRankContext(params: {
    crop: string;
    predictedClassId: string;
    symptoms: string[];
    district: string;
    topK?: number;
  }): {
    rankedDocuments: RankedRagDocument[];
    relevantMedicines: typeof VERIFIED_PESTICIDES_DB;
    governmentAdvisories: string[];
    promptContextBlock: string;
  } {
    const { crop, predictedClassId, symptoms, district, topK = 3 } = params;
    const queryStr = `${crop} ${predictedClassId.replace(/_/g, ' ')} ${symptoms.join(' ')} ${district}`;
    const queryTokens = embeddingScorer.tokenize(queryStr);

    const scoredDocs: RankedRagDocument[] = AGRICULTURAL_KNOWLEDGE_BASE.map((doc) => {
      const serializedRules = doc.decisionRules.map(
        (r) => `${r.condition}: ${r.action} (${r.sprayWindow}) — ${r.reason}`
      );
      const fullText = `${doc.crop} ${doc.disease} ${doc.title} ${doc.symptoms.join(' ')} ${serializedRules.join(' ')}`;
      const cropMatch = doc.crop.toLowerCase() === crop.toLowerCase();
      const classMatch = predictedClassId.toLowerCase().includes(doc.crop.toLowerCase());
      const relevanceScore = embeddingScorer.computeSimilarityScore(
        queryTokens,
        fullText,
        cropMatch,
        classMatch
      );

      return {
        id: doc.id,
        title: doc.title,
        source: doc.source,
        crop: doc.crop,
        disease: doc.disease,
        relevanceScore,
        decisionRules: serializedRules,
        approvedTreatments: doc.approvedTreatments.map((t) => ({
          name: t.name,
          dosage: t.dosage,
          withholding: t.withholdingPeriod,
          ppe: t.safetyPPE,
        })),
        organicAlternatives: doc.organicAlternatives,
      };
    })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topK);

    const relevantMedicines = VERIFIED_PESTICIDES_DB.filter(
      (med) =>
        med.status === 'Suitable' &&
        med.targetCrops.some((c) => c.toLowerCase() === crop.toLowerCase())
    );

    const governmentAdvisories = [
      'KP Agriculture Extension Rule: Never spray fungicides when 6-hour rain probability exceeds 40% or wind speed exceeds 18 km/h.',
      'KP Plant Protection Advisory: Enforce strict Pre-Harvest Interval (PHI) withholding periods (7 days for Mancozeb on Tomato; 28 days for Propiconazole on Wheat).',
      ' Integrated Pest Management (IPM): Prioritize mechanical removal of lower infected leaves and 5% Neem seed kernel extract for mild infections.',
    ];

    const promptContextBlock = scoredDocs
      .map(
        (d, idx) =>
          `[RAG Doc #${idx + 1} | Score=${d.relevanceScore} | ${d.source}]: ${d.title}\n` +
          `  - Rules: ${d.decisionRules.join('; ')}\n` +
          `  - Approved Treatments: ${d.approvedTreatments.map((t) => `${t.name} (${t.dosage}, PHI: ${t.withholding})`).join(' | ')}\n` +
          `  - Organic Alternatives: ${d.organicAlternatives.join('; ')}`
      )
      .join('\n\n');

    return {
      rankedDocuments: scoredDocs,
      relevantMedicines,
      governmentAdvisories,
      promptContextBlock,
    };
  }
}

export const ragService = new AgriculturalRagService();
