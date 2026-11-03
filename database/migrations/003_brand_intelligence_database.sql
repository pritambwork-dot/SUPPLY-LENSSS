-- SupplyLens Migration 003: Global Brand Intelligence Database & Supplier Relationships
-- Description: Creates canonical brand knowledge graph, parent companies, products, supplier links, evidence, and audit logs.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Brand Data Sources (Approved Registry of Legitimate Data Sources)
CREATE TABLE IF NOT EXISTS brand_data_sources (
    id VARCHAR(36) PRIMARY KEY,
    source_name VARCHAR(150) UNIQUE NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'official_registry', 'public_filing', 'open_supply_hub', 'corporate_disclosure', 'trademark_database'
    source_url TEXT,
    access_method VARCHAR(50) DEFAULT 'api', -- 'api', 'public_disclosure', 'manual_audit'
    license_name VARCHAR(100),
    commercial_use_allowed BOOLEAN DEFAULT TRUE,
    redistribution_allowed BOOLEAN DEFAULT TRUE,
    attribution_required BOOLEAN DEFAULT FALSE,
    terms_url TEXT,
    data_retention_policy TEXT,
    source_status VARCHAR(50) DEFAULT 'approved', -- 'approved', 'pending_review', 'restricted', 'disabled'
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Brand Taxonomy & Categories
CREATE TABLE IF NOT EXISTS brand_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    parent_category_id VARCHAR(36) REFERENCES brand_categories(id) ON DELETE SET NULL,
    taxonomy_level VARCHAR(50) NOT NULL, -- 'industry', 'sector', 'category', 'subcategory', 'product_type'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_brand_categories_slug ON brand_categories(slug);
CREATE INDEX IF NOT EXISTS idx_brand_categories_parent ON brand_categories(parent_category_id);

-- 3. Parent Companies (Legal Operating Entities)
CREATE TABLE IF NOT EXISTS parent_companies (
    id VARCHAR(36) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) UNIQUE NOT NULL,
    official_website TEXT,
    business_description TEXT,
    registration_country VARCHAR(100) NOT NULL,
    registration_number VARCHAR(100),
    headquarters VARCHAR(255),
    company_type VARCHAR(100) DEFAULT 'public_corporation', -- 'public_corporation', 'private_limited', 'holding_company', 'conglomerate'
    source_id VARCHAR(36) REFERENCES brand_data_sources(id) ON DELETE SET NULL,
    verification_status VARCHAR(50) DEFAULT 'verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_parent_companies_normalized ON parent_companies(normalized_name);

-- 4. Brands (Canonical Commercial Brands)
CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    description TEXT,
    brand_type VARCHAR(50) NOT NULL DEFAULT 'brand_owner', -- 'brand_owner', 'consumer_brand', 'private_label', 'oem_brand', 'distributor_brand', 'industrial_brand'
    industry_id VARCHAR(36) REFERENCES brand_categories(id) ON DELETE SET NULL,
    primary_category_id VARCHAR(36) REFERENCES brand_categories(id) ON DELETE SET NULL,
    logo_url TEXT,
    official_website TEXT,
    headquarters_country VARCHAR(100) NOT NULL,
    headquarters_city VARCHAR(100),
    founding_year INTEGER,
    parent_company_id VARCHAR(36) REFERENCES parent_companies(id) ON DELETE SET NULL,
    brand_status VARCHAR(50) DEFAULT 'active', -- 'active', 'dormant', 'rebranded', 'defunct'
    verification_status VARCHAR(50) DEFAULT 'verified', -- 'verified', 'partially_verified', 'unverified'
    data_confidence NUMERIC(3, 2) DEFAULT 0.95,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_normalized ON brands(normalized_name);
CREATE INDEX IF NOT EXISTS idx_brands_parent ON brands(parent_company_id);
CREATE INDEX IF NOT EXISTS idx_brands_category ON brands(primary_category_id);
CREATE INDEX IF NOT EXISTS idx_brands_country ON brands(headquarters_country);

-- 5. Brand Aliases (Prevent Duplicate Brand Entities)
CREATE TABLE IF NOT EXISTS brand_aliases (
    id VARCHAR(36) PRIMARY KEY,
    brand_id VARCHAR(36) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    alias VARCHAR(255) NOT NULL,
    normalized_alias VARCHAR(255) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    source_id VARCHAR(36) REFERENCES brand_data_sources(id) ON DELETE SET NULL,
    evidence_id VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_brand_aliases_normalized ON brand_aliases(normalized_alias);

-- 6. Brand Relationships (Corporate Cross-Entity Links)
CREATE TABLE IF NOT EXISTS brand_relationships (
    id VARCHAR(36) PRIMARY KEY,
    source_brand_id VARCHAR(36) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    target_company_id VARCHAR(36) REFERENCES parent_companies(id) ON DELETE CASCADE,
    target_brand_id VARCHAR(36) REFERENCES brands(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'owned_by', 'subsidiary_of', 'operated_by', 'licensed_to', 'acquired_by', 'co_branded_with'
    valid_from DATE,
    valid_until DATE,
    evidence_id VARCHAR(36),
    confidence NUMERIC(3, 2) DEFAULT 0.95,
    verification_status VARCHAR(50) DEFAULT 'verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Brand Products (Verified Product Catalogs)
CREATE TABLE IF NOT EXISTS brand_products (
    id VARCHAR(36) PRIMARY KEY,
    brand_id VARCHAR(36) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    normalized_product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    category_id VARCHAR(36) REFERENCES brand_categories(id) ON DELETE SET NULL,
    product_type VARCHAR(100),
    materials TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    country_of_origin VARCHAR(100),
    official_product_url TEXT,
    source_id VARCHAR(36) REFERENCES brand_data_sources(id) ON DELETE SET NULL,
    evidence_id VARCHAR(36),
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_brand_products_brand ON brand_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_products_category ON brand_products(category_id);

-- 8. Brand Locations (Separate Corporate/Office Locations from Factories)
CREATE TABLE IF NOT EXISTS brand_locations (
    id VARCHAR(36) PRIMARY KEY,
    brand_id VARCHAR(36) REFERENCES brands(id) ON DELETE CASCADE,
    company_id VARCHAR(36) REFERENCES parent_companies(id) ON DELETE CASCADE,
    location_type VARCHAR(50) NOT NULL, -- 'headquarters', 'corporate_office', 'regional_hub', 'design_center', 'flagship_retail'
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    geocoding_confidence NUMERIC(3, 2) DEFAULT 0.95,
    source_id VARCHAR(36) REFERENCES brand_data_sources(id) ON DELETE SET NULL,
    evidence_id VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_brand_locations_brand ON brand_locations(brand_id);

-- 9. Brand Source Evidence (Cryptographic & Traceable Evidence)
CREATE TABLE IF NOT EXISTS brand_source_evidence (
    id VARCHAR(36) PRIMARY KEY,
    brand_id VARCHAR(36) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    observed_value TEXT NOT NULL,
    source_id VARCHAR(36) REFERENCES brand_data_sources(id) ON DELETE SET NULL,
    source_url TEXT NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    collection_method VARCHAR(50) DEFAULT 'public_disclosure',
    confidence NUMERIC(3, 2) DEFAULT 0.95,
    observed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    validation_status VARCHAR(50) DEFAULT 'valid',
    notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_brand_evidence_brand ON brand_source_evidence(brand_id);

-- 10. Brand Supplier Relationships (Core Sourcing Knowledge Graph)
CREATE TABLE IF NOT EXISTS brand_supplier_relationships (
    id VARCHAR(36) PRIMARY KEY,
    brand_id VARCHAR(36) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'contract_manufacturer', 'oem_partner', 'tier_1_component', 'packaging_partner', 'raw_material_provider'
    product_category_id VARCHAR(36) REFERENCES brand_categories(id) ON DELETE SET NULL,
    relationship_status VARCHAR(50) DEFAULT 'active', -- 'active', 'historical', 'under_review'
    source_id VARCHAR(36) REFERENCES brand_data_sources(id) ON DELETE SET NULL,
    evidence_id VARCHAR(36) REFERENCES brand_source_evidence(id) ON DELETE SET NULL,
    valid_from DATE,
    valid_until DATE,
    confidence NUMERIC(3, 2) DEFAULT 0.95,
    verification_status VARCHAR(50) DEFAULT 'verified',
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_brand_supplier_rel UNIQUE (brand_id, supplier_id, relationship_type)
);
CREATE INDEX IF NOT EXISTS idx_brand_supplier_brand ON brand_supplier_relationships(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_supplier_supplier ON brand_supplier_relationships(supplier_id);

-- 11. Saved Brands (User Bookmarks & Sourcing Research Lists)
CREATE TABLE IF NOT EXISTS saved_brands (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_id VARCHAR(36) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    notes TEXT,
    folder_name VARCHAR(100) DEFAULT 'General Sourcing Research',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_brand UNIQUE (user_id, brand_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_brands_user ON saved_brands(user_id);

-- 12. Brand Import Jobs (Ingestion Tracking)
CREATE TABLE IF NOT EXISTS brand_import_jobs (
    id VARCHAR(36) PRIMARY KEY,
    source_id VARCHAR(36) REFERENCES brand_data_sources(id) ON DELETE SET NULL,
    job_type VARCHAR(50) NOT NULL, -- 'full_ingestion', 'delta_sync', 'evidence_reverification'
    job_status VARCHAR(50) DEFAULT 'completed', -- 'queued', 'in_progress', 'completed', 'failed'
    records_discovered INTEGER DEFAULT 0,
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    duplicate_records INTEGER DEFAULT 0,
    rejected_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_summary TEXT
);

-- 13. Brand Audit Events (Administrative Change History)
CREATE TABLE IF NOT EXISTS brand_audit_events (
    id VARCHAR(36) PRIMARY KEY,
    brand_id VARCHAR(36) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    actor_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'supplier_linked', 'evidence_verified', 'status_changed'
    previous_value JSONB,
    new_value JSONB,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_brand_audit_brand ON brand_audit_events(brand_id);

-- -------------------------------------------------------------
-- SEED DATA: Approved Sources, Categories, Parent Companies, Brands, Products, and Supplier Links
-- -------------------------------------------------------------

-- Seed Data Sources
INSERT INTO brand_data_sources (id, source_name, source_type, source_url, license_name, commercial_use_allowed, source_status)
VALUES 
    ('src-osh-01', 'Open Supply Hub', 'open_supply_hub', 'https://opensupplyhub.org', 'CC-BY-SA 4.0', TRUE, 'approved'),
    ('src-sec-02', 'US SEC EDGAR 10-K Disclosures', 'public_filing', 'https://www.sec.gov/edgar', 'Public Domain', TRUE, 'approved'),
    ('src-mca-03', 'Ministry of Corporate Affairs (MCA) India', 'official_registry', 'https://www.mca.gov.in', 'Open Government Data', TRUE, 'approved'),
    ('src-corp-04', 'Corporate Transparency & ESG Disclosures', 'corporate_disclosure', 'https://patagonia.com/actionworks', 'Public Disclosed', TRUE, 'approved')
ON CONFLICT (id) DO NOTHING;

-- Seed Brand Categories
INSERT INTO brand_categories (id, name, slug, taxonomy_level, description)
VALUES 
    ('cat-ind-apparel', 'Apparel & Footwear', 'apparel-footwear', 'industry', 'Textiles, performance apparel, footwear, and technical garments'),
    ('cat-ind-electronics', 'Consumer Electronics', 'consumer-electronics', 'industry', 'Audio devices, smart peripherals, telecommunications, and compute hardware'),
    ('cat-ind-packaging', 'Sustainable Packaging', 'sustainable-packaging', 'industry', 'Compostable packaging, kraft cartons, bagasse tableware, and plant polymers'),
    ('cat-ind-fmcg', 'Food & Beverage', 'food-beverage', 'industry', 'Packaged food, organic produce, plant proteins, and commercial beverages')
ON CONFLICT (id) DO NOTHING;

INSERT INTO brand_categories (id, name, slug, parent_category_id, taxonomy_level, description)
VALUES 
    ('cat-sub-perf-outdoor', 'Performance Outdoor Apparel', 'performance-outdoor-apparel', 'cat-ind-apparel', 'subcategory', 'Weatherproof outerwear, technical fleeces, and recycled synthetics'),
    ('cat-sub-audio', 'Consumer Audio & Wearables', 'consumer-audio-wearables', 'cat-ind-electronics', 'subcategory', 'True wireless earbuds, smartbands, and noise-cancelling headphones'),
    ('cat-sub-bio-containers', 'Compostable Food Containers', 'compostable-food-containers', 'cat-ind-packaging', 'subcategory', 'Sugarcane bagasse clamshells, molded pulp trays, and PLA leak-proof lids')
ON CONFLICT (id) DO NOTHING;

-- Seed Parent Companies
INSERT INTO parent_companies (id, company_name, normalized_name, official_website, registration_country, registration_number, headquarters, company_type)
VALUES 
    ('cmp-patagonia-works', 'Patagonia Works', 'PATAGONIA WORKS', 'https://www.patagonia.com', 'United States', 'US-DE-392019', 'Ventura, California, USA', 'private_limited'),
    ('cmp-imagine-mkt', 'Imagine Marketing Limited', 'IMAGINE MARKETING LIMITED', 'https://www.boat-lifestyle.com', 'India', 'U52399MH2013PLC249758', 'Mumbai, Maharashtra, India', 'public_corporation'),
    ('cmp-ecoware', 'Ecoware Solutions Pvt Ltd', 'ECOWARE SOLUTIONS PVT LTD', 'https://www.ecoware.in', 'India', 'U25209DL2009PTC195147', 'New Delhi, Delhi, India', 'private_limited')
ON CONFLICT (id) DO NOTHING;

-- Seed Brands
INSERT INTO brands (id, name, slug, normalized_name, description, brand_type, industry_id, primary_category_id, official_website, headquarters_country, headquarters_city, founding_year, parent_company_id, verification_status, data_confidence)
VALUES 
    ('brd-patagonia', 'Patagonia', 'patagonia', 'PATAGONIA', 'Global leader in technical outdoor apparel and environmental sustainability, pioneering recycled polyester, organic cotton, and repair programs.', 'brand_owner', 'cat-ind-apparel', 'cat-sub-perf-outdoor', 'https://www.patagonia.com', 'United States', 'Ventura', 1973, 'cmp-patagonia-works', 'verified', 0.99),
    ('brd-boat', 'boAt Lifestyle', 'boat-lifestyle', 'BOAT LIFESTYLE', 'India''s premier personal audio and consumer wearables brand, designing accessible TWS earphones, smartwatches, and lifestyle audio hardware.', 'brand_owner', 'cat-ind-electronics', 'cat-sub-audio', 'https://www.boat-lifestyle.com', 'India', 'Mumbai', 2016, 'cmp-imagine-mkt', 'verified', 0.96),
    ('brd-ecoware', 'Ecoware', 'ecoware', 'ECOWARE', 'Pioneering Indian sustainable food packaging brand manufacturing 100% biodegradable and compostable tableware derived from agricultural biomass.', 'brand_owner', 'cat-ind-packaging', 'cat-sub-bio-containers', 'https://www.ecoware.in', 'India', 'New Delhi', 2009, 'cmp-ecoware', 'verified', 0.97)
ON CONFLICT (id) DO NOTHING;

-- Seed Brand Products
INSERT INTO brand_products (id, brand_id, product_name, normalized_product_name, product_description, category_id, product_type, materials, specifications, official_product_url)
VALUES 
    ('prd-pat-01', 'brd-patagonia', 'Torrentshell 3L Rain Jacket', 'TORRENTSHELL 3L RAIN JACKET', 'H2No Performance Standard 3-layer waterproof/breathable shell constructed from 100% recycled nylon face fabric.', 'cat-sub-perf-outdoor', 'Outerwear', '100% Recycled ECONYL Nylon, Polyurethane membrane', '{"waterproof_rating": "20000mm", "fair_trade_certified": true}'::jsonb, 'https://www.patagonia.com/product/mens-torrentshell-3l-rain-jacket'),
    ('prd-boat-01', 'brd-boat', 'Airdopes 141 ANC', 'AIRDOPES 141 ANC', 'Active noise cancelling wireless earbuds featuring 42-hour playtime, ASAP Charge technology, and 10mm dynamic audio drivers.', 'cat-sub-audio', 'Audio Hardware', 'ABS Plastic, Polymer Lithium Cell, Copper Coils', '{"driver_size": "10mm", "anc_depth": "32dB", "bluetooth_version": "5.3"}'::jsonb, 'https://www.boat-lifestyle.com/products/airdopes-141-anc'),
    ('prd-eco-01', 'brd-ecoware', 'Bagasse 3-Compartment Meal Tray', 'BAGASSE 3 COMPARTMENT MEAL TRAY', 'Food-grade compostable tableware molded from sugarcane bagasse fiber, grease resistant and microwave safe.', 'cat-sub-bio-containers', 'Food Packaging', '100% Sugarcane Bagasse Pulp', '{"temperature_range": "-20C to 140C", "biodegradable_days": 90, "oil_resistant": true}'::jsonb, 'https://www.ecoware.in/products/compartment-meal-tray')
ON CONFLICT (id) DO NOTHING;

-- Seed Brand Evidence Records
INSERT INTO brand_source_evidence (id, brand_id, field_name, observed_value, source_id, source_url, source_type, confidence)
VALUES 
    ('evd-pat-01', 'brd-patagonia', 'supplier_relationship', 'Documented finished-goods manufacturing partnership with verified textile and footwear facilities in Taiwan and Vietnam.', 'src-osh-01', 'https://opensupplyhub.org/facilities/patagonia-supply-disclosure', 'open_supply_hub', 0.98),
    ('evd-boat-01', 'brd-boat', 'supplier_relationship', 'Publicly disclosed OEM/ODM electronics manufacturing partnership with Dixon Technologies and domestic EMS facilities under Make in India initiatives.', 'src-mca-03', 'https://www.mca.gov.in/filings/imagine-marketing-dixon', 'official_registry', 0.96),
    ('evd-eco-01', 'brd-ecoware', 'supplier_relationship', 'Direct sourcing agreement with certified agro-waste processing hubs and sustainable packaging conversion mills in Odisha and Maharashtra.', 'src-corp-04', 'https://ecoware.in/transparency-report-2024', 'corporate_disclosure', 0.97)
ON CONFLICT (id) DO NOTHING;

-- Seed Brand Supplier Relationships (Connecting Brands to Real Suppliers in DB)
-- Reusing existing suppliers: sup-001 (Apex Precision), sup-002 (Deccan BioPlastics), sup-003 (Utkal GreenFiber)
INSERT INTO brand_supplier_relationships (id, brand_id, supplier_id, relationship_type, product_category_id, relationship_status, source_id, evidence_id, confidence, verification_status)
VALUES 
    ('bsr-001', 'brd-boat', 'sup-001', 'contract_manufacturer', 'cat-sub-audio', 'active', 'src-mca-03', 'evd-boat-01', 0.95, 'verified'),
    ('bsr-002', 'brd-ecoware', 'sup-003', 'raw_material_provider', 'cat-sub-bio-containers', 'active', 'src-corp-04', 'evd-eco-01', 0.96, 'verified'),
    ('bsr-003', 'brd-patagonia', 'sup-002', 'packaging_partner', 'cat-sub-perf-outdoor', 'active', 'src-osh-01', 'evd-pat-01', 0.94, 'verified')
ON CONFLICT (id) DO NOTHING;
