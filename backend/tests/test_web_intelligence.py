"""
Unit and Integration Tests for SupplyLens Web Intelligence, Extraction,
SSRF Protection, Normalization, Entity Resolution, and Discovery APIs.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.data.sources.apify import ApifyProvider
from app.data.normalization import normalizer
from app.services.extraction.contact_extractor import ContactExtractor
from app.data.entity_resolution.resolver import EntityResolver

client = TestClient(app)


def test_apify_ssrf_protection():
    """Verify SSRF protection strictly rejects malicious and private networks."""
    # Malicious / Internal targets
    assert not ApifyProvider.is_safe_url("http://localhost:8080/admin")
    assert not ApifyProvider.is_safe_url("http://127.0.0.1:3000")
    assert not ApifyProvider.is_safe_url("http://10.0.0.15/secret")
    assert not ApifyProvider.is_safe_url("http://192.168.1.1/router")
    assert not ApifyProvider.is_safe_url("http://169.254.169.254/latest/meta-data/")
    assert not ApifyProvider.is_safe_url("ftp://malicious.com")
    assert not ApifyProvider.is_safe_url("file:///etc/passwd")

    # Safe legitimate public domains
    assert ApifyProvider.is_safe_url("https://www.dinearth.com")
    assert ApifyProvider.is_safe_url("https://biogreenbags.com/contact")


def test_data_normalization():
    """Test standardizing company legal suffix, phone, and country."""
    raw = {
        "name": "   Acme Sustainable Packaging Pvt Ltd.   ",
        "legal_name": "Acme Sustainable Packaging Private Limited",
        "country": "Bharat",
        "city": "Mumbai",
        "website": "http://acmepack.com",
    }
    normalized = normalizer.normalize_supplier_data(raw)
    assert normalized["name"] == "Acme Sustainable Packaging"
    assert normalized["country"] == "India"
    assert normalized["country_code"] == "IN"
    assert normalized["website"].startswith("https://")


def test_contact_extraction_consumer_domain_filtering():
    """Ensure personal consumer email addresses are rejected from public business contacts."""
    text = """
    For business inquiries, email our export desk at sales@dinearth.com or contact our founder at founder123@gmail.com.
    You can also reach customer service at support@yahoo.com or info@dinearth.com.
    """
    contacts = ContactExtractor.extract_public_business_contacts(text, "https://www.dinearth.com", "dinearth.com")
    emails = [c["value"] for c in contacts if c["contact_type"] == "email"]
    
    assert "sales@dinearth.com" in emails
    assert "info@dinearth.com" in emails
    assert "founder123@gmail.com" not in emails
    assert "support@yahoo.com" not in emails


def test_entity_resolution_exact_domain():
    """Ensure exact domain match qualifies as strong match preventing duplicate creation."""
    existing_catalog = [
        {"id": "sup-001", "name": "Dinearth Eco Tableware", "website": "https://www.dinearth.com"}
    ]
    candidate = {"name": "Dinearth Official Store", "website": "https://www.dinearth.com/about"}
    res = EntityResolver.resolve_entity(candidate, existing_catalog)
    assert res["match_type"] == "STRONG_MATCH"
    assert res["matched_id"] == "sup-001"
    assert res["confidence"] >= 0.90


def test_admin_providers_api():
    """Verify GET /api/v1/admin/providers returns active providers with live credentials."""
    response = client.get("/api/v1/admin/providers")
    assert response.status_code == 200
    data = response.json()
    assert "providers" in data
    assert data["total_active"] >= 4
    provider_ids = [p["provider_id"] for p in data["providers"]]
    assert "gemini" in provider_ids
    assert "nimbleway" in provider_ids
    assert "apify" in provider_ids
    assert "geoapify" in provider_ids


def test_admin_providers_usage_api():
    """Verify GET /api/v1/admin/providers/usage returns telemetry and cost summaries."""
    response = client.get("/api/v1/admin/providers/usage")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "total_requests" in data
    assert "total_cost_usd" in data


def test_discovery_search_and_job_lifecycle():
    """Verify asynchronous search creation, polling, and results retrieval."""
    post_res = client.post("/api/v1/search", json={
        "query": "Eco-friendly sugarcane bagasse tableware manufacturers",
        "max_results": 1
    })
    assert post_res.status_code == 200
    job_data = post_res.json()
    assert "job_id" in job_data
    assert job_data["status"] == "queued"

    job_id = job_data["job_id"]
    status_res = client.get(f"/api/v1/search/{job_id}")
    assert status_res.status_code == 200
    assert status_res.json()["job_id"] == job_id

    results_res = client.get(f"/api/v1/search/{job_id}/results")
    assert results_res.status_code == 200
    assert "suppliers" in results_res.json()
