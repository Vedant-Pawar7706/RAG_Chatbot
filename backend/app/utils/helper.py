import os
import re
from fastapi import HTTPException
from app.core.config import settings

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


def is_allowed_file(filename: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS


def sanitize_filename(filename: str) -> str:
    # Remove path traversal characters and invalid symbols
    basename = os.path.basename(filename)
    sanitized = re.sub(r"[^\w\s\.-]", "_", basename)
    return sanitized.strip()


def validate_file(filename: str, file_size: int) -> str:
    if not is_allowed_file(filename):
        ext = os.path.splitext(filename)[1]
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    return sanitize_filename(filename)
