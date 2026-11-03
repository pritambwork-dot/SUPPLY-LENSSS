# SupplyLens Supplier Verification Engine Architecture & Specification

## 1. Engine Purpose & Verification Standard

The SupplyLens Verification Engine (`VerificationEngine`) provides deterministic, audit-grounded evaluations of global manufacturers.
Unlike subjective rating aggregators, SupplyLens requires proof of physical facility existence, machine capacity, legal corporate registration, and regulatory compliance.

---

## 2. The 10 Deterministic Audit Dimensions

| Dimension | Name | Weight | Primary Verifiable Source | Criteria for Full Score |
| :--- | :--- | :--- | :--- | :--- |
| **D1** | Corporate Identity & Registration | 15 pts | Registrar of Companies / MCA | Active CIN / Tax registration cross-checked |
| **D2** | Website & Domain Authenticity | 10 pts | DNS Whois & SSL CA | Active TLS certificate matching corporate identity |
| **D3** | Product & Manufacturing Relevance| 15 pts | Factory Catalog & Run Invoices| Confirmed physical product manufacturing line |
| **D4** | Manufacturing Facility & Plant | 15 pts | Industrial GIS & Geocodes | Operational plant verified with square footage |
| **D5** | Physical Location & Jurisdiction | 10 pts | National Postal Registry | Confirmed operating street address |
| **D6** | Direct Verified Contactability | 10 pts | IVR Telephony & MX Records | Verified phone switchboard and corporate email |
| **D7** | Quality & Regulatory Certifications| 10 pts | Accredited Registrars | ISO 9001, CE, FSC, or GMP accreditation verified |
| **D8** | Multi-Source Registry Match | 5 pts | Trade Resolution Engine | Corroborated across &ge; 3 trade directories |
| **D9** | Compliance & Sanctions Screening | 5 pts | OFAC, UN & World Bank Lists | Clear of trade embargoes and adverse media |
| **D10**| Audit Recency & Freshness | 5 pts | Sourcing Telemetry Crawl | Telemetry refreshed within past 90 days |

---

## 3. Status Lifecycle & Badge Rules

- **Demo Verified** (`DEMO VERIFIED · SIMULATED EVIDENCE`): Score &ge; 75, D1 (Identity) passed, D3 (Product) passed, D9 (Sanctions) clear.
- **Demo Partially Verified** (`DEMO PARTIALLY VERIFIED · SIMULATED EVIDENCE`): Score &ge; 50, D9 clear.
- **Demo Requires Review** (`DEMO REQUIRES REVIEW`): Score 35–49 or unverified address requiring manual auditor intervention.
- **Demo Failed** (`DEMO FAILED · SIMULATED SANCTION`): Flagged in sanctions screening or score < 35.
- **Demo Unverified** (`DEMO UNVERIFIED`): Score < 20 or no data provided.
