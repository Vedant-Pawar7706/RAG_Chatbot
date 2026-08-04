import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import upload, chat, documents, delete, clear
from app.services.vector_store import vector_store

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("rag_chatbot")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifespan handler.
    """
    logger.info("Initializing RAG Chatbot Backend...")
    logger.info(f"Documents directory: {settings.absolute_documents_dir}")
    logger.info(f"Vectorstore directory: {settings.absolute_vectorstore_dir}")
    logger.info(f"Active FAISS total vectors: {vector_store.get_total_chunks()}")
    yield
    logger.info("Shutting down RAG Chatbot Backend.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Production-Ready Retrieval-Augmented Generation (RAG) Chatbot API powered by FastAPI, FAISS, SentenceTransformers, and Google Gemini 2.5 Flash.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(upload.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(delete.router)
app.include_router(clear.router)


@app.get("/", tags=["Health Check"])
async def root():
    """
    Health check endpoint returning application status and total indexed vectors.
    """
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "model": settings.GEMINI_MODEL_NAME,
        "total_documents": len(vector_store.get_all_documents()),
        "total_chunks": vector_store.get_total_chunks()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
