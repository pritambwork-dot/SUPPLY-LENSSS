# SUPPLYLENS — SUPPLIER FIELD EVIDENCE & PROVENANCE REPORT

## 1. Provenance Architecture
Every single attribute ingested into SupplyLens—including business name, email, telephone, location, MOQ, unit price, and certifications—is backed by an immutable provenance record in PostgreSQL/Supabase table `supplier_field_evidence`.

```
Supplier Attribute (e.g., public_business_email: sales@dinearth.com)
      │
      ▼
supplier_field_evidence Record:
├── id: "evi-bb4a96913098"
├── supplier_id: "sup-a179dcfd"
├── field_name: "public_business_email"
├── field_value: "sales@dinearth.com"
├── source_url: "https://www.dinearth.com/"
├── source_type: "official_company_website"
├── provider: "nimbleway"
├── excerpt: "Role: sales"
├── confidence: "high"
├── verification_status: "passed"
└── extracted_at: "2026-11-03T16:40:54Z"
```

---

## 2. Evidence Attributes Schema
- `id`: Unique evidence identifier (`evi-...`).
- `supplier_id`: ForeignKey to canonical `suppliers.id`.
- `candidate_id`: Link to discovery candidate record.
- `field_name`: Exact attribute being justified (`company_name`, `public_business_email`, `location`, `moq`, `unit_price`, `certifications`, `capabilities`).
- `field_value`: The normalized value stored in the database.
- `source_url`: Verifiable URL where the observation occurred.
- `source_type`: Category of source (`official_company_website`, `government_registry`, `export_database`, `catalog_listing`).
- `provider`: Provider through which data was observed (`nimbleway`, `apify`, `geoapify`, `registry`).
- `excerpt`: Contextual snippet containing the raw observation.
- `confidence`: Provenance confidence rating (`high`, `medium`, `low`).
- `verification_status`: Policy evaluation (`passed`, `failed`, `requires_policy_check`).
- `extracted_at`: UTC timestamp of extraction.

---

## 3. Multi-Source Conflict Resolution
When multiple external sources provide conflicting information for the same supplier entity (e.g. different headquarters addresses or price quotes), the discrepancy is written to `supplier_conflicts`:
- Stores `claimed_value_a` (from `source_a`) and `claimed_value_b` (from `source_b`).
- Sets `resolution_status` to `unresolved`.
- Prioritizes official company domains over directory aggregators.
- DeepSeek acts as the conflict resolution judge, synthesizing disparate claims into an explainable summary with recommended consensus values.
