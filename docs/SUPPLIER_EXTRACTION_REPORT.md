# SUPPLYLENS — STRUCTURED SUPPLIER EXTRACTION REPORT

## 1. Overview
The SupplyLens Extraction Engine transforms unstructured webpage text, HTML catalogs, and company portals into canonical, structured supplier records.

- **Modules:**
  - Company & Technical Spec Extractor: `backend/app/services/extraction/supplier_extractor.py`
  - Business Contact Extractor: `backend/app/services/extraction/contact_extractor.py`

---

## 2. Extracted Attributes & Heuristics

| Attribute | Extraction Strategy | Validation / Rules |
|---|---|---|
| **Company Legal Name** | DOM titles, legal copyright disclosures, registration statements | Suffix extraction (`Pvt Ltd`, `LLC`, `GmbH`), strips noise words |
| **Products & Materials** | Unordered lists, catalog headers, product card regex patterns | Deduplicated, filtered to minimum length > 3 chars |
| **Minimum Order Quantity (MOQ)** | Contextual regex (`MOQ\s*[:=]?\s*(\d[\d,]+)`) | Defaults to 1,000 units if not publicly published |
| **Pricing Ranges** | Currency symbols (`₹`, `$`, `€`, `INR`, `USD`) near unit tokens | Parsed to float min/max values with unit standardization |
| **Certifications** | ISO 9001, ISO 14001, FSC, FDA, CE, GMP, BPI, Compostable | Keyword detection with strict boundary matching |
| **Manufacturing Capabilities** | OEM, ODM, Injection Molding, Extrusion, Precision Tooling | Categorized into industrial capability vectors |
| **Physical Facilities** | Industrial estate patterns, PIN/ZIP codes, address blocks | Normalizes city and country; geocoded via Geoapify |

---

## 3. Strict Compliance in Contact Extraction
SupplyLens strictly enforces public business contact compliance:
- **Never scrapes personal consumer email domains:** Automatically drops addresses ending in `@gmail.com`, `@yahoo.com`, `@hotmail.com`, `@outlook.com`, `@icloud.com`.
- **Requires official role-based prefixes:** Prioritizes verified commercial mailboxes:
  - `sales@`
  - `export@` / `exports@`
  - `info@`
  - `contact@`
  - `procurement@`
  - `commercial@`
- **Domain Verification:** If company domain is identified, rejects third-party domain emails to prevent phishing or fraudulent representation.
- **Phone Sanitization:** Standardizes national and international numbers into numeric or E.164 format, discarding dates and spurious number patterns.
