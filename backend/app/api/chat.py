from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag_pipeline import rag_pipeline

router = APIRouter(prefix="", tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        response = rag_pipeline.answer_query(request.query)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating chat answer: {str(e)}")
