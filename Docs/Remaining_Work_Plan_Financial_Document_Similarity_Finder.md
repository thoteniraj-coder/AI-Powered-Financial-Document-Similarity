# Remaining Work Plan
## AI-Powered Financial Document Similarity Finder

**Assessment date:** 2026-06-09  
**Compared against:** `Financial_Document_Similarity_PRD.md` and `TRD_Financial_Document_Similarity_Finder.md`

## Execution Status

**Current sprint:** Sprint 1 - Correctness and Contract Stabilization

| Work item | Status | Update |
|---|---|---|
| Truthful upload success/failure handling | Done | Failed processing now returns a failed response and HTTP 422 |
| Failed-upload audit event | Done | Added `DOCUMENT_UPLOAD_FAILED` audit event |
| Upload failure regression tests | Done, pending execution | Added service and controller tests; local Java runtime is unavailable |
| Request DTO/API contract validation | In progress | Next Sprint 1 task |
| Embedding-based document comparison | Remaining | Planned in Sprint 1 |
| Expanded Sprint 1 unit coverage | Remaining | Planned after contract validation and comparison changes |

## 1. Current State

The repository is a broad functional prototype. The main React, Spring Boot,
FastAPI, PostgreSQL, and Qdrant structure exists, and the frontend production
build succeeds. Core upload, parsing, OCR fallback, chunking, embedding,
similarity search, document list/detail, alerts, audit trail, RBAC, retention,
and erasure code is present.

It is not yet production-ready. The largest remaining work is correctness and
failure handling, complete authorization/compliance enforcement, finance
intelligence completion, and launch validation.

| Area | Status | Notes |
|---|---|---|
| Infrastructure and app shell | Mostly complete | Compose files validate; production security and monitoring remain |
| Upload and ingestion | Partial | Main pipeline exists, but failure reporting, progress, OCR QA, and malware enforcement remain |
| Similarity search | Mostly complete | Search, aggregation, filters, and text search exist; performance and accuracy are unvalidated |
| Document management | Partial | List, detail, download, compare, soft delete, and erase exist; authorization and retention semantics need correction |
| Duplicate and fraud alerts | Partial | Duplicate and amount-deviation rules exist; vendor-centroid outlier rule is missing |
| Audit and compliance | Partial | Search/export UI and API exist; immutability, complete event coverage, and retention evidence are missing |
| RBAC and PII | Partial | Endpoint role checks and snippet masking exist; department scoping and full-response masking are incomplete |
| Testing and launch operations | Early | Very small unit-test suite; no integration, E2E, load, security, monitoring, or proven restore tests |

## 2. P0 Production Blockers

1. **Fix ingestion result correctness**
   - `DocumentService.processDocument` catches processing failures, marks the
     record failed, and then lets the upload API return `completed`.
   - Return a failed/accepted status correctly, audit failures, and define
     synchronous versus asynchronous processing behavior.

2. **Enforce document-level authorization**
   - Finance Clerks must only list, view, download, compare, delete, and search
     documents in their department.
   - Apply authorization in service/repository and Qdrant-filter layers, not
     only in frontend navigation.

3. **Correct delete and retention behavior**
   - Soft delete currently removes Qdrant vectors immediately and has no
     configurable retention hold or restore path.
   - Implement soft-delete hold, restore, scheduled archive/delete, and a
     separately authorized Right-to-Erasure workflow with evidence.

4. **Make audit logging complete and immutable**
   - Audit writes currently swallow database failures.
   - Add login success/failure, logout, document view/download, export, user
     management, retention changes, failed upload/search, and erasure events.
   - Prevent audit update/delete at the database permission/trigger level.

5. **Remove production security defaults**
   - Require secrets instead of fallback JWT/database credentials.
   - Set the required 8-hour JWT expiry, call server logout from the frontend,
     enable malware scanning in production, validate file signatures/content,
     add rate limiting, and define HTTPS/TLS termination.

6. **Resolve PRD/TRD role and policy conflicts**
   - Confirm whether `ADMIN`, `AUDITOR`, and `VIEWER` are v1 roles in addition
     to the PRD's Clerk, Manager, and Compliance Officer roles.
   - Confirm department-scoped search, retention periods, alert thresholds,
     OCR quality target, and malware scanner choice.

## 3. Remaining Functional Work

### Ingestion

- Add real upload progress using `onUploadProgress` or an asynchronous job/status API.
- Make max file size and supported formats configuration-driven.
- Validate MIME type and magic bytes, not extension alone.
- Enable and deploy ClamAV or the approved enterprise scanner.
- Improve OCR preprocessing and make tessdata path configurable.
- Add manual metadata correction and re-index endpoints.
- Prevent duplicate re-indexing using a content hash/idempotency rule.

### Search and Comparison

- Enforce department filters in Qdrant searches.
- Push vendor/date/amount filters into Qdrant payload filters where possible.
- Change pairwise comparison from metadata-field matching to embedding-based
  similarity as required by the TRD.
- Add precision@5 evaluation on a labeled financial-document dataset.
- Validate top-5 latency under 500 ms at 100,000 chunks.

### Finance Intelligence

- Implement vendor embedding centroid and two-standard-deviation outlier detection.
- Deduplicate repeated alerts for the same document pair/rule.
- Make thresholds configurable through persisted settings.
- Store alert action comments as structured alert history, not only audit payload.
- Validate false-positive rates with finance users.

### Compliance and UI

- Mask sensitive fields in every API response and document preview for
  non-privileged roles.
- Connect the Settings retention screen to the backend; it currently uses
  browser local storage.
- Remove or implement the local-only API key screen.
- Replace hard-coded dashboard chart values with backend analytics.
- Add role guards to frontend routes, including Compliance Officer access.
- Complete WCAG 2.1 AA keyboard, screen-reader, and contrast testing.

## 4. Non-Functional and Launch Work

- Add Spring Boot Actuator, Micrometer, Prometheus, Grafana, and operational alerts.
- Add structured JSON logging and correlation/request IDs.
- Add retry/circuit-breaker behavior for Qdrant and embedding failures.
- Add encryption-at-rest deployment guidance and TLS for external/internal traffic.
- Repair and validate backup/restore scripts against current Compose container
  names and upload-volume paths; encrypt backups.
- Add API documentation, user/admin/compliance guides, and runbooks.
- Add versioned production images, migration rollback strategy, and staging/UAT.

## 5. Execution Plan

### Sprint 1 - Correctness and Contract Stabilization

- Fix upload success/failure behavior and audit failed operations.
- Validate all request DTO defaults, ranges, errors, and API responses.
- Replace metadata-only comparison with embedding-based comparison.
- Add unit tests for failures, filters, comparison, duplicate/fraud rules, and OCR fallback.

**Done when:** APIs report truthful status, P0 paths have unit coverage, and the
backend test suite passes in CI with Java 21.

### Sprint 2 - Authorization and Compliance Core

- Implement department-scoped document and search access.
- Complete PII masking across detail, download/preview, search, and exports.
- Make audit logs database-immutable and add all mandatory audit events.
- Align roles and frontend route guards with the approved permission matrix.

**Done when:** automated authorization tests prove that each role can access
only its allowed records and actions.

### Sprint 3 - Retention, Erasure, and Secure Upload

- Implement retention hold, restore, archival, scheduled expiry, and erasure evidence.
- Connect retention settings UI to backend policies.
- Enable malware scanning, content-signature validation, configurable limits,
  and secure file storage.
- Remove default secrets and configure 8-hour sessions, logout revocation,
  rate limiting, and TLS deployment.

**Done when:** retention and erasure integration tests pass and infected or
invalid files cannot enter the processing pipeline.

### Sprint 4 - Finance Intelligence Completion

- Implement vendor-centroid outlier detection.
- Add persisted rule configuration and alert history/comments.
- Prevent duplicate alerts and tune thresholds with labeled examples.
- Replace hard-coded dashboard analytics with real metrics.

**Done when:** all PRD duplicate/fraud rules have repeatable tests and agreed
false-positive targets.

### Sprint 5 - Integration, E2E, Performance, and Accessibility

- Add Testcontainers integration tests for PostgreSQL and Qdrant.
- Add E2E tests for login, upload, search, alerts, audit export, retention, and erasure.
- Run 10k/50k/100k chunk performance tests, 10 MB OCR upload tests, and
  50-concurrent-user tests.
- Run OWASP, dependency, file-upload, and WCAG 2.1 AA checks.

**Done when:** PRD performance/security/accessibility targets have recorded
evidence and no open P0 defects.

### Sprint 6 - Operations and Launch Readiness

- Add monitoring dashboards, alerts, structured logs, and failed-job visibility.
- Validate encrypted backup/restore and Qdrant snapshot recovery.
- Complete staging deployment, rollback rehearsal, documentation, and UAT.

**Done when:** launch checklist, restore test, rollback test, stakeholder
decisions, and finance/compliance UAT are signed off.

## 6. Recommended Immediate Order

1. Fix truthful upload failure handling.
2. Add department-level authorization and full PII masking.
3. Make audit logs complete and immutable.
4. Correct retention/soft-delete/erasure behavior.
5. Secure the production configuration and upload path.
6. Complete finance intelligence.
7. Prove quality with integration, E2E, performance, security, and UAT evidence.

## 7. Verification Notes From This Assessment

- `npm run build` passed on 2026-06-09.
- `docker compose config` passed for both Compose files.
- Backend tests could not run locally because a Java runtime is unavailable.
- Embedding-service tests could not run locally because `pytest` is unavailable.
- Existing uncommitted repository changes were not modified.
