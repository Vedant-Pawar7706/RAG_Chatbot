import os
from typing import List, Dict, Any
from pypdf import PdfReader
from docx import Document as DocxDocument


def load_pdf(file_path: str, filename: str) -> List[Dict[str, Any]]:
    pages = []
    reader = PdfReader(file_path)
    total_pages = len(reader.pages)
    for idx, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        if text.strip():
            pages.append({
                "text": text.strip(),
                "metadata": {
                    "source": filename,
                    "page": idx + 1,
                    "total_pages": total_pages
                }
            })
    return pages


def load_docx(file_path: str, filename: str) -> List[Dict[str, Any]]:
    doc = DocxDocument(file_path)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    full_text = "\n\n".join(paragraphs)
    if not full_text.strip():
        return []
    return [{
        "text": full_text,
        "metadata": {
            "source": filename,
            "page": 1,
            "total_pages": 1
        }
    }]


def load_txt(file_path: str, filename: str) -> List[Dict[str, Any]]:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read().strip()
    if not text:
        return []
    return [{
        "text": text,
        "metadata": {
            "source": filename,
            "page": 1,
            "total_pages": 1
        }
    }]


def load_document(file_path: str, filename: str) -> List[Dict[str, Any]]:
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf":
        return load_pdf(file_path, filename)
    elif ext == ".docx":
        return load_docx(file_path, filename)
    elif ext == ".txt":
        return load_txt(file_path, filename)
    else:
        raise ValueError(f"Unsupported file format: {ext}")
