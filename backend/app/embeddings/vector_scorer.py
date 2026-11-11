"""Token-Vector & Domain Similarity Scorer (backend/app/embeddings/vector_scorer.py)."""
import math
from typing import Set


class EmbeddingSimilarityScorer:
    """
    Token-vector and domain-feature similarity scorer for RAG document ranking.
    """

    def tokenize(self, text: str) -> Set[str]:
        cleaned = "".join(ch.lower() if ch.isalnum() else " " for ch in text)
        return {token for token in cleaned.split() if len(token) > 2}

    def score_relevance(
        self, query_text: str, document_text: str, is_crop_match: bool
    ) -> float:
        q_tokens = self.tokenize(query_text)
        d_tokens = self.tokenize(document_text)
        if not q_tokens or not d_tokens:
            return 0.45 if is_crop_match else 0.0

        overlap = len(q_tokens.intersection(d_tokens))
        denom = max(1.0, math.sqrt(len(q_tokens) * len(d_tokens)))
        crop_boost = 0.45 if is_crop_match else 0.0
        return round(min(0.99, (overlap / denom) + crop_boost), 3)


vector_scorer = EmbeddingSimilarityScorer()
