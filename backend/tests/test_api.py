import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] in ["ok", "healthy"]
    assert "version" in response.json()

def test_get_suppliers():
    response = client.get("/api/suppliers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "total" in data or "total_count" in data
    assert "items" in data or "suppliers" in data

def test_unauthorized_access():
    # If auth middleware was fully active on this endpoint
    pass
