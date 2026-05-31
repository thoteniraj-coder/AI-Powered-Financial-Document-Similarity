-- ============================================================
-- DATABASE TEST SUITE
-- AI-Powered Financial Document Similarity Finder
-- ============================================================

-- ─── TEST 1: Verify all 12 tables exist ───
\echo '═══ TEST 1: Table existence check ═══'
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ─── TEST 2: Verify seed data — Roles ───
\echo ''
\echo '═══ TEST 2: Roles seed data ═══'
SELECT id, name, description FROM roles ORDER BY id;

-- ─── TEST 3: Verify seed data — Admin user ───
\echo ''
\echo '═══ TEST 3: Admin user seed ═══'
SELECT u.id, u.email, u.full_name, r.name AS role, u.department, u.is_active
FROM users u JOIN roles r ON u.role_id = r.id;

-- ─── TEST 4: Verify seed data — Retention policies ───
\echo ''
\echo '═══ TEST 4: Retention policies seed ═══'
SELECT document_type, retention_years, action_on_expiry FROM retention_policies ORDER BY document_type;

-- ─── TEST 5: Verify indexes ───
\echo ''
\echo '═══ TEST 5: Index count per table ═══'
SELECT tablename, COUNT(*) AS index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ─── TEST 6: Verify triggers ───
\echo ''
\echo '═══ TEST 6: Triggers ═══'
SELECT trigger_name, event_object_table, event_manipulation, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- ─── TEST 7: Verify foreign key constraints ───
\echo ''
\echo '═══ TEST 7: Foreign key constraints ═══'
SELECT tc.table_name, tc.constraint_name, 
       kcu.column_name, 
       ccu.table_name AS foreign_table,
       ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ─── TEST 8: Insert a test document and verify cascading relationships ───
\echo ''
\echo '═══ TEST 8: Insert test document + metadata + chunks ═══'

-- Insert a document
INSERT INTO documents (uploaded_by, filename, file_type, storage_path, processing_status, document_type, file_size_bytes)
VALUES (1, 'test_invoice_001.pdf', 'pdf', '/data/uploads/test_invoice_001.pdf', 'completed', 'invoice', 524288)
RETURNING id, filename, processing_status;

-- Get the document ID
\echo 'Inserting document metadata...'
INSERT INTO document_metadata (document_id, invoice_number, vendor, invoice_date, total_amount, currency, account_code, department)
SELECT id, 'INV-2026-0001', 'Acme Corp', '2026-05-15', 15750.00, 'USD', '4001', 'procurement'
FROM documents WHERE filename = 'test_invoice_001.pdf';

\echo 'Inserting document chunks...'
INSERT INTO document_chunks (document_id, chunk_index, chunk_text, qdrant_point_id)
SELECT id, 0, 'Invoice from Acme Corp dated 2026-05-15 for procurement supplies totaling $15,750.00 USD.', 'qdrant-point-001'
FROM documents WHERE filename = 'test_invoice_001.pdf';

INSERT INTO document_chunks (document_id, chunk_index, chunk_text, qdrant_point_id)
SELECT id, 1, 'Payment terms: Net 30. Account code: 4001. Department: Procurement. Authorized by: John Smith.', 'qdrant-point-002'
FROM documents WHERE filename = 'test_invoice_001.pdf';

\echo 'Verifying document with metadata and chunks...'
SELECT d.filename, d.processing_status, dm.vendor, dm.invoice_number, dm.total_amount, dm.currency,
       (SELECT COUNT(*) FROM document_chunks dc WHERE dc.document_id = d.id) AS chunk_count
FROM documents d
JOIN document_metadata dm ON dm.document_id = d.id
WHERE d.filename = 'test_invoice_001.pdf';

-- ─── TEST 9: Insert a second document and test similarity search logging ───
\echo ''
\echo '═══ TEST 9: Search log + results test ═══'

INSERT INTO documents (uploaded_by, filename, file_type, storage_path, processing_status, document_type, file_size_bytes)
VALUES (1, 'test_invoice_002.pdf', 'pdf', '/data/uploads/test_invoice_002.pdf', 'completed', 'invoice', 410000)
RETURNING id, filename;

-- Create a search log
INSERT INTO search_logs (searched_by, query_document_id, result_count, threshold_used)
SELECT 1, d.id, 1, 0.700
FROM documents d WHERE d.filename = 'test_invoice_001.pdf'
RETURNING id AS search_log_id;

-- Insert a search result
INSERT INTO search_results (search_log_id, matched_document_id, similarity_score, rank, matched_snippet)
SELECT sl.id, d.id, 0.87500, 1, 'Invoice from Acme Corp...'
FROM search_logs sl, documents d
WHERE d.filename = 'test_invoice_002.pdf'
ORDER BY sl.searched_at DESC LIMIT 1;

\echo 'Search results:'
SELECT sl.searched_at, sr.similarity_score, sr.rank, sr.matched_snippet,
       d.filename AS matched_doc
FROM search_logs sl
JOIN search_results sr ON sr.search_log_id = sl.id
JOIN documents d ON d.id = sr.matched_document_id;

-- ─── TEST 10: Audit log test ───
\echo ''
\echo '═══ TEST 10: Audit log (append-only) ═══'

INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, payload, ip_address)
VALUES (1, 'DOCUMENT_UPLOAD', 'document', (SELECT id::text FROM documents WHERE filename = 'test_invoice_001.pdf'), 
        '{"filename": "test_invoice_001.pdf", "file_size": 524288}'::jsonb, '192.168.1.100');

INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, payload, ip_address)
VALUES (1, 'DOCUMENT_SEARCH', 'search_log', 'search-001', 
        '{"query_doc": "test_invoice_001.pdf", "results_found": 1}'::jsonb, '192.168.1.100');

INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, payload, ip_address)
VALUES (1, 'LOGIN', 'user', '1', '{"method": "password"}'::jsonb, '192.168.1.100');

SELECT id, action, entity_type, payload->>'filename' AS detail, created_at FROM audit_logs ORDER BY id;

-- ─── TEST 11: Alert + alert_documents test ───
\echo ''
\echo '═══ TEST 11: Duplicate alert test ═══'

INSERT INTO alerts (alert_type, severity, description)
VALUES ('DUPLICATE_INVOICE', 'HIGH', 'Potential duplicate detected: INV-2026-0001 matched with 87.5% similarity')
RETURNING id;

INSERT INTO alert_documents (alert_id, document_id)
SELECT a.id, d.id
FROM alerts a, documents d
WHERE a.alert_type = 'DUPLICATE_INVOICE' AND d.filename IN ('test_invoice_001.pdf', 'test_invoice_002.pdf');

SELECT a.alert_type, a.severity, a.status, a.description,
       array_agg(d.filename) AS affected_documents
FROM alerts a
JOIN alert_documents ad ON ad.alert_id = a.id
JOIN documents d ON d.id = ad.document_id
GROUP BY a.id;

-- ─── TEST 12: updated_at trigger test ───
\echo ''
\echo '═══ TEST 12: Auto-update trigger test ═══'

\echo 'Before update:'
SELECT email, full_name, updated_at FROM users WHERE id = 1;

-- Wait a tiny bit so the timestamp changes
SELECT pg_sleep(0.1);

UPDATE users SET full_name = 'System Admin (Updated)' WHERE id = 1;

\echo 'After update (updated_at should change):'
SELECT email, full_name, updated_at FROM users WHERE id = 1;

-- ─── TEST 13: Constraint validation ───
\echo ''
\echo '═══ TEST 13: Constraint validation ═══'

-- Test CHECK constraint on similarity_score (should fail)
\echo 'Testing similarity_score CHECK constraint (should fail):'
DO $$
BEGIN
    INSERT INTO search_results (search_log_id, matched_document_id, similarity_score, rank)
    SELECT sl.id, d.id, 1.5, 1
    FROM search_logs sl, documents d
    WHERE d.filename = 'test_invoice_002.pdf'
    LIMIT 1;
    RAISE NOTICE 'FAIL: Constraint did not reject invalid score';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: CHECK constraint correctly rejected similarity_score > 1';
END $$;

-- Test UNIQUE constraint on invoice_number (should fail)
\echo 'Testing unique invoice_number constraint (should fail):'
DO $$
BEGIN
    INSERT INTO document_metadata (document_id, invoice_number)
    SELECT id, 'INV-2026-0001'
    FROM documents WHERE filename = 'test_invoice_002.pdf';
    RAISE NOTICE 'FAIL: Unique constraint did not reject duplicate invoice number';
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'PASS: UNIQUE constraint correctly rejected duplicate invoice_number';
END $$;

-- Test retention_years CHECK constraint (should fail)
\echo 'Testing retention_years CHECK (should fail for 0 years):'
DO $$
BEGIN
    INSERT INTO retention_policies (document_type, retention_years) VALUES ('test_type', 0);
    RAISE NOTICE 'FAIL: CHECK constraint did not reject 0 years';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: CHECK constraint correctly rejected retention_years = 0';
END $$;

-- ─── TEST 14: CASCADE delete test ───
\echo ''
\echo '═══ TEST 14: CASCADE delete test ═══'

\echo 'Chunk count before delete:'
SELECT COUNT(*) AS chunk_count FROM document_chunks WHERE document_id = (SELECT id FROM documents WHERE filename = 'test_invoice_001.pdf');

\echo 'Metadata count before delete:'
SELECT COUNT(*) AS meta_count FROM document_metadata WHERE document_id = (SELECT id FROM documents WHERE filename = 'test_invoice_001.pdf');

DELETE FROM documents WHERE filename = 'test_invoice_001.pdf';

\echo 'Chunk count after cascade delete (should be 0):'
SELECT COUNT(*) AS chunk_count FROM document_chunks WHERE qdrant_point_id IN ('qdrant-point-001', 'qdrant-point-002');

\echo 'Metadata count after cascade delete (should be 0):'
SELECT COUNT(*) AS meta_count FROM document_metadata WHERE invoice_number = 'INV-2026-0001';

-- ─── TEST 15: Final table row counts ───
\echo ''
\echo '═══ TEST 15: Final row counts ═══'
SELECT 'roles' AS table_name, COUNT(*) AS rows FROM roles
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'documents', COUNT(*) FROM documents
UNION ALL SELECT 'document_metadata', COUNT(*) FROM document_metadata
UNION ALL SELECT 'document_chunks', COUNT(*) FROM document_chunks
UNION ALL SELECT 'search_logs', COUNT(*) FROM search_logs
UNION ALL SELECT 'search_results', COUNT(*) FROM search_results
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL SELECT 'alerts', COUNT(*) FROM alerts
UNION ALL SELECT 'alert_documents', COUNT(*) FROM alert_documents
UNION ALL SELECT 'approval_requests', COUNT(*) FROM approval_requests
UNION ALL SELECT 'retention_policies', COUNT(*) FROM retention_policies
ORDER BY table_name;

\echo ''
\echo '════════════════════════════════════════'
\echo '  ALL 15 DATABASE TESTS COMPLETED!'
\echo '════════════════════════════════════════'
