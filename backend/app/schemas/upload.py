from typing import List, Optional
from pydantic import BaseModel


class UploadResponse(BaseModel):
    filename: str
    message: str
    chunks_indexed: int
    total_vectors: int


class DocumentItem(BaseModel):
    filename: str
    chunks_count: int
    upload_time: str
    file_size_bytes: int


class DocumentListResponse(BaseModel):
    documents: List[DocumentItem]
    total_documents: int
    total_chunks: int


class DeleteResponse(BaseModel):
    filename: str
    message: str
    remaining_documents: int
    remaining_chunks: int


class ClearResponse(BaseModel):
    message: str
