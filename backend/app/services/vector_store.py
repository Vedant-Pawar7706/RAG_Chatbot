import os
import pickle
import faiss
import numpy as np
from typing import List, Dict, Any, Tuple
from app.core.config import settings
from app.services.embedder import embedder


class FAISSVectorStore:
    def __init__(self):
        self.index_path = settings.absolute_faiss_index_path
        self.metadata_path = settings.absolute_faiss_metadata_path
        self.dimension = 384
        self.index = None
        self.metadata: List[Dict[str, Any]] = []
        self._load_or_create()

    def _load_or_create(self):
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.metadata_path, "rb") as f:
                    self.metadata = pickle.load(f)
                return
            except Exception as e:
                print(f"Error loading FAISS index: {e}, creating new index.")

        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata = []
        self._save()

    def _save(self):
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, "wb") as f:
            pickle.dump(self.metadata, f)

    def add_chunks(self, chunks: List[Dict[str, Any]]):
        if not chunks:
            return 0

        texts = [c["text"] for c in chunks]
        embeddings = embedder.embed_texts(texts)

        self.index.add(embeddings)
        self.metadata.extend(chunks)
        self._save()
        return len(chunks)

    def search(self, query: str, top_k: int = None) -> List[Tuple[Dict[str, Any], float]]:
        top_k = top_k or settings.TOP_K_RESULTS
        if self.index.ntotal == 0:
            return []

        query_vector = embedder.embed_query(query)
        actual_k = min(top_k, self.index.ntotal)
        scores, indices = self.index.search(query_vector, actual_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx >= 0 and idx < len(self.metadata):
                results.append((self.metadata[idx], float(score)))
        return results

    def delete_document(self, filename: str) -> bool:
        remaining_chunks = [c for c in self.metadata if c.get("metadata", {}).get("source") != filename]
        if len(remaining_chunks) == len(self.metadata):
            return False  # Document not found

        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata = []

        if remaining_chunks:
            texts = [c["text"] for c in remaining_chunks]
            embeddings = embedder.embed_texts(texts)
            self.index.add(embeddings)
            self.metadata = remaining_chunks

        self._save()
        return True

    def clear(self):
        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata = []
        self._save()

    def get_total_chunks(self) -> int:
        return self.index.ntotal if self.index else 0

    def get_all_documents(self) -> List[Dict[str, Any]]:
        docs_summary: Dict[str, Dict[str, Any]] = {}
        for c in self.metadata:
            source = c.get("metadata", {}).get("source", "Unknown")
            if source not in docs_summary:
                docs_summary[source] = {
                    "filename": source,
                    "chunks_count": 0,
                    "upload_time": "Indexed",
                    "file_size_bytes": 0
                }
            docs_summary[source]["chunks_count"] += 1

        # Check document sizes on disk
        for filename in docs_summary:
            file_path = os.path.join(settings.absolute_documents_dir, filename)
            if os.path.exists(file_path):
                docs_summary[filename]["file_size_bytes"] = os.path.getsize(file_path)

        return list(docs_summary.values())


vector_store = FAISSVectorStore()
