-- =============================================================================
-- SupplyLens Migration 006: Master Authentication, Onboarding & Personalized Dashboard
-- Adds: user_onboarding_progress, business_members, profiles extension, RLS policies
-- =============================================================================

-- 1. Profiles Table Extension / Creation
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY, -- maps to auth.users.id
    user_id VARCHAR(36) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    city VARCHAR(100),
    phone_number VARCHAR(50),
    preferred_currency VARCHAR(10) DEFAULT 'USD',
    preferred_language VARCHAR(20) DEFAULT 'en',
    job_title VARCHAR(100),
    professional_role VARCHAR(100) DEFAULT 'Sourcing Manager',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 2. Enhance businesses table with onboarding fields
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_type VARCHAR(100) DEFAULT 'D2C brand';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_stage VARCHAR(50) DEFAULT 'idea';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_registration_status VARCHAR(50) DEFAULT 'unregistered';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS target_customer_market VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_size VARCHAR(50) DEFAULT '1-10';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS geographic_preferences JSONB DEFAULT '["India"]'::jsonb;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS supplier_priorities JSONB DEFAULT '["Lowest price", "Low MOQ"]'::jsonb;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ai_sourcing_summary JSONB DEFAULT '{}'::jsonb;

-- 3. Business Members (User-Business Tenancy Mapping)
CREATE TABLE IF NOT EXISTS business_members (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'owner', -- owner, admin, sourcing_manager, viewer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_biz_members_user ON business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_biz_members_biz ON business_members(business_id);

-- 4. User Onboarding Progress Tracking
CREATE TABLE IF NOT EXISTS user_onboarding_progress (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id VARCHAR(36) REFERENCES businesses(id) ON DELETE SET NULL,
    active_step INTEGER DEFAULT 1,
    completed_steps JSONB DEFAULT '[]'::jsonb,
    onboarding_status VARCHAR(50) DEFAULT 'in_progress', -- not_started, in_progress, completed
    data_snapshot JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_onboarding_user ON user_onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON user_onboarding_progress(onboarding_status);

-- 5. Product Materials Table (explicit normalized many-to-many relationship)
CREATE TABLE IF NOT EXISTS product_materials (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    material_name VARCHAR(255) NOT NULL,
    material_grade VARCHAR(100),
    specifications TEXT,
    required_quantity FLOAT,
    unit VARCHAR(50) DEFAULT 'kg',
    quality_requirements TEXT,
    is_ai_suggested BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_prod_mat_prod ON product_materials(product_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_materials ENABLE ROW LEVEL SECURITY;

-- 7. Define RLS Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid()::text = user_id OR auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR ALL USING (auth.uid()::text = user_id OR auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can manage their onboarding progress" ON user_onboarding_progress;
CREATE POLICY "Users can manage their onboarding progress" ON user_onboarding_progress
    FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can view their business memberships" ON business_members;
CREATE POLICY "Users can view their business memberships" ON business_members
    FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can access product materials of their businesses" ON product_materials;
CREATE POLICY "Users can access product materials of their businesses" ON product_materials
    FOR ALL USING (
        product_id IN (
            SELECT p.id FROM products p
            JOIN businesses b ON b.sector_id = p.sector_id
            WHERE b.user_id = auth.uid()::text OR b.user_id IS NULL
        )
    );
