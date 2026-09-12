import asyncio
from typing import Dict, Any, List
from fastapi import APIRouter
from app.services.vector_store import vector_store
from app.services.llm import llm_service

router = APIRouter(prefix="/insights", tags=["Document Insights"])


@router.get("/stats")
async def get_document_stats() -> Dict[str, Any]:
    """
    Returns quantitative metrics on the loaded documents in the FAISS vector store.
    """
    try:
        total_chunks = vector_store.get_total_chunks()
        doc_objs = vector_store.get_all_documents()
        metadata = vector_store.metadata or []

        # Safe extraction of words and characters
        total_chars = 0
        total_words = 0
        for c in metadata:
            text = (c.get("text") or "").strip() if isinstance(c, dict) else ""
            if text:
                total_chars += len(text)
                total_words += len(text.split())

        avg_chunk_size = int(total_chars / max(1, total_chunks))
        total_reading_time = 0 if total_words == 0 else max(1, round(total_words / 200, 1))

        file_breakdown = []
        total_storage_bytes = 0

        for doc in doc_objs:
            fname = doc.get("filename", "Unknown") if isinstance(doc, dict) else str(doc)
            # Find chunks matching source safely
            doc_chunks = [
                c for c in metadata
                if isinstance(c, dict) and (c.get("metadata") or {}).get("source") == fname
            ]
            doc_text = " ".join(
                (c.get("text") or "").strip() for c in doc_chunks
                if isinstance(c, dict) and c.get("text")
            )
            doc_words = len(doc_text.split()) if doc_text else 0
            size_bytes = doc.get("file_size_bytes", 0) if isinstance(doc, dict) else 0
            total_storage_bytes += size_bytes
            chunks_count = len(doc_chunks) if doc_chunks else (doc.get("chunks_count", 0) if isinstance(doc, dict) else 0)

            # Determine extension
            ext = fname.split(".")[-1].lower() if "." in fname else "txt"
            percent_of_kb = round((chunks_count / max(1, total_chunks)) * 100, 1)

            file_breakdown.append({
                "filename": fname,
                "file_type": ext,
                "chunks": chunks_count,
                "estimated_words": doc_words,
                "reading_time_min": 0 if doc_words == 0 else max(1, round(doc_words / 200, 1)),
                "file_size_kb": round(size_bytes / 1024, 1),
                "file_size_bytes": size_bytes,
                "percent_of_total": percent_of_kb,
            })

        return {
            "total_documents": len(doc_objs),
            "total_chunks": total_chunks,
            "total_words": total_words,
            "average_chunk_chars": avg_chunk_size,
            "total_reading_time_min": total_reading_time,
            "total_size_kb": round(total_storage_bytes / 1024, 1),
            "total_size_mb": round(total_storage_bytes / (1024 * 1024), 2),
            "files": file_breakdown,
        }
    except Exception as e:
        return {
            "total_documents": 0,
            "total_chunks": 0,
            "total_words": 0,
            "average_chunk_chars": 0,
            "total_reading_time_min": 0,
            "total_size_kb": 0,
            "total_size_mb": 0,
            "files": [],
            "error": str(e)
        }


@router.get("/summary")
async def get_document_summary() -> Dict[str, Any]:
    """
    Generates an automated executive summary and key findings using Gemini.
    """
    doc_objs = vector_store.get_all_documents()
    metadata = vector_store.metadata or []

    if not doc_objs or not metadata:
        return {
            "has_documents": False,
            "summary": "No documents uploaded yet. Upload PDF, DOCX, or TXT documents to generate an executive intelligence summary.",
            "key_takeaways": [],
            "core_topics": []
        }

    filenames = [d["filename"] if isinstance(d, dict) else str(d) for d in doc_objs]

    # Sample representative chunks across documents (up to 8 chunks)
    sampled_chunks = []
    docs_represented = set()
    for chunk in metadata:
        src = chunk.get("metadata", {}).get("source")
        if src not in docs_represented or len(sampled_chunks) < 8:
            sampled_chunks.append(f"[{src}]\n{chunk.get('text', '')[:600]}")
            docs_represented.add(src)
        if len(sampled_chunks) >= 8:
            break

    context = "\n\n---\n\n".join(sampled_chunks)
    prompt = f"""You are DocMind AI, a senior research analyst.
Analyze the following document excerpts and produce a structured executive intelligence briefing.

Excerpts:
{context}

Format your response in structured Markdown with these exact sections:
### Executive Briefing
(A 2-3 paragraph synthesis of the primary themes, background, and objectives)

### Key Takeaways
- (Takeaway 1 with document grounding)
- (Takeaway 2 with document grounding)
- (Takeaway 3 with document grounding)

### Core Strategic Focus Areas
(List 3 to 4 prominent topics or domains discussed)
"""

    response_text = await asyncio.to_thread(llm_service.generate_response, prompt)

    return {
        "has_documents": True,
        "document_count": len(filenames),
        "documents": filenames,
        "summary": response_text
    }
