-- SupplyLens Initial Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'entrepreneur',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sectors (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50)
);

CREATE TABLE businesses (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    sector_id VARCHAR(36) REFERENCES sectors(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    idea_description TEXT NOT NULL,
    target_market VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    budget_amount FLOAT NOT NULL,
    budget_currency VARCHAR(10) DEFAULT 'INR',
    business_model VARCHAR(50) DEFAULT 'contract_oem',
    expected_scale VARCHAR(50) DEFAULT 'pilot',
    readiness_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    sector_id VARCHAR(36) NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    standard_unit VARCHAR(50) DEFAULT 'pieces',
    description TEXT,
    hs_code VARCHAR(20)
);
CREATE INDEX idx_products_name ON products(name);

CREATE TABLE business_requirements (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    estimated_qty FLOAT NOT NULL,
    unit VARCHAR(50) DEFAULT 'pieces',
    priority VARCHAR(50) DEFAULT 'essential',
    technical_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    id VARCHAR(36) PRIMARY KEY,
    legal_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    supplier_type VARCHAR(50) DEFAULT 'OEM',
    industry VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    address TEXT,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    website VARCHAR(255),
    year_established INTEGER,
    employee_range VARCHAR(50),
    business_status VARCHAR(50) DEFAULT 'active',
    verification_status VARCHAR(50) DEFAULT 'Verified',
    verification_score INTEGER DEFAULT 90,
    data_confidence INTEGER DEFAULT 92,
    last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_suppliers_display_name ON suppliers(display_name);
CREATE INDEX idx_suppliers_supplier_type ON suppliers(supplier_type);
CREATE INDEX idx_suppliers_industry ON suppliers(industry);
CREATE INDEX idx_suppliers_country ON suppliers(country);
CREATE INDEX idx_suppliers_city ON suppliers(city);

CREATE TABLE supplier_products (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    specifications JSONB,
    minimum_order_quantity INTEGER DEFAULT 1000 NOT NULL,
    maximum_capacity INTEGER,
    unit VARCHAR(50) DEFAULT 'piece',
    currency VARCHAR(10) DEFAULT 'INR',
    price_min FLOAT NOT NULL,
    price_max FLOAT NOT NULL,
    price_type VARCHAR(50) DEFAULT 'estimated',
    price_source VARCHAR(255),
    price_last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_contacts (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL,
    value VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    is_public_business_contact BOOLEAN DEFAULT TRUE,
    verification_status VARCHAR(50) DEFAULT 'Verified',
    last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_locations (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    location_type VARCHAR(50) DEFAULT 'headquarters',
    address TEXT NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    source VARCHAR(255),
    verification_status VARCHAR(50) DEFAULT 'Verified'
);

CREATE TABLE supplier_ratings (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,
    rating FLOAT NOT NULL,
    review_count INTEGER DEFAULT 0,
    rating_scale VARCHAR(20) DEFAULT '5.0',
    retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_verifications (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    verification_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Verified',
    source VARCHAR(255) NOT NULL,
    evidence JSONB NOT NULL,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE supplier_sources (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    source_name VARCHAR(100) NOT NULL,
    source_url VARCHAR(255),
    source_type VARCHAR(50) DEFAULT 'registry',
    retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_searches (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    business_id VARCHAR(36) REFERENCES businesses(id) ON DELETE CASCADE,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    filters JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    search_id VARCHAR(36) REFERENCES supplier_searches(id) ON DELETE SET NULL,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) DEFAULT 'best_overall',
    overall_score FLOAT NOT NULL,
    price_score FLOAT DEFAULT 0.0,
    product_fit_score FLOAT DEFAULT 0.0,
    location_score FLOAT DEFAULT 0.0,
    moq_score FLOAT DEFAULT 0.0,
    rating_score FLOAT DEFAULT 0.0,
    verification_score FLOAT DEFAULT 0.0,
    logistics_score FLOAT DEFAULT 0.0,
    data_confidence_score FLOAT DEFAULT 0.0,
    recommendation_reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_suppliers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    business_id VARCHAR(36) REFERENCES businesses(id) ON DELETE CASCADE,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_name VARCHAR(255),
    notes TEXT,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE price_history (
    id VARCHAR(36) PRIMARY KEY,
    supplier_product_id VARCHAR(36) NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
    quoted_price FLOAT NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE destinations (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    state VARCHAR(100) DEFAULT 'Odisha',
    city VARCHAR(100) DEFAULT 'Bhubaneswar',
    address TEXT NOT NULL,
    latitude FLOAT NOT NULL DEFAULT 20.2961,
    longitude FLOAT NOT NULL DEFAULT 85.8245,
    destination_type VARCHAR(50) DEFAULT 'Business',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sourcing_scenarios (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    business_id VARCHAR(36) REFERENCES businesses(id) ON DELETE CASCADE,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE SET NULL,
    supplier_product_id VARCHAR(36) REFERENCES supplier_products(id) ON DELETE SET NULL,
    supplier_name VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1000,
    origin_location_id VARCHAR(36),
    origin_city VARCHAR(100),
    origin_country VARCHAR(100),
    origin_lat FLOAT,
    origin_lng FLOAT,
    destination_location_id VARCHAR(36) REFERENCES destinations(id) ON DELETE SET NULL,
    destination_city VARCHAR(100) DEFAULT 'Bhubaneswar',
    destination_country VARCHAR(100) DEFAULT 'India',
    destination_lat FLOAT DEFAULT 20.2961,
    destination_lng FLOAT DEFAULT 85.8245,
    currency VARCHAR(10) DEFAULT 'INR',
    supplier_unit_price FLOAT NOT NULL,
    estimated_product_cost FLOAT NOT NULL,
    estimated_logistics_cost FLOAT NOT NULL,
    estimated_total_cost FLOAT NOT NULL,
    estimated_cost_per_unit FLOAT NOT NULL,
    scenario_status VARCHAR(50) DEFAULT 'active',
    cost_confidence VARCHAR(50) DEFAULT 'medium',
    confidence_reason TEXT,
    price_source VARCHAR(100) DEFAULT 'Publicly listed price',
    price_date VARCHAR(50) DEFAULT 'Recently verified',
    is_price_stale BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logistics_estimates (
    id VARCHAR(36) PRIMARY KEY,
    scenario_id VARCHAR(36) NOT NULL REFERENCES sourcing_scenarios(id) ON DELETE CASCADE,
    mode VARCHAR(50) DEFAULT 'road',
    distance FLOAT NOT NULL,
    estimated_transit_time VARCHAR(50) DEFAULT '2-4 days',
    estimated_cost FLOAT NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    source VARCHAR(100) DEFAULT 'Distance model & standard carrier tariffs',
    estimate_type VARCHAR(50) DEFAULT 'indicative_freight',
    confidence VARCHAR(50) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE optimization_runs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    business_id VARCHAR(36) REFERENCES businesses(id) ON DELETE CASCADE,
    scenario_id VARCHAR(36) REFERENCES sourcing_scenarios(id) ON DELETE SET NULL,
    objective_type VARCHAR(50) DEFAULT 'min_cost',
    objective_configuration JSONB,
    solver VARCHAR(50) DEFAULT 'Exact-B&B',
    status VARCHAR(50) DEFAULT 'OPTIMAL',
    required_quantity FLOAT NOT NULL,
    available_budget FLOAT NOT NULL,
    total_allocated_quantity FLOAT DEFAULT 0.0,
    total_cost FLOAT DEFAULT 0.0,
    average_unit_cost FLOAT DEFAULT 0.0,
    objective_value FLOAT DEFAULT 0.0,
    runtime_ms FLOAT DEFAULT 0.0,
    model_version VARCHAR(50) DEFAULT '1.0.0',
    input_snapshot JSONB,
    explanation TEXT,
    infeasibility_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE optimization_allocations (
    id VARCHAR(36) PRIMARY KEY,
    optimization_run_id VARCHAR(36) NOT NULL REFERENCES optimization_runs(id) ON DELETE CASCADE,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_name VARCHAR(255) NOT NULL,
    quantity FLOAT NOT NULL,
    unit_price FLOAT NOT NULL,
    supplier_cost FLOAT NOT NULL,
    percentage_of_total FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE optimization_constraints (
    id VARCHAR(36) PRIMARY KEY,
    optimization_run_id VARCHAR(36) NOT NULL REFERENCES optimization_runs(id) ON DELETE CASCADE,
    constraint_type VARCHAR(50) NOT NULL,
    constraint_value VARCHAR(100) NOT NULL,
    actual_value VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'SATISFIED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE model_versions (
    id VARCHAR(64) PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    version_tag VARCHAR(50) NOT NULL,
    architecture_type VARCHAR(100) NOT NULL,
    hyperparameters JSONB DEFAULT '{}',
    metrics_snapshot JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE training_dataset_versions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sample_count INTEGER DEFAULT 0,
    features_spec JSONB DEFAULT '{}',
    source_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE model_features (
    id VARCHAR(64) PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    feature_vector JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_model_features_entity ON model_features(entity_type, entity_id);

CREATE TABLE model_predictions (
    id VARCHAR(64) PRIMARY KEY,
    model_version_id VARCHAR(64) NOT NULL,
    business_id VARCHAR(64),
    supplier_id VARCHAR(64) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    predicted_value FLOAT NOT NULL,
    predicted_range_min FLOAT,
    predicted_range_max FLOAT,
    confidence FLOAT DEFAULT 1.0,
    explanation_factors JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_logs (
    id VARCHAR(64) PRIMARY KEY,
    prediction_id VARCHAR(64),
    supplier_id VARCHAR(64) NOT NULL,
    user_action VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Supplier Reports
CREATE TABLE supplier_reports (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    report_type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
