import os
from fastapi import APIRouter, HTTPException
from app.core.config import settings
from app.schemas.upload import DeleteResponse
from app.services.vector_store import vector_store

router = APIRouter(prefix="", tags=["Delete"])


@router.delete("/documents/{filename}", response_model=DeleteResponse)
async def delete_document(filename: str):
    try:
        deleted = vector_store.delete_document(filename)
        file_path = os.path.join(settings.absolute_documents_dir, filename)
        if os.path.exists(file_path):
            os.remove(file_path)

        if not deleted and not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Document '{filename}' not found.")

        return DeleteResponse(
            filename=filename,
            message=f"Document '{filename}' removed from vector index and storage.",
            remaining_documents=len(vector_store.get_all_documents()),
            remaining_chunks=vector_store.get_total_chunks()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")
