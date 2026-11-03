# SUPPLYLENS — PROVIDER COST AND USAGE REPORT

## 1. Cost Accounting Infrastructure
External intelligence and search services are metered at the router level (`backend/app/services/discovery/provider_router.py`). Every outbound API interaction generates an event record in `search_provider_events` capturing:
- `provider`: `gemini`, `nimbleway`, `apify`, `geoapify`, `deepseek`
- `endpoint`: Destination URL
- `latency_ms`: Duration in milliseconds
- `status_code`: HTTP response status
- `estimated_cost_usd`: Allocated cost per call in USD
- `job_id`: Linked background discovery job ID

---

## 2. Unit Economics & Pricing Model

| Provider | Task | Unit Cost (USD) | Latency (Typical) | Optimization Strategy |
|---|---|---|---|---|
| **Nimbleway** | Supplier Search (`/v2/search`) | $0.005 / request | 450ms - 1,800ms | Cache popular queries; enforce query deduplication |
| **Nimbleway** | Async Crawl Queue (`/v2/crawl`) | $0.003 / queue | Async (200-500ms) | Batch domain indexing |
| **Apify** | Website Content Crawler (Actor) | $0.008 / page | 1,200ms - 4,500ms | Direct HTTP Fast-Path fallback handles 90% at $0.00 |
| **Geoapify** | Geocode & Validation | $0.0005 / lookup | 180ms - 350ms | Cache coordinates by (City, State, Country) tuple |
| **Gemini AI** | Intent & Query Expansion | Free Tier / $0.00 | 400ms - 800ms | Model `gemini-flash-lite-latest` minimizes latency & tokens |
| **DeepSeek** | Risk Dossier Synthesis | $0.004 / completion | 800ms - 1,500ms | Triggered on demand for deep supplier dossiers |

---

## 3. Cost-per-Discovery Job Breakdown
For a typical discovery request yielding 3 newly indexed and verified suppliers:
- 1x Nimbleway Search: $0.005
- 1x Direct HTTP Fast-Path: $0.000
- 1x Apify Headless Fallback: $0.008
- 1x Geoapify Geocode: $0.0005
- 1x Gemini Intent Formulator: $0.000
- **Total Estimated Cost per Discovery Job:** **$0.0135 USD** (~ ₹1.12 INR)

This unit economics enables high-volume sourcing discoveries while remaining comfortably within SaaS gross margin thresholds.

---

## 4. Live Telemetry API & UI Dashboard
Administrators and engineers can inspect real-time usage metrics and expenditures:
- **API Endpoint:** `GET /api/v1/admin/providers/usage`
- **Dashboard Interface:** `https://frontend-sigma-ten-8zcwfqbyds.vercel.app/admin/providers` (or local `http://localhost:3000/admin/providers`)
