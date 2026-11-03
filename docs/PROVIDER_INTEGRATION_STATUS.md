# SupplyLens Provider Integration Status

## 1. Provider Registry & Tested Health

### 1. Google Gemini (Primary AI Brain)
- **Status:** **ACTIVE / VERIFIED**
- **Test Date:** 2026-11-03
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest`
- **Response:** HTTP 200 with streaming token support and function calling.
- **Responsibilities:** Natural language understanding, BOM extraction, search intent generation, conversational consulting.

### 2. Nimbleway (Web Intelligence & Discovery)
- **Status:** **ACTIVE / VERIFIED**
- **Test Date:** 2026-11-03
- **Account:** `pritamb2k06_7i9ti2`
- **Active Endpoints:**
  - `https://sdk.nimbleway.com/v2/search`: Returned HTTP 200 with 10 real commercial packaging suppliers.
  - `https://sdk.nimbleway.com/v2/crawl`: Returned HTTP 201 Created with active `crawl_id`.
- **Responsibilities:** Candidate supplier discovery, search filtering, domain mapping.

### 3. Apify (Controlled Website Crawling)
- **Status:** **ACTIVE / VERIFIED**
- **Test Date:** 2026-11-03
- **User Account:** `tuned_computer` (Free Plan)
- **Active Endpoints:** `https://api.apify.com/v2/users/me` (HTTP 200).
- **Approved Actors:** `apify/website-content-crawler`.
- **Responsibilities:** Controlled page extraction, product catalogue crawling, contact page extraction.

### 4. Geoapify (Geospatial Geocoding)
- **Status:** **ACTIVE / VERIFIED**
- **Test Date:** 2026-11-03
- **Endpoint:** `https://api.geoapify.com/v1/geocode/search`
- **Response:** HTTP 200, successfully geocoded `Bhubaneshwar, Odisha, India` to `[85.8394521, 20.2602964]`.
- **Responsibilities:** Location normalization, facility coordinate resolution, distance calculations.

### 5. DeepSeek (Deep Sourcing Intelligence)
- **Status:** **ACTIVE / VERIFIED**
- **Test Date:** 2026-11-03
- **Models:** `deepseek-flash`, `deepseek-v4-pro` (HTTP 200).
- **Responsibilities:** Detailed supplier dossiers, risk analysis, cross-source conflict summarization.
