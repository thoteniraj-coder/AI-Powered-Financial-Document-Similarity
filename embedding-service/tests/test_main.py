"""
Tests for the embedding service endpoints.

Uses httpx.ASGITransport so the full FastAPI app (including lifespan)
is exercised without starting a real server.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from main import app

EMBEDDING_DIM = 384


@pytest.fixture()
async def client():
    """Async test client that triggers the app lifespan (model loading)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ------------------------------------------------------------------
# Health
# ------------------------------------------------------------------
@pytest.mark.anyio
async def test_health_returns_200(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model"] == "all-MiniLM-L6-v2"
    assert data["dimensions"] == EMBEDDING_DIM


# ------------------------------------------------------------------
# POST /embed
# ------------------------------------------------------------------
@pytest.mark.anyio
async def test_embed_returns_384_dimensions(client: AsyncClient):
    response = await client.post("/embed", json={"text": "quarterly earnings report"})
    assert response.status_code == 200
    data = response.json()
    assert "embedding" in data
    assert len(data["embedding"]) == EMBEDDING_DIM
    assert all(isinstance(v, float) for v in data["embedding"])


@pytest.mark.anyio
async def test_embed_empty_text_returns_422(client: AsyncClient):
    response = await client.post("/embed", json={"text": ""})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_embed_whitespace_only_returns_422(client: AsyncClient):
    response = await client.post("/embed", json={"text": "   "})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_embed_missing_field_returns_422(client: AsyncClient):
    response = await client.post("/embed", json={})
    assert response.status_code == 422


# ------------------------------------------------------------------
# POST /embed-batch
# ------------------------------------------------------------------
@pytest.mark.anyio
async def test_embed_batch_returns_correct_count(client: AsyncClient):
    texts = ["revenue growth", "net income", "cash flow statement"]
    response = await client.post("/embed-batch", json={"texts": texts})
    assert response.status_code == 200
    data = response.json()
    assert "embeddings" in data
    assert len(data["embeddings"]) == len(texts)
    for emb in data["embeddings"]:
        assert len(emb) == EMBEDDING_DIM


@pytest.mark.anyio
async def test_embed_batch_empty_list_returns_422(client: AsyncClient):
    response = await client.post("/embed-batch", json={"texts": []})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_embed_batch_with_blank_entry_returns_422(client: AsyncClient):
    response = await client.post("/embed-batch", json={"texts": ["valid", ""]})
    assert response.status_code == 422
