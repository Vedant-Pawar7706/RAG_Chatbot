from fastapi import APIRouter
from app.schemas.upload import DocumentListResponse, DocumentItem
from app.services.vector_store import vector_store

router = APIRouter(prefix="", tags=["Documents"])


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents():
    docs_raw = vector_store.get_all_documents()
    documents = [
        DocumentItem(
            filename=d["filename"],
            chunks_count=d["chunks_count"],
            upload_time=d["upload_time"],
            file_size_bytes=d["file_size_bytes"]
        )
        for d in docs_raw
    ]
    return DocumentListResponse(
        documents=documents,
        total_documents=len(documents),
        total_chunks=vector_store.get_total_chunks()
    )
