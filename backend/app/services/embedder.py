import numpy as np
from typing import List
from sentence_transformers import SentenceTransformer
from app.core.config import settings


class EmbedderService:
    def __init__(self, model_name: str = None):
        self.model_name = model_name or settings.EMBEDDING_MODEL_NAME
        self.model = SentenceTransformer(self.model_name)

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, 384), dtype=np.float32)
        embeddings = self.model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        return embeddings.astype(np.float32)

    def embed_query(self, query: str) -> np.ndarray:
        embedding = self.model.encode([query], convert_to_numpy=True, normalize_embeddings=True)
        return embedding.astype(np.float32)


embedder = EmbedderService()
