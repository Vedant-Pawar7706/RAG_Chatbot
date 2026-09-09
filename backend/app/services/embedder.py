import numpy as np
from typing import List
from app.core.config import settings
from google import genai
from google.genai import types


class EmbedderService:
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        self.model_name = "gemini-embedding-001"
        self.dimension = 3072
        self.client = None
        if self.api_key and self.api_key != "your_google_gemini_api_key_here":
            try:
                self.client = genai.Client(
                    api_key=self.api_key,
                    http_options=types.HttpOptions(timeout=15000)
                )
            except Exception:
                pass

    def _get_client(self):
        if not self.client:
            self.client = genai.Client(
                api_key=self.api_key,
                http_options=types.HttpOptions(timeout=15000)
            )
        return self.client

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, self.dimension), dtype=np.float32)

        client = self._get_client()
        embeddings = []
        # Batch in chunks of 50 for safety
        batch_size = 50
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            res = client.models.embed_content(
                model=self.model_name,
                contents=batch
            )
            for item in res.embeddings:
                embeddings.append(item.values)

        arr = np.array(embeddings, dtype=np.float32)
        # Normalize for cosine similarity / inner product
        norms = np.linalg.norm(arr, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return (arr / norms).astype(np.float32)

    def embed_query(self, query: str) -> np.ndarray:
        client = self._get_client()
        res = client.models.embed_content(
            model=self.model_name,
            contents=query
        )
        vec = np.array([res.embeddings[0].values], dtype=np.float32)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.astype(np.float32)


embedder = EmbedderService()
