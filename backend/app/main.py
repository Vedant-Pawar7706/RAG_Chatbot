import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import upload, chat, documents, delete, clear, auth, insights
from app.services.vector_store import vector_store

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("docmind_ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifespan handler.
    """
    logger.info("Initializing DocMind AI Backend...")
    logger.info(f"Documents directory: {settings.absolute_documents_dir}")
    logger.info(f"Vectorstore directory: {settings.absolute_vectorstore_dir}")
    logger.info(f"Active FAISS total vectors: {vector_store.get_total_chunks()}")
    yield
    logger.info("Shutting down DocMind AI Backend.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Production-Ready DocMind AI - Retrieval-Augmented Generation (RAG) API powered by FastAPI, FAISS, SentenceTransformers, and Google Gemini 2.5 Flash.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
configured_origins = list(settings.cors_origins_list)
if "*" in configured_origins:
    cors_origins = ["*"]
else:
    if "https://docmind-frontend-9rkj.onrender.com" not in configured_origins:
        configured_origins.append("https://docmind-frontend-9rkj.onrender.com")
    cors_origins = configured_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=getattr(settings, "CORS_ORIGIN_REGEX", None),
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
app.include_router(auth.router)
app.include_router(insights.router)


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
    uvicorn.run("app.main:app", host="127.0.0.1", port=8080, reload=True)
