-- =============================================================================
-- SupplyLens Migration 008: Master AI Web Intelligence, Discovery & Verification Pipeline
-- Adds: data_sources, supplier_candidates, raw_supplier_records, web_pages,
--       supplier_field_evidence, supplier_conflicts, supplier_entity_links,
--       supplier_audit_events, background_jobs, search_provider_events
-- =============================================================================

-- 1. Data Sources Catalog (Provenance & Registry)
CREATE TABLE IF NOT EXISTS data_sources (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- official_website, commercial_registry, b2b_directory, trade_association
    domain VARCHAR(255) NOT NULL,
    base_url VARCHAR(500),
    access_method VARCHAR(50) DEFAULT 'public_http', -- nimbleway_search, nimbleway_extract, apify_actor, direct_http
    trust_tier VARCHAR(20) DEFAULT 'medium', -- authoritative, high, medium, low
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_data_sources_domain ON data_sources(domain);

-- 2. Background Jobs (Asynchronous Job Orchestration)
CREATE TABLE IF NOT EXISTS background_jobs (
    id VARCHAR(36) PRIMARY KEY,
    job_type VARCHAR(50) NOT NULL, -- supplier_discovery, website_crawl, enrichment_agent, verification_audit
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    business_id VARCHAR(36) REFERENCES businesses(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'queued', -- queued, searching, extracting, normalizing, verifying, completed, failed, cancelled
    provider VARCHAR(50), -- nimbleway, apify, gemini, deepseek
    provider_run_id VARCHAR(255),
    progress_percent INTEGER DEFAULT 0,
    current_step VARCHAR(100) DEFAULT 'Initializing job...',
    query_text TEXT,
    result_count INTEGER DEFAULT 0,
    error_message TEXT,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_bg_jobs_user ON background_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_bg_jobs_status ON background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_bg_jobs_created ON background_jobs(started_at DESC);

-- 3. Supplier Candidates (Pre-Ingestion Staging)
CREATE TABLE IF NOT EXISTS supplier_candidates (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) REFERENCES background_jobs(id) ON DELETE CASCADE,
    query VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    website_url VARCHAR(500) NOT NULL,
    domain VARCHAR(255),
    snippet TEXT,
    country VARCHAR(100),
    discovered_via VARCHAR(50) DEFAULT 'nimbleway', -- nimbleway, apify, user_submitted
    processing_status VARCHAR(50) DEFAULT 'discovered', -- discovered, crawling, extracted, resolved, ingested, rejected
    relevance_score FLOAT DEFAULT 0.0,
    error_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sup_candidates_job ON supplier_candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_sup_candidates_url ON supplier_candidates(website_url);

-- 4. Raw Supplier Records & Scraped Payloads
CREATE TABLE IF NOT EXISTS raw_supplier_records (
    id VARCHAR(36) PRIMARY KEY,
    candidate_id VARCHAR(36) REFERENCES supplier_candidates(id) ON DELETE SET NULL,
    source_url VARCHAR(500) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- nimbleway_extract, apify_actor, direct_http
    status_code INTEGER DEFAULT 200,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    text_content TEXT,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_raw_sup_records_url ON raw_supplier_records(source_url);

-- 5. Web Pages Catalog
CREATE TABLE IF NOT EXISTS web_pages (
    id VARCHAR(36) PRIMARY KEY,
    domain VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL UNIQUE,
    page_type VARCHAR(50) DEFAULT 'general', -- homepage, products, about, contact, certifications, factory
    page_title VARCHAR(255),
    content_hash VARCHAR(64),
    crawl_depth INTEGER DEFAULT 0,
    last_crawled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_web_pages_domain ON web_pages(domain);

-- 6. Field-Level Evidence System (Mandatory Provenance)
CREATE TABLE IF NOT EXISTS supplier_field_evidence (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) REFERENCES suppliers(id) ON DELETE CASCADE,
    candidate_id VARCHAR(36) REFERENCES supplier_candidates(id) ON DELETE SET NULL,
    field_name VARCHAR(100) NOT NULL, -- company_name, public_business_email, public_business_phone, moq, unit_price, address, factory_location, certifications, capabilities
    field_value TEXT NOT NULL,
    source_url VARCHAR(500) NOT NULL,
    source_type VARCHAR(50) NOT NULL DEFAULT 'official_company_website',
    provider VARCHAR(50) NOT NULL, -- apify, nimbleway, geoapify, registry
    excerpt TEXT,
    confidence VARCHAR(20) DEFAULT 'high', -- high, medium, low
    verification_status VARCHAR(50) DEFAULT 'requires_policy_check', -- passed, failed, requires_policy_check, inconclusive
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_field_evidence_supplier ON supplier_field_evidence(supplier_id);
CREATE INDEX IF NOT EXISTS idx_field_evidence_field ON supplier_field_evidence(field_name);

-- 7. Supplier Conflicts & Conflicting Claims
CREATE TABLE IF NOT EXISTS supplier_conflicts (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    claimed_value_a TEXT NOT NULL,
    source_a VARCHAR(500) NOT NULL,
    claimed_value_b TEXT NOT NULL,
    source_b VARCHAR(500) NOT NULL,
    resolution_status VARCHAR(50) DEFAULT 'unresolved', -- unresolved, resolved, ignored
    resolved_value TEXT,
    resolved_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sup_conflicts_sup ON supplier_conflicts(supplier_id);

-- 8. Supplier Entity Links (Deduplication Mapping)
CREATE TABLE IF NOT EXISTS supplier_entity_links (
    id VARCHAR(36) PRIMARY KEY,
    canonical_supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    external_source VARCHAR(100) NOT NULL, -- domain, cin, tax_id, nimbleway_url, apify_dataset_id
    external_id VARCHAR(500) NOT NULL,
    match_confidence FLOAT DEFAULT 1.0,
    matched_by VARCHAR(50) DEFAULT 'domain_resolver', -- exact_domain, name_similarity, phone_match, tax_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(canonical_supplier_id, external_source, external_id)
);
CREATE INDEX IF NOT EXISTS idx_entity_links_canon ON supplier_entity_links(canonical_supplier_id);
CREATE INDEX IF NOT EXISTS idx_entity_links_ext ON supplier_entity_links(external_source, external_id);

-- 9. Supplier Audit Events (Complete Audit Trail)
CREATE TABLE IF NOT EXISTS supplier_audit_events (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- created, verification_status_changed, field_updated, conflict_detected, merged
    actor VARCHAR(100) NOT NULL DEFAULT 'system', -- system, verification_engine, admin_auditor
    previous_state JSONB DEFAULT '{}'::jsonb,
    new_state JSONB DEFAULT '{}'::jsonb,
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_events_sup ON supplier_audit_events(supplier_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON supplier_audit_events(created_at DESC);

-- 10. Search Provider Telemetry & Observability Events
CREATE TABLE IF NOT EXISTS search_provider_events (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) REFERENCES background_jobs(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL, -- nimbleway, apify, geoapify, deepseek, gemini
    endpoint VARCHAR(255) NOT NULL,
    request_type VARCHAR(50) NOT NULL, -- search, extract, crawl, geocode, chat
    status_code INTEGER DEFAULT 200,
    latency_ms INTEGER DEFAULT 0,
    estimated_cost_usd FLOAT DEFAULT 0.0,
    is_success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_provider_events_prov ON search_provider_events(provider);
CREATE INDEX IF NOT EXISTS idx_provider_events_created ON search_provider_events(created_at DESC);

-- Enable RLS
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_supplier_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_field_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_entity_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_provider_events ENABLE ROW LEVEL SECURITY;

-- Permissive RLS Policies
CREATE POLICY "Public can view active data sources" ON data_sources FOR SELECT USING (true);
CREATE POLICY "Users can manage own background jobs" ON background_jobs FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL);
CREATE POLICY "Public can view supplier field evidence" ON supplier_field_evidence FOR SELECT USING (true);
CREATE POLICY "Public can view supplier audit events" ON supplier_audit_events FOR SELECT USING (true);
