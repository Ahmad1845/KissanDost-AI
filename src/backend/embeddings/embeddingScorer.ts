/**
 * Token-vector and domain-feature similarity scorer for RAG document ranking.
 */
export class EmbeddingSimilarityScorer {
  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);
  }

  computeSimilarityScore(
    queryTokens: string[],
    docText: string,
    cropMatch: boolean,
    classMatch: boolean
  ): number {
    const docTokens = new Set(this.tokenize(docText));
    let overlap = 0;
    for (const token of queryTokens) {
      if (docTokens.has(token)) overlap += 1;
    }
    const lexicalScore =
      queryTokens.length > 0
        ? overlap / Math.sqrt(queryTokens.length * Math.max(1, docTokens.size))
        : 0;
    const boost = (cropMatch ? 0.45 : 0) + (classMatch ? 0.35 : 0);
    return Number(Math.min(0.99, lexicalScore + boost).toFixed(3));
  }
}

export const embeddingScorer = new EmbeddingSimilarityScorer();
