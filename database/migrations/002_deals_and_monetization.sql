-- SupplyLens Migration 002: Deal Management, Tender Tracking, and 5% Success Fee Monetization
-- Supports: Tenders/RFQs, Sourcing Deals, Auditable Deal Events, Verification Documents,
--           5% Service Fee Assessments, Invoices, Payments, Webhook Events, and Credit Notes.

-- 1. Service Fee Policies (Configurable 5% monetization policy)
CREATE TABLE IF NOT EXISTS service_fee_policies (
    id VARCHAR(36) PRIMARY KEY,
    version VARCHAR(50) UNIQUE NOT NULL,
    fee_percentage FLOAT NOT NULL DEFAULT 5.0,
    currency VARCHAR(10) DEFAULT 'INR',
    min_fee_cap FLOAT,
    max_fee_cap FLOAT,
    tax_rate_percentage FLOAT DEFAULT 18.0,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_service_fee_policies_version ON service_fee_policies(version);

-- Default v1.0 standard 5% policy
INSERT INTO service_fee_policies (id, version, fee_percentage, currency, tax_rate_percentage, description, is_active)
VALUES ('sfp-v1-standard', 'v1.0-standard', 5.0, 'INR', 18.0, 'SupplyLens Standard 5% Success Fee Policy on confirmed contract value', TRUE)
ON CONFLICT (version) DO NOTHING;

-- 2. Tenders / RFQs
CREATE TABLE IF NOT EXISTS tenders (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    product_category VARCHAR(100) NOT NULL,
    required_quantity FLOAT NOT NULL,
    unit VARCHAR(50) DEFAULT 'pieces',
    estimated_budget FLOAT NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closing_date TIMESTAMP,
    selected_supplier_id VARCHAR(36) REFERENCES suppliers(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'published',
    supporting_documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tenders_business_id ON tenders(business_id);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_selected_supplier ON tenders(selected_supplier_id);

-- 3. Sourcing Deals
CREATE TABLE IF NOT EXISTS sourcing_deals (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    tender_id VARCHAR(36) REFERENCES tenders(id) ON DELETE SET NULL,
    scenario_id VARCHAR(36) REFERENCES sourcing_scenarios(id) ON DELETE SET NULL,
    optimization_run_id VARCHAR(36) REFERENCES optimization_runs(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    confirmed_deal_value FLOAT NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    contract_reference VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    fee_trigger_active BOOLEAN DEFAULT FALSE,
    confirmation_date TIMESTAMP,
    completion_date TIMESTAMP,
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    dispute_reason TEXT,
    supporting_evidence JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sourcing_deals_business_id ON sourcing_deals(business_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_deals_supplier_id ON sourcing_deals(supplier_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_deals_tender_id ON sourcing_deals(tender_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_deals_status ON sourcing_deals(status);
CREATE INDEX IF NOT EXISTS idx_sourcing_deals_contract_ref ON sourcing_deals(contract_reference);
CREATE INDEX IF NOT EXISTS idx_sourcing_deals_verification ON sourcing_deals(verification_status);

-- 4. Deal Events (Audit Trail)
CREATE TABLE IF NOT EXISTS deal_events (
    id VARCHAR(36) PRIMARY KEY,
    deal_id VARCHAR(36) NOT NULL REFERENCES sourcing_deals(id) ON DELETE CASCADE,
    actor_id VARCHAR(36),
    actor_role VARCHAR(50) DEFAULT 'customer',
    event_type VARCHAR(100) NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    description TEXT NOT NULL,
    metadata_snapshot JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_deal_events_deal_id ON deal_events(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_events_event_type ON deal_events(event_type);

-- 5. Deal Documents (Evidence)
CREATE TABLE IF NOT EXISTS deal_documents (
    id VARCHAR(36) PRIMARY KEY,
    deal_id VARCHAR(36) NOT NULL REFERENCES sourcing_deals(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64),
    file_size_bytes INTEGER,
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_deal_documents_deal_id ON deal_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_documents_verification ON deal_documents(verification_status);

-- 6. Service Fee Assessments (5% Fee Calculation)
CREATE TABLE IF NOT EXISTS service_fee_assessments (
    id VARCHAR(36) PRIMARY KEY,
    deal_id VARCHAR(36) UNIQUE NOT NULL REFERENCES sourcing_deals(id) ON DELETE CASCADE,
    business_id VARCHAR(36) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    policy_id VARCHAR(36) REFERENCES service_fee_policies(id) ON DELETE SET NULL,
    policy_version VARCHAR(50) DEFAULT 'v1.0-standard',
    fee_base_amount FLOAT NOT NULL,
    fee_percentage FLOAT DEFAULT 5.0,
    calculated_fee FLOAT NOT NULL,
    tax_rate FLOAT DEFAULT 18.0,
    tax_amount FLOAT NOT NULL,
    total_fee_due FLOAT NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    fee_status VARCHAR(50) DEFAULT 'assessed',
    adjustment_amount FLOAT DEFAULT 0.0,
    adjustment_reason TEXT,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_service_fee_assessments_deal_id ON service_fee_assessments(deal_id);
CREATE INDEX IF NOT EXISTS idx_service_fee_assessments_business_id ON service_fee_assessments(business_id);
CREATE INDEX IF NOT EXISTS idx_service_fee_assessments_status ON service_fee_assessments(fee_status);

-- 7. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(36) PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    assessment_id VARCHAR(36) UNIQUE NOT NULL REFERENCES service_fee_assessments(id) ON DELETE CASCADE,
    deal_id VARCHAR(36) NOT NULL REFERENCES sourcing_deals(id) ON DELETE CASCADE,
    business_id VARCHAR(36) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_address TEXT,
    subtotal FLOAT NOT NULL,
    tax_rate FLOAT DEFAULT 18.0,
    tax_amount FLOAT NOT NULL,
    total_amount FLOAT NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'issued',
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    paid_at TIMESTAMP,
    payment_method VARCHAR(50),
    pdf_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_assessment_id ON invoices(assessment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_deal_id ON invoices(deal_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- 8. Payments
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    deal_id VARCHAR(36) NOT NULL REFERENCES sourcing_deals(id) ON DELETE CASCADE,
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_gateway VARCHAR(50) DEFAULT 'sandbox_mock',
    amount FLOAT NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'initiated',
    gateway_fee FLOAT DEFAULT 0.0,
    gateway_response JSONB,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 9. Payment Webhook Events (Idempotent tracking)
CREATE TABLE IF NOT EXISTS payment_webhook_events (
    id VARCHAR(36) PRIMARY KEY,
    gateway VARCHAR(50) NOT NULL,
    event_id VARCHAR(100) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_id ON payment_webhook_events(event_id);

-- 10. Credit Notes (Waivers, disputes, refunds)
CREATE TABLE IF NOT EXISTS credit_notes (
    id VARCHAR(36) PRIMARY KEY,
    credit_note_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_id VARCHAR(36) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    deal_id VARCHAR(36) NOT NULL REFERENCES sourcing_deals(id) ON DELETE CASCADE,
    amount FLOAT NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    reason TEXT NOT NULL,
    approved_by VARCHAR(36) NOT NULL,
    status VARCHAR(50) DEFAULT 'issued',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_credit_notes_number ON credit_notes(credit_note_number);
CREATE INDEX IF NOT EXISTS idx_credit_notes_invoice_id ON credit_notes(invoice_id);
