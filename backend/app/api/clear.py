import os
from fastapi import APIRouter, HTTPException
from app.core.config import settings
from app.schemas.upload import ClearResponse
from app.services.vector_store import vector_store

router = APIRouter(prefix="", tags=["Clear"])


@router.post("/clear", response_model=ClearResponse)
async def clear_all_documents():
    try:
        vector_store.clear()
        doc_dir = settings.absolute_documents_dir
        if os.path.exists(doc_dir):
            for filename in os.listdir(doc_dir):
                file_path = os.path.join(doc_dir, filename)
                if os.path.isfile(file_path):
                    try:
                        os.remove(file_path)
                    except Exception:
                        pass

        return ClearResponse(
            message="All documents and vector embeddings have been cleared."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear knowledge base: {str(e)}")
