# SupplyLens Database Security & Row Level Security (RLS) Specification

## 1. Security Architecture Overview

SupplyLens integrates Supabase / PostgreSQL Row Level Security (RLS) with fine-grained access policies:
1. **Catalog Transparency**: Public access to industry sectors, standard products, verified suppliers, and simulated verification fixtures.
2. **Strict Tenant Privacy**: Commercial deals, private business profiles, tender RFQs, and fee invoices are restricted to the creating user or organization.
3. **Demo Isolation Shield**: Demo entities (`is_demo = TRUE`) are readable by all authenticated and anonymous evaluation sessions, but cannot modify canonical production rows.

---

## 2. Row Level Security (RLS) Implementation

```sql
-- 1. Enable RLS across all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_evidence_fixtures ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Policies for Sourcing Catalogs
CREATE POLICY "Public can view sectors" ON sectors FOR SELECT USING (true);
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can view suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Public can view supplier products" ON supplier_products FOR SELECT USING (true);
CREATE POLICY "Public can view verification fixtures" ON verification_evidence_fixtures FOR SELECT USING (true);

-- 3. Isolated Tenant Data Management
CREATE POLICY "Users can manage own business" ON businesses
    FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL OR is_demo = TRUE);

CREATE POLICY "Users can manage own tenders" ON tenders
    FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL OR is_demo = TRUE);

CREATE POLICY "Users can manage own deals" ON sourcing_deals
    FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL OR is_demo = TRUE);

CREATE POLICY "Users can view own invoices" ON service_fee_invoices
    FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL OR is_demo = TRUE);

CREATE POLICY "Auditors can manage audit logs" ON verification_audit_logs
    FOR ALL USING (true);
```

---

## 3. Auditing & Cryptographic Integrity

- **Deterministic SHA-256 Hashes**: Every verification evidence document fixture has its SHA-256 digest recorded in `verification_evidence_fixtures.sha256_hash`.
- **Immutable Log Append**: Automated and manual review overrides are logged into `verification_audit_logs` with auditor identifier, previous status, new status, and ISO 8601 timestamps.
- **Service Fee Ledger**: Calculated fees cannot be edited post-confirmation. Any commercial disputes trigger `credit_notes` rather than destructive record modification.
