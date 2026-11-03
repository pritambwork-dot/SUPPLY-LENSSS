# SUPPLYLENS — SECURITY, COMPLIANCE & SSRF DEFENSE REPORT

## 1. Compliance Architecture
SupplyLens operates under strict principles of commercial data compliance, privacy preservation, and network isolation:
1. **Never Scrape Personal Data:** The crawler ignores private individual social media profiles, personal consumer emails (`@gmail.com`, `@yahoo.com`), and employee private telephone numbers.
2. **Only Public Business Information:** Data collection is restricted strictly to publicly published corporate disclosures, official catalog offerings, published business addresses, and authorized export desks.
3. **SSRF Network Defenses:** All outbound crawls and scrapers pass through automated IP and domain filter policies before execution.

---

## 2. Server-Side Request Forgery (SSRF) Prevention
Implemented in `backend/app/data/sources/apify.py` via `ApifyProvider.is_safe_url(url)`:

### Blocked Targets
- **Private Subnets:**
  - `10.0.0.0/8` (Internal enterprise networks)
  - `172.16.0.0/12` (Internal Docker / Kubernetes pods)
  - `192.168.0.0/16` (Local network infrastructure)
- **Loopback Interfaces:**
  - `localhost`, `127.0.0.1`, `::1`
- **Cloud Metadata Services:**
  - `169.254.169.254` (Blocks extraction of AWS IAM credentials, GCP access tokens, and Azure service identities)
- **Non-Standard Protocols:**
  - Blocks `ftp://`, `file://`, `ssh://`, `gopher://`, `dict://`
- **Port Safeguards:**
  - Blocks arbitrary ports (e.g. `http://domain.com:22`, `:3306`, `:5432`). Only ports `80` and `443` are allowed.

---

## 3. Database Isolation & Row-Level Security (RLS)
1. **Customer Isolation:** Ingestion into `suppliers` and `supplier_field_evidence` is global and canonical, while customer RFQs, sourcing deals, and activity streams are strictly scoped to `business_id` and authenticated `user_id`.
2. **Deterministic Immutability:** Audit events in `supplier_audit_events` and provenance records in `supplier_field_evidence` are append-only. They cannot be altered or deleted by ordinary API actions, preserving verifiable audit trails.
3. **Encrypted Communications:** All external provider traffic (Gemini, Nimbleway, Apify, Geoapify, DeepSeek) is transmitted exclusively over TLS 1.3 / HTTPS.
