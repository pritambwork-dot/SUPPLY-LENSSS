# SUPPLYLENS — DETERMINISTIC SUPPLIER VERIFICATION REPORT

## 1. Overview
SupplyLens employs a strict deterministic 10-dimension verification scoring engine (`backend/app/services/suppliers/verification.py`). Verification scores are computed algorithmically based on factual evidence rather than subjective LLM estimations.

---

## 2. The 10 Deterministic Audit Dimensions

| Dimension | Points | Criteria & Requirements |
|---|---|---|
| **1. Business Identity** | 10 pts | Legal business name matches registered entity; commercial suffixes normalized. |
| **2. Corporate Registry Status** | 10 pts | Active company status verified; valid incorporation records. |
| **3. Physical Address & Location** | 10 pts | Verifiable physical plant / factory address; geocoded with valid coordinates. |
| **4. Official Company Domain** | 10 pts | Top-level business domain operating with active SSL/TLS certificates. |
| **5. Verified Business Contacts** | 10 pts | Authenticated role-based public email (`sales@`, `export@`) or registered corporate phone. |
| **6. Active Product Catalog** | 10 pts | Explicit manufacturing product lines or raw-material offerings identified. |
| **7. Production Capacity & MOQ** | 10 pts | Quantified minimum order quantities and scalable capacity parameters. |
| **8. Commercial Pricing Evidence** | 10 pts | Documented unit price range or formal historical quotation records. |
| **9. Quality Certifications** | 10 pts | Auditable standards present (e.g., ISO 9001:2015, FSC, FDA, CE, BPI). |
| **10. Compliance & Audit History** | 10 pts | Clean regulatory record; no unresolved trade disputes or critical sanctions. |

---

## 3. Classification Tiers
- **Verified (Score >= 80):** High trust, comprehensive proof across identity, facilities, contacts, and catalog. Eligible for automated quotation requests and primary recommendation.
- **Partially Verified (Score 50-79):** Core identity and products confirmed; minor secondary proofs (such as physical facility audit or published pricing) pending.
- **Unverified (Score < 50):** Insufficient documentation or missing verifiable business contact. Excluded from primary search rankings.

---

## 4. Immutable Audit Trail
Whenever a supplier's status or score changes (e.g. through automated re-crawling via `POST /api/v1/suppliers/{id}/refresh`), a record is appended to `supplier_audit_events`:
- `event_type`: `created`, `verification_status_changed`, `evidence_refreshed`.
- `previous_state` & `new_state`: JSON snapshots of score and status.
- `actor`: `system_crawler` or admin user.
- `change_reason`: Documented trigger rationale.
