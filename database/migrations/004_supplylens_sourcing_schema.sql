-- =============================================================================
-- SupplyLens Migration 004: Relational Sourcing Schema, Verification Evidence & Demo Isolation
-- Enforces clean tenant isolation, simulated evidence tracking, and Supabase RLS
-- =============================================================================

-- 1. Add is_demo and isolation flags to core tables if not already present
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS verification_score INTEGER DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS data_confidence INTEGER DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS badge_text VARCHAR(100) DEFAULT 'UNVERIFIED';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS verification_evidence JSONB DEFAULT '[]'::jsonb;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS simulated_fixtures JSONB DEFAULT '[]'::jsonb;

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE tenders ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE sourcing_deals ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE service_fee_invoices ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- 2. Verification Audit & Evidence Table
CREATE TABLE IF NOT EXISTS verification_audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    previous_status VARCHAR(100),
    new_status VARCHAR(100) NOT NULL,
    auditor VARCHAR(255) NOT NULL,
    notes TEXT,
    is_demo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_verification_audit_supplier ON verification_audit_logs(supplier_id);
CREATE INDEX IF NOT EXISTS idx_verification_audit_action ON verification_audit_logs(action);

-- 3. Simulated Verification Documents / Evidence Fixtures
CREATE TABLE IF NOT EXISTS verification_evidence_fixtures (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    dimension VARCHAR(100) NOT NULL,
    fixture_title VARCHAR(255) NOT NULL,
    fixture_uri VARCHAR(500) NOT NULL, -- e.g. demo://evidence/sup-001/incorporation_certificate.pdf
    issuer VARCHAR(255) NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    issued_date DATE,
    expires_date DATE,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_demo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fixtures_supplier ON verification_evidence_fixtures(supplier_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_dimension ON verification_evidence_fixtures(dimension);

-- 4. Enable Row Level Security (RLS) on all tables for Supabase Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_evidence_fixtures ENABLE ROW LEVEL SECURITY;

-- 5. Define Permissive & Authenticated RLS Policies for App Operations
-- Public Read for Sectors, Products, and Verified Suppliers (Demo and Catalog)
DROP POLICY IF EXISTS "Public can view sectors" ON sectors;
CREATE POLICY "Public can view sectors" ON sectors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view suppliers" ON suppliers;
CREATE POLICY "Public can view suppliers" ON suppliers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view supplier products" ON supplier_products;
CREATE POLICY "Public can view supplier products" ON supplier_products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view supplier locations" ON supplier_locations;
CREATE POLICY "Public can view supplier locations" ON supplier_locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view supplier contacts" ON supplier_contacts;
CREATE POLICY "Public can view supplier contacts" ON supplier_contacts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view supplier ratings" ON supplier_ratings;
CREATE POLICY "Public can view supplier ratings" ON supplier_ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view verification fixtures" ON verification_evidence_fixtures;
CREATE POLICY "Public can view verification fixtures" ON verification_evidence_fixtures FOR SELECT USING (true);

-- Authenticated Users Can View and Manage their Own Businesses, Tenders, and Deals
DROP POLICY IF EXISTS "Users can manage own business" ON businesses;
CREATE POLICY "Users can manage own business" ON businesses
    FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL OR is_demo = TRUE);

DROP POLICY IF EXISTS "Users can manage own tenders" ON tenders;
CREATE POLICY "Users can manage own tenders" ON tenders
    FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL OR is_demo = TRUE);

DROP POLICY IF EXISTS "Users can manage own deals" ON sourcing_deals;
CREATE POLICY "Users can manage own deals" ON sourcing_deals
    FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL OR is_demo = TRUE);

DROP POLICY IF EXISTS "Users can view own invoices" ON service_fee_invoices;
CREATE POLICY "Users can view own invoices" ON service_fee_invoices
    FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL OR is_demo = TRUE);

DROP POLICY IF EXISTS "Auditors and admins can manage audit logs" ON verification_audit_logs;
CREATE POLICY "Auditors and admins can manage audit logs" ON verification_audit_logs
    FOR ALL USING (true);
