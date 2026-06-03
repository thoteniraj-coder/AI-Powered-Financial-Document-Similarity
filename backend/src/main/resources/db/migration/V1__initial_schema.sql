-- Extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Users table  
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id),
    department VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by INT NOT NULL REFERENCES users(id),
    filename VARCHAR(512) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    storage_path VARCHAR(1024) NOT NULL,
    processing_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    document_type VARCHAR(50),
    file_size_bytes BIGINT,
    page_count INT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Document Metadata
CREATE TABLE document_metadata (
    id SERIAL PRIMARY KEY,
    document_id UUID NOT NULL UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100),
    vendor VARCHAR(255),
    invoice_date DATE,
    total_amount NUMERIC(15,2),
    currency CHAR(3),
    account_code VARCHAR(50),
    department VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Document Chunks
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    qdrant_point_id VARCHAR(128) NOT NULL UNIQUE,
    token_count INT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_chunk_doc_index UNIQUE(document_id, chunk_index)
);

-- Search Logs
CREATE TABLE search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    searched_by INT NOT NULL REFERENCES users(id),
    query_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    result_count INT NOT NULL DEFAULT 0,
    threshold_used NUMERIC(4,3) NOT NULL DEFAULT 0.700,
    searched_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Search Results
CREATE TABLE search_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_log_id UUID NOT NULL REFERENCES search_logs(id) ON DELETE CASCADE,
    matched_document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    similarity_score NUMERIC(6,5) NOT NULL CHECK(similarity_score BETWEEN 0 AND 1),
    rank INT NOT NULL CHECK(rank >= 1),
    matched_snippet TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit Logs (append-only)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(128),
    payload TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    resolved_by INT REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Alert-Documents junction
CREATE TABLE alert_documents (
    alert_id INT NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    PRIMARY KEY(alert_id, document_id)
);

-- Approval Requests
CREATE TABLE approval_requests (
    id SERIAL PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    requested_by INT NOT NULL REFERENCES users(id),
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reviewer_notes TEXT,
    decided_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Retention Policies
CREATE TABLE retention_policies (
    id SERIAL PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL UNIQUE,
    retention_years INT NOT NULL CHECK(retention_years BETWEEN 1 AND 30),
    action_on_expiry VARCHAR(20) NOT NULL DEFAULT 'archive',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- All indexes from backend_schema.md
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_processing_status ON documents(processing_status);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_deleted_at ON documents(deleted_at);
CREATE INDEX idx_doc_meta_invoice_number ON document_metadata(invoice_number);
CREATE INDEX idx_doc_meta_vendor ON document_metadata(vendor);
CREATE INDEX idx_doc_meta_invoice_date ON document_metadata(invoice_date);
CREATE INDEX idx_doc_meta_total_amount ON document_metadata(total_amount);
CREATE INDEX idx_doc_meta_currency ON document_metadata(currency);
CREATE INDEX idx_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_search_logs_searched_by ON search_logs(searched_by);
CREATE INDEX idx_search_logs_query_document_id ON search_logs(query_document_id);
CREATE INDEX idx_search_logs_searched_at ON search_logs(searched_at DESC);
CREATE INDEX idx_search_results_search_log_id ON search_results(search_log_id);
CREATE INDEX idx_search_results_matched_document_id ON search_results(matched_document_id);
CREATE INDEX idx_search_results_similarity_score ON search_results(similarity_score DESC);
CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_alerts_alert_type ON alerts(alert_type);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alert_documents_document_id ON alert_documents(document_id);
CREATE INDEX idx_approval_requests_document_id ON approval_requests(document_id);
CREATE INDEX idx_approval_requests_assigned_to ON approval_requests(assigned_to);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_document_metadata_updated_at BEFORE UPDATE ON document_metadata FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_approval_requests_updated_at BEFORE UPDATE ON approval_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_retention_policies_updated_at BEFORE UPDATE ON retention_policies FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed data: roles
INSERT INTO roles (name, description) VALUES
('admin', 'Full access to all system features including user and role management'),
('finance_manager', 'Can view all documents, approve or reject workflows, and resolve alerts'),
('finance_clerk', 'Can upload and search documents within their own department'),
('auditor', 'Read-only access to documents, search history, and audit logs'),
('viewer', 'Read-only access to approved documents');

-- Seed data: default admin user (password: Admin@2026)
INSERT INTO users (email, password_hash, full_name, role_id, department) VALUES
('admin@finco.internal', '$2a$12$JPJUY/D8TUM30en.Ra0rBOnfMR/hkvZ6C9c..IemPl.CBGGBW4hCG', 'System Administrator', 1, 'IT');

-- Seed data: retention policies
INSERT INTO retention_policies (document_type, retention_years, action_on_expiry) VALUES
('invoice', 7, 'archive'),
('receipt', 5, 'archive'),
('purchase_order', 7, 'archive'),
('bank_statement', 7, 'archive'),
('payment_record', 5, 'archive'),
('expense_claim', 5, 'archive'),
('contract', 10, 'archive'),
('other', 3, 'archive');
