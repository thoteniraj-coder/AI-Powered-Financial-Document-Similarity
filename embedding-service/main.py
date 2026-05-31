"""
Embedding microservice for AI-Powered Financial Document Similarity Finder.

Provides REST endpoints to generate 384-dimensional embeddings using
the sentence-transformers/all-MiniLM-L6-v2 model.
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from sentence_transformers import SentenceTransformer

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("embedding-service")

# ---------------------------------------------------------------------------
# Global model reference
# ---------------------------------------------------------------------------
MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDING_DIM = 384
MAX_BATCH_SIZE = 100

model: SentenceTransformer | None = None


# ---------------------------------------------------------------------------
# Lifespan – load the model once at startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    logger.info("Loading SentenceTransformer model '%s' …", MODEL_NAME)
    start = time.perf_counter()
    model = SentenceTransformer(MODEL_NAME)
    elapsed = time.perf_counter() - start
    logger.info("Model loaded in %.2f s  (dimensions=%d)", elapsed, EMBEDDING_DIM)
    yield
    logger.info("Shutting down embedding service")
    model = None


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Embedding Service",
    description="Generates sentence embeddings for financial document similarity",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class EmbedRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to embed")

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("text must not be blank or whitespace-only")
        return v


class EmbedResponse(BaseModel):
    embedding: List[float]


class EmbedBatchRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, description="List of texts to embed")

    @field_validator("texts")
    @classmethod
    def texts_must_be_valid(cls, v: List[str]) -> List[str]:
        if len(v) > MAX_BATCH_SIZE:
            raise ValueError(
                f"Batch size {len(v)} exceeds maximum of {MAX_BATCH_SIZE}"
            )
        for idx, text in enumerate(v):
            if not text or not text.strip():
                raise ValueError(
                    f"texts[{idx}] must not be empty or whitespace-only"
                )
        return v


class EmbedBatchResponse(BaseModel):
    embeddings: List[List[float]]


class HealthResponse(BaseModel):
    status: str
    model: str
    dimensions: int


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health", response_model=HealthResponse)
async def health():
    """Health-check endpoint."""
    return HealthResponse(
        status="healthy",
        model=MODEL_NAME,
        dimensions=EMBEDDING_DIM,
    )


@app.post("/embed", response_model=EmbedResponse)
async def embed(request: EmbedRequest):
    """Generate an embedding for a single text."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    logger.info("POST /embed  text_length=%d", len(request.text))
    start = time.perf_counter()

    try:
        vector = model.encode(request.text, convert_to_numpy=True)
        embedding = vector.tolist()
    except Exception as exc:
        logger.exception("Encoding failed")
        raise HTTPException(status_code=500, detail=f"Encoding error: {exc}") from exc

    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info("POST /embed  completed in %.1f ms", elapsed_ms)
    return EmbedResponse(embedding=embedding)


@app.post("/embed-batch", response_model=EmbedBatchResponse)
async def embed_batch(request: EmbedBatchRequest):
    """Generate embeddings for a batch of texts."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    count = len(request.texts)
    logger.info("POST /embed-batch  batch_size=%d", count)
    start = time.perf_counter()

    try:
        vectors = model.encode(request.texts, convert_to_numpy=True)
        embeddings = vectors.tolist()
    except Exception as exc:
        logger.exception("Batch encoding failed")
        raise HTTPException(status_code=500, detail=f"Encoding error: {exc}") from exc

    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "POST /embed-batch  batch_size=%d  completed in %.1f ms (%.1f ms/item)",
        count,
        elapsed_ms,
        elapsed_ms / count,
    )
    return EmbedBatchResponse(embeddings=embeddings)
