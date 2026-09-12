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

    def answer_query(self, query: str, persona: str = "analyst") -> ChatResponse:
        chunks, citations = retriever.retrieve_context(query)
        prompt = build_system_prompt(query, chunks, persona=persona)
        answer = llm_service.generate_response(prompt)

        # Generate intelligent follow-up suggestions
        suggested_followups = []
        if chunks and len(answer) > 20:
            try:
                followup_prompt = f"""Based on this user question and document-grounded answer:
Question: {query}
Answer summary: {answer[:500]}

Generate exactly 3 concise, natural follow-up questions (under 12 words each) that a user would likely ask next.
Return ONLY 3 bullet lines starting with '-', no other text."""
                raw_followups = llm_service.generate_response(followup_prompt)
                for line in raw_followups.strip().split("\n"):
                    clean = line.strip().lstrip("-*0123456789.) ").strip()
                    if clean and len(clean) > 5 and len(clean) < 100:
                        suggested_followups.append(clean)
                    if len(suggested_followups) >= 3:
                        break
            except Exception as e:
                pass

        # Fallback suggestions if none were generated or no documents loaded
        if not suggested_followups:
            if chunks:
                suggested_followups = [
                    f"Can you explain more details from {citations[0].source if citations else 'the sources'}?",
                    "What are the most critical risks or limitations mentioned?",
                    "Provide a bulleted executive summary of this section."
                ]
            else:
                suggested_followups = [
                    "How do I upload and index documents in DocMind AI?",
                    "What file formats (PDF, DOCX, TXT) are supported?",
                    "How does the zero-hallucination guarantee work?"
                ]

        return ChatResponse(
            query=query,
            answer=answer,
            citations=citations,
            retrieved_chunks_count=len(chunks),
            suggested_followups=suggested_followups[:3]
        )


rag_pipeline = RAGPipeline()
