# SupplyLens Supplier Discovery Architecture

## 1. Multi-Agent Pipeline Principles
The supplier discovery system functions as a sequence of specialized, deterministic backend services and AI agents:

```
CUSTOMER REQUEST
       │
       ▼
[Agent 1: Business Understanding (Gemini)]
       │
       ▼
[Agent 2: Supplier Discovery (Gemini + Nimbleway)]
       │
       ▼
[Agent 3: Research & Enrichment (Nimbleway Agents / Extract)]
       │
       ▼
[Agent 4: Website Extraction (Apify / Direct HTTP)]
       │
       ▼
[Agent 5: Contact Extraction (Role-Based Public Contacts)]
       │
       ▼
[Agent 6: Normalization (Deterministic Python)]
       │
       ▼
[Agent 7: Entity Resolution (Multi-Tier Deduplication)]
       │
       ▼
[Agent 8: Evidence & Verification (10-Dimension Audit Engine)]
       │
       ▼
[Agent 9: Supplier Intelligence (DeepSeek Dossiers)]
       │
       ▼
[Agent 10: Recommendation & Ranking (OR-Tools / ML)]
       │
       ▼
CANONICAL SUPABASE / POSTGRESQL DATABASE
```

---

## 2. Responsibilities by Agent
1. **Business Understanding Agent (Gemini):** Interprets natural language prompt, extracts industry, products, raw materials, budget, and geographic preferences.
2. **Supplier Discovery Agent (Nimbleway Search):** Generates targeted queries and discovers manufacturer URLs.
3. **Research & Enrichment Agent (Nimbleway):** Crawls candidate domains to uncover manufacturing and commercial data.
4. **Website Extraction Agent (Apify):** Crawls product catalogues and specification sheets.
5. **Contact Extraction Agent:** Finds public business emails (`sales@`, `export@`, `enquiries@`) and official phone numbers. Never harvests private personal emails.
6. **Normalization Agent:** Standardizes company names, phone numbers (E.164), currencies, units, and product categories.
7. **Entity Resolution Agent:** Deduplicates records using domains, names, and phone numbers (Strong, Possible, Weak, No Match).
8. **Evidence & Verification Agent:** Records field-level provenance in `supplier_field_evidence` and applies deterministic verification policies.
9. **Supplier Intelligence Agent (DeepSeek / Gemini):** Synthesizes comprehensive dossiers and compatibility explanations.
10. **Recommendation Agent:** Ranks verified suppliers using mathematical optimization and compatibility models.
