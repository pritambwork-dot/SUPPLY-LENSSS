# SUPPLYLENS — APIFY CONTROLLED CRAWLER INTEGRATION REPORT

## 1. Overview & Authentication
- **Provider:** Apify Cloud Platform (`api.apify.com`)
- **Integration Layer:** `backend/app/data/sources/apify.py`
- **Authenticated User:** `tuned_computer`
- **Actor:** `apify/website-content-crawler`
- **Endpoint:** `https://api.apify.com/v2/acts/apify~website-content-crawler/runs`
- **Live Verification:** Verified Operational (HTTP 200 / Container Run `WErGoOVbs4E6blLJL` completed successfully)

---

## 2. Dual-Path Execution Architecture
To optimize execution speed and conserve compute units, SupplyLens uses an intelligent two-tier crawl strategy:

```
Candidate URL
      │
      ▼
SSRF & Safety Validation ──► [Blocked: Private IP / Localhost / Cloud Metadata]
      │ (Safe URL)
      ▼
Direct HTTP Fast-Path (300ms)
      │
      ├─► Valid HTML with Content (>500 chars) ──► Extraction Pipeline
      │
      └─► Heavy JS / Bot Protection / Minimal DOM
            │
            ▼
      Apify Cloud Container Run (apify/website-content-crawler)
            │ (Headless Chromium / Playwright)
            ▼
      Dataset Extraction ──► Extraction Pipeline
```

1. **Fast-Path (Direct Async HTTP):**
   - Completes in ~300ms.
   - Handles static HTML, product tables, contact footers, and standard server-rendered sites.
   - Cost: $0.000 USD.
2. **Deep-Path (Apify Cloud Actor):**
   - Launched when client-side JavaScript rendering is required.
   - Executes containerized Playwright crawlers with residential proxy pools.
   - Cost: ~$0.008 USD per crawl.

---

## 3. Server-Side Request Forgery (SSRF) Protection
Before any outbound request is issued by either Apify or direct HTTP, `ApifyProvider.is_safe_url(url)` performs strict validation:
- **Disallowed Schemes:** Rejects non-HTTP/HTTPS schemes (`ftp://`, `file://`, `gopher://`).
- **Loopback Blocking:** Rejects `localhost`, `127.0.0.1`, `::1`.
- **Private Subnet Blocking:**
  - `10.0.0.0/8`
  - `172.16.0.0/12`
  - `192.168.0.0/16`
- **Cloud Metadata Protection:** Rejects `169.254.169.254` (AWS, GCP, Azure instance metadata services).
- **Port Restrictions:** Permits only ports `80`, `443`, or unspecified default.
