import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "RAG-Chatbot"
    DEBUG: bool = True
    GOOGLE_API_KEY: str = ""

    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    GEMINI_MODEL_NAME: str = "gemini-3.6-flash"

    DOCUMENTS_DIR: str = "documents"
    VECTORSTORE_DIR: str = "vectorstore"
    FAISS_INDEX_PATH: str = "vectorstore/index.faiss"
    FAISS_METADATA_PATH: str = "vectorstore/metadata.pkl"

    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K_RESULTS: int = 5
    MAX_UPLOAD_SIZE_MB: int = 10

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:5174,http://127.0.0.1:5174"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def absolute_documents_dir(self) -> str:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        path = os.path.join(base_dir, self.DOCUMENTS_DIR)
        os.makedirs(path, exist_ok=True)
        return path

    @property
    def absolute_vectorstore_dir(self) -> str:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        path = os.path.join(base_dir, self.VECTORSTORE_DIR)
        os.makedirs(path, exist_ok=True)
        return path

    @property
    def absolute_faiss_index_path(self) -> str:
        return os.path.join(self.absolute_vectorstore_dir, "index.faiss")

    @property
    def absolute_faiss_metadata_path(self) -> str:
        return os.path.join(self.absolute_vectorstore_dir, "metadata.pkl")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
