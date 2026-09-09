import os
import asyncio
from typing import Dict, Any, List
from fastapi import UploadFile
from app.core.config import settings
from app.utils.helper import validate_file
from app.services.loader import load_document
from app.services.chunker import chunker
from app.services.vector_store import vector_store
from app.services.retriever import retriever
from app.services.prompt import build_system_prompt
from app.services.llm import llm_service
from app.schemas.chat import ChatResponse


class RAGPipeline:
    async def process_and_index_file(self, file: UploadFile) -> Dict[str, Any]:
        # Validate filename and size
        contents = await file.read()
        file_size = len(contents)
        sanitized_name = validate_file(file.filename, file_size)

        # Save to documents directory
        save_path = os.path.join(settings.absolute_documents_dir, sanitized_name)
        with open(save_path, "wb") as f:
            f.write(contents)

        def _index_worker():
            raw_docs = load_document(save_path, sanitized_name)
            chunks = chunker.split_documents(raw_docs)
            return vector_store.add_chunks(chunks)

        indexed_count = await asyncio.to_thread(_index_worker)

        return {
            "filename": sanitized_name,
            "chunks_indexed": indexed_count,
            "total_vectors": vector_store.get_total_chunks()
        }

    def answer_query(self, query: str) -> ChatResponse:
        chunks, citations = retriever.retrieve_context(query)
        prompt = build_system_prompt(query, chunks)
        answer = llm_service.generate_response(prompt)

        return ChatResponse(
            query=query,
            answer=answer,
            citations=citations,
            retrieved_chunks_count=len(chunks)
        )


rag_pipeline = RAGPipeline()
