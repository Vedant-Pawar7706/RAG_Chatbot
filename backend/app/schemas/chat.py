from typing import List, Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User question or prompt")
    persona: Optional[str] = Field(default="analyst", description="AI Persona: analyst, executive, legal, architect")
    session_id: Optional[str] = Field(default=None, description="Optional chat session identifier")


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
    suggested_followups: List[str] = Field(default_factory=list, description="Smart follow-up suggestions")
