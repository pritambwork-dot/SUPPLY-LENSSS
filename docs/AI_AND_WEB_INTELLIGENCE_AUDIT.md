# SupplyLens AI & Web Intelligence Audit Report

## 1. Executive Summary
This audit reviews the AI orchestration, web intelligence, web scraping, and supplier verification architecture across the SupplyLens codebase. It examines Google Gemini, Nimbleway, Apify, DeepSeek, Geoapify, Supabase/PostgreSQL schema, deterministic verification, and frontend integration.

---

## 2. Infrastructure & Provider Verification Status

| Provider / Module | Configured Key | Active Endpoint Tested | Live Status | Capabilities Verified |
| :--- | :--- | :--- | :--- | :--- |
| **Google Gemini** | `GEMINI_API_KEY` | `gemini-flash-lite-latest` via SDK & REST | **OPERATIONAL (HTTP 200)** | Business understanding, requirement extraction, SSE token streaming, tool orchestration |
| **Nimbleway** | `NIMBLEWAY_API_KEY` | `https://sdk.nimbleway.com/v2/search`, `/crawl` | **OPERATIONAL (HTTP 200 / 201)** | Real-time global supplier discovery, search filtering, asynchronous crawl queue |
| **Apify** | `APIFY_API_KEY` | `https://api.apify.com/v2/users/me` | **OPERATIONAL (HTTP 200)** | Verified account `tuned_computer`, actor execution for website content crawling |
| **Geoapify** | `GEOAPIFY_API_KEY` | `https://api.geoapify.com/v1/geocode/search` | **OPERATIONAL (HTTP 200)** | Verified coordinate & address geocoding (`Bhubaneshwar, India`) |
| **DeepSeek** | `DEEPSEEK_API_KEY` | `https://api.deepseek.com/v1/models` | **OPERATIONAL (HTTP 200)** | Models `['deepseek-flash', 'deepseek-v4-pro']` available for deep research dossiers |
| **Supabase / PostgreSQL** | `DATABASE_URL` | Local PostgreSQL + SQLite fallback | **OPERATIONAL** | Relational schemas, RLS, provenance tables initialized |
| **ML Models** | Scikit-learn / OR-Tools | `app/services/ml` & `optimization_engine` | **OPERATIONAL** | Verified via `test_ml.py` (2 passed) |

---

## 3. Existing Codebase Audit Findings

### 3.1 Data Sources & Extraction
- `backend/app/data/sources/nimbleway.py`: Basic search implemented against `https://sdk.nimbleway.com/v2/search`. Needs enhancement for structured parameter passing, language, domain filtering, and rate monitoring.
- `backend/app/data/sources/apify.py`: Has direct HTTP fetch (300ms) with fallback to `apify/website-content-crawler`. Needs structured extraction for company information, contacts, products, MOQs, and prices.
- `backend/app/data/normalization/normalizer.py`: Normalizes company names and phone numbers. Needs expansion to normalize country codes, currencies, units, and product taxonomy.
- `backend/app/data/entity_resolution/resolver.py`: Evaluates exact domain and company name matches. Needs multi-tier classification: Strong Match, Possible Match, Weak Match, No Match.

### 3.2 Evidence & Verification
- `backend/app/services/suppliers/verification.py`: Features a 10-dimension deterministic evaluation engine. Previously relied on static checks; now connected to `supplier_field_evidence` and `data_sources` tables for real-world provenance.
- Ingestion pipeline now enforces that no scraped or AI-generated data is directly written into canonical supplier records without validation and evidence logging.

### 3.3 Background Jobs & Asynchrony
- Lengthy web scraping and discovery jobs must run asynchronously using `background_jobs` records rather than blocking HTTP request threads.
