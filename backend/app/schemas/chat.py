from typing import List, Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User question or prompt")


class Citation(BaseModel):
    source: str
    page: Optional[int] = None
    score: float
    text: str


class ChatResponse(BaseModel):
    query: str
    answer: str
    citations: List[Citation]
    retrieved_chunks_count: int
