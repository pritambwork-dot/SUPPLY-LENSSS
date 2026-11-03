-- =============================================================================
-- SupplyLens Migration 005: Customer Portal & Vendor Directory Architecture
-- Tables: customer_activities, quotation_requests, vendor_profile_interactions
-- Enforces tenant isolation, audit logging, and Supabase Row Level Security (RLS)
-- =============================================================================

-- 1. Customer Activity Timeline Table
CREATE TABLE IF NOT EXISTS customer_activities (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    business_id VARCHAR(36) REFERENCES businesses(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- search, profile_view, save_vendor, remove_vendor, compare, quotation_request, deal_update, invoice_created, payment_completed
    title VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50), -- supplier, quotation, deal, invoice, requirement
    entity_id VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_customer_activities_biz ON customer_activities(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_activities_type ON customer_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_customer_activities_created ON customer_activities(created_at DESC);

-- 2. Quotation Requests (Customer RFQs to Vendors)
CREATE TABLE IF NOT EXISTS quotation_requests (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_category VARCHAR(100) NOT NULL,
    required_quantity FLOAT NOT NULL,
    unit VARCHAR(50) DEFAULT 'piece',
    target_budget FLOAT,
    currency VARCHAR(10) DEFAULT 'INR',
    specifications TEXT,
    delivery_terms VARCHAR(100) DEFAULT 'FOB',
    destination_city VARCHAR(100),
    destination_country VARCHAR(100) DEFAULT 'India',
    required_certifications JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'submitted', -- submitted, under_review, quoted, accepted, declined, expired
    quoted_unit_price FLOAT,
    quoted_moq INTEGER,
    quoted_lead_time_days INTEGER,
    quotation_valid_until TIMESTAMP WITH TIME ZONE,
    vendor_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_biz ON quotation_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_sup ON quotation_requests(supplier_id);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_status ON quotation_requests(status);

-- 3. Vendor Profile Interactions & Analytics
CREATE TABLE IF NOT EXISTS vendor_profile_interactions (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    business_id VARCHAR(36) REFERENCES businesses(id) ON DELETE SET NULL,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    interaction_type VARCHAR(50) NOT NULL, -- view, contact_click, website_visit, save, quotation_start, verification_check
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vendor_interactions_sup ON vendor_profile_interactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_vendor_interactions_type ON vendor_profile_interactions(interaction_type);

-- 4. Enable Row Level Security (RLS) on new tables
ALTER TABLE customer_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profile_interactions ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies for Customer Privacy & Isolation
DROP POLICY IF EXISTS "Customers can view their own activities" ON customer_activities;
CREATE POLICY "Customers can view their own activities" ON customer_activities
    FOR SELECT USING (auth.uid()::text = user_id OR business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()::text OR user_id IS NULL
    ));

DROP POLICY IF EXISTS "Customers can insert their own activities" ON customer_activities;
CREATE POLICY "Customers can insert their own activities" ON customer_activities
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Customers can view their own quotation requests" ON quotation_requests;
CREATE POLICY "Customers can view their own quotation requests" ON quotation_requests
    FOR SELECT USING (auth.uid()::text = user_id OR business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()::text OR user_id IS NULL
    ));

DROP POLICY IF EXISTS "Customers can create quotation requests" ON quotation_requests;
CREATE POLICY "Customers can create quotation requests" ON quotation_requests
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can record vendor profile interactions" ON vendor_profile_interactions;
CREATE POLICY "Public can record vendor profile interactions" ON vendor_profile_interactions
    FOR INSERT WITH CHECK (true);
