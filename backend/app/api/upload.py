from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.upload import UploadResponse
from app.services.rag_pipeline import rag_pipeline

router = APIRouter(prefix="", tags=["Upload"])


@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    try:
        result = await rag_pipeline.process_and_index_file(file)
        return UploadResponse(
            filename=result["filename"],
            message=f"File '{result['filename']}' processed and indexed successfully.",
            chunks_indexed=result["chunks_indexed"],
            total_vectors=result["total_vectors"]
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
