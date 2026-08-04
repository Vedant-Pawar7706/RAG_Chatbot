from typing import List, Dict, Any, Tuple
from app.services.vector_store import vector_store
from app.schemas.chat import Citation


class RetrieverService:
    def retrieve_context(self, query: str, top_k: int = None) -> Tuple[List[Dict[str, Any]], List[Citation]]:
        results = vector_store.search(query, top_k=top_k)
        chunks = []
        citations = []

        for chunk_data, score in results:
            chunks.append(chunk_data)
            meta = chunk_data.get("metadata", {})
            citations.append(
                Citation(
                    source=meta.get("source", "Unknown"),
                    page=meta.get("page"),
                    score=round(score, 4),
                    text=chunk_data.get("text", "")[:300]
                )
            )

        return chunks, citations


retriever = RetrieverService()
