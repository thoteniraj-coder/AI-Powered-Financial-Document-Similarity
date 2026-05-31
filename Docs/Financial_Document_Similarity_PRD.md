# AI-Powered Financial Document Similarity Finder

**Document Type:** Product Requirements Document  
**Version:** 1.0  
**Date:** May 2026  
**Status:** Draft — For Stakeholder Review

## 1. Executive Summary

The AI-Powered Financial Document Similarity Finder is a locally deployed, on-premise semantic search system designed to help finance teams intelligently manage, retrieve, and audit financial documents including invoices, receipts, purchase orders, bank statements, and payment records. Built on a React frontend, Java Spring Boot API, Python-based embedding microservice (Sentence Transformers all-MiniLM-L6-v2), Qdrant vector database, and PostgreSQL metadata store, the platform converts uploaded documents into high-dimensional vector embeddings and enables semantic similarity search — going far beyond keyword matching to surface related documents even when wording differs. Core capabilities include OCR for scanned documents, duplicate invoice detection, fraud anomaly flagging, vendor clustering, payment matching, role-based access control, and tamper-proof audit logging. The system operates entirely on-premise with no cloud dependencies, ensuring compliance with GDPR, PII handling requirements, and internal data retention policies of one to seven years. The product is scoped in three phases: an MVP delivering core upload and similarity search, a second phase adding finance-specific intelligence, and a third phase introducing enterprise workflow approvals, fraud scoring dashboards, and compliance reporting.

## 2. Problem Statement

### 2.1 Core Problem

Finance teams at small-to-medium enterprises routinely handle large volumes of financial documents from multiple vendors, departments, and time periods. Traditional document management systems rely on exact-match search, rigid folder structures, and manual review — all of which break down at scale and fail to catch subtle patterns such as duplicate invoices with minor wording changes, fraudulent bills mimicking legitimate ones, or unmatched payments waiting to be reconciled.

### 2.2 Who Is Affected

- Finance Clerks who must manually cross-check invoices for duplicates and flag anomalies.

- Finance Managers who need visibility across all vendors and departments for approvals and audit readiness.

- Compliance Officers who must ensure documents are retained, accessible, and PII-protected per regulatory requirements.

### 2.3 Impact of the Problem

- Duplicate invoice payments resulting in financial loss.

- Missed fraud patterns due to reliance on manual review.

- Slow audit response times because documents are siloed and unsearchable semantically.

- Regulatory risk from inconsistent PII handling and retention policy enforcement.

## 3. Goals & Success Metrics

### 3.1 Product Objectives (OKRs)

| **Objective**                     | **Key Result**                      | **Target**                             | **Measurement Method**            |
|---|---|---|---|
| Reduce duplicate invoice payments | Duplicate detection rate            | ≥ 95% of duplicates surfaced           | QA test suite on labeled dataset  |
| Accelerate document retrieval     | Avg. search response time           | < 500 ms for top-5 results            | Backend APM (Actuator/Prometheus) |
| Improve audit readiness           | Audit log coverage                  | 100% of uploads and searches logged    | Log completeness report           |
| Reduce manual review effort       | Time-to-identify similar doc        | Reduce by 70% vs. manual baseline      | User time-on-task study           |
| Ensure regulatory compliance      | PII redaction coverage              | 100% of sensitive fields masked in UI  | Automated PII scan                |
| System adoption                   | Active users in 60 days post-launch | ≥ 80% of target finance team           | Analytics dashboard               |
| Search accuracy                   | Precision@5 for similarity search   | ≥ 0.85 cosine threshold on labeled set | Offline eval with ground truth    |

### 3.2 Business Goals

- Eliminate financial losses from duplicate invoice processing by providing automated detection.

- Reduce compliance risk by enforcing consistent audit logging, PII masking, and configurable retention policies.

- Empower finance staff with self-serve semantic search so they can answer document queries in seconds rather than days.

- Establish a foundation for advanced fraud analytics and vendor intelligence in subsequent product phases.

## 4. User Personas

### 4.1 Persona 1 — Finance Clerk (Primary User)

| **Attribute**          | **Priya — Finance Clerk**                                      | **Role Context**                                             | **Day-to-Day Responsibilities** |
|---|---|---|---|
| **Role**               | Accounts Payable Clerk                                         | Individual contributor                                       | Processes 50–100 invoices/day   |
| **Goals**              | Quickly verify invoices are not duplicates before payment      | Avoid manual re-work                                         | Reduce payment errors           |
| **Pain Points**        | Must compare invoices manually across folders                  | Easy to miss near-duplicates with slightly different amounts | No semantic search available    |
| **Tech Level**         | Moderate — comfortable with web apps                           | Uses Excel, ERP system                                       | Not a developer                 |
| **Success Looks Like** | Uploads an invoice and sees duplicates flagged in < 5 seconds | Confident no duplicate exists before approving               | —                               |

### 4.2 Persona 2 — Finance Manager (Secondary User)

| **Attribute**          | **Rajesh — Finance Manager**                                              | **Role Context**                     | **Day-to-Day Responsibilities**                    |
|---|---|---|---|
| **Role**               | Finance Manager                                                           | Team lead for AP/AR                  | Reviews and approves payments, produces reports    |
| **Goals**              | Full visibility across all vendor documents and departments               | Catch fraud early                    | Be audit-ready at all times                        |
| **Pain Points**        | Cannot search across all documents semantically                           | Lacks real-time alerts for anomalies | Audit prep takes days of manual document gathering |
| **Tech Level**         | Moderate-high — uses BI dashboards and ERP                                | Comfortable with web-based tools     | Not a developer                                    |
| **Success Looks Like** | Dashboard showing vendor clusters, duplicate alerts, and full audit trail | —                                    | —                                                  |

### 4.3 Persona 3 — Compliance Officer (Tertiary User)

| **Attribute**          | **Nadia — Compliance Officer**                                             | **Role Context**                         | **Day-to-Day Responsibilities**                      |
|---|---|---|---|
| **Role**               | Compliance & Data Protection Officer                                       | Ensures regulatory adherence             | Manages GDPR, data retention, PII policies           |
| **Goals**              | Ensure all financial documents are retained correctly and PII is protected | Provide evidence for regulatory audits   | Enforce deletion/archival schedules                  |
| **Pain Points**        | No automated PII detection or masking                                      | Manual retention tracking is error-prone | Cannot easily pull audit logs for specific documents |
| **Tech Level**         | Low-moderate — prefers UI-based tools                                      | Relies on IT for technical tasks         | Not a developer                                      |
| **Success Looks Like** | Retention policies enforced automatically; audit logs exportable on demand | —                                        | —                                                    |

## 5. Functional Requirements

### 5.1 Document Upload Module

1.  The system shall accept file uploads in PDF, DOCX, TXT, PNG, JPG, and TIFF formats.

2.  The system shall validate uploaded file type and reject unsupported formats with a descriptive error message.

3.  The system shall enforce a configurable maximum file size limit (default: 50 MB per file).

4.  The system shall scan uploaded files for malware or malicious content before processing.

5.  The system shall extract text from digital PDFs using Apache PDFBox and from DOCX files using Apache POI.

6.  The system shall invoke the Tesseract OCR service for scanned images or PDFs that return empty text extraction.

7.  The system shall split extracted text into chunks of 500–1000 characters with configurable overlap.

8.  The system shall display a real-time upload progress indicator in the React frontend.

### 5.2 Embedding & Vector Storage Module

9.  The system shall send each text chunk to the Python Embedding Service via a REST POST request.

10. The system shall receive a 384-dimensional float vector from the embedding service for each chunk.

11. The system shall upsert each chunk vector along with its metadata payload into the Qdrant vector database.

12. The system shall store the following metadata per chunk: document_id, filename, vendor, invoice_number, invoice_date, total_amount, currency, document_type, uploaded_by, and upload_timestamp.

13. The system shall prevent re-indexing of duplicate documents by checking document ID uniqueness before upsert.

### 5.3 Similarity Search Module

14. The system shall accept a query document upload and extract and embed its text using the same pipeline as ingestion.

15. The system shall query Qdrant using cosine similarity and return the top-K (default: 5) most similar document chunks.

16. The system shall aggregate chunk-level scores per parent document and return one result per unique document.

17. The system shall apply a configurable similarity threshold (default: 0.70) and suppress results below it.

18. The system shall return results including: filename, similarity score, vendor, invoice number, and a short text snippet.

19. The system shall support metadata-based pre-filtering on vendor, currency, invoice date range, total amount range, and document type.

20. The system shall complete similarity search and return results within 500 milliseconds for a corpus of up to 100,000 document chunks.

### 5.4 Duplicate & Fraud Detection Module

21. The system shall flag any two documents with a similarity score above 0.90 and matching invoice number as a confirmed duplicate.

22. The system shall generate a fraud alert when an invoice amount deviates by more than a configurable threshold (default: 20%) from the mean amount for the same vendor.

23. The system shall detect and flag outlier document embeddings that fall outside two standard deviations of the vendor cluster centroid.

24. The system shall surface duplicate and fraud alerts in a dedicated Alerts screen in the frontend.

25. The system shall allow authorized managers to dismiss, escalate, or resolve alerts with a mandatory comment.

### 5.5 Metadata & Audit Module

26. The system shall store full document metadata in PostgreSQL including user, timestamps, status, and version.

27. The system shall write an immutable audit log entry for every upload, search, view, alert action, and deletion.

28. The system shall record audit log fields: event_type, user_id, document_id, timestamp, IP address, and action outcome.

29. The system shall provide an Audit Trail screen allowing managers to search and filter audit logs by user, document, date range, and event type.

30. The system shall support export of audit logs in CSV format for compliance reporting.

### 5.6 Role-Based Access Control (RBAC) Module

31. The system shall implement three roles: Finance Clerk, Finance Manager, and Compliance Officer, with distinct permission sets.

32. The system shall restrict upload and basic search capabilities to Finance Clerk and above.

33. The system shall restrict access to fraud alerts, audit logs, and user management to Finance Manager and Compliance Officer.

34. The system shall restrict access to retention policy configuration and PII settings to Compliance Officer only.

35. The system shall authenticate users via JWT tokens with a configurable session expiry (default: 8 hours).

36. The system shall mask sensitive data fields (bank account numbers, SSNs) in the UI for users below Manager role.

### 5.7 Document Management Module

37. The system shall provide a Document List screen displaying all uploaded documents with sortable columns.

38. The system shall allow authorized users to view individual document details including metadata and similarity search history.

39. The system shall support soft deletion of documents with a configurable retention hold period.

40. The system shall enforce automatic archival and deletion of documents older than the configured retention period (1–7 years).

41. The system shall support a 'Right to Erasure' workflow allowing Compliance Officers to permanently delete a document and its vectors.

### 5.8 API Module

42. The system shall expose a REST endpoint POST `/api/documents/upload` for document ingestion.

43. The system shall expose a REST endpoint POST `/api/documents/search` for similarity search.

44. The system shall expose a REST endpoint POST `/api/documents/compare` for pairwise comparison of two documents.

45. The system shall expose a REST endpoint GET `/api/documents/{id}` for retrieving document details.

46. The system shall expose a REST endpoint GET `/api/audit/{documentId}` for retrieving a document's audit trail.

47. The system shall expose a REST endpoint GET `/api/alerts` for retrieving active fraud and duplicate alerts.

48. The system shall expose a REST endpoint GET `/api/health` for system health status.

49. The system shall return all API responses in JSON format with consistent HTTP status codes and error messages.

## 6. Non-Functional Requirements

### 6.1 Performance

| **Category**             | **Requirement**                                                                                                          |
|---|---|
| **Search Latency**       | Similarity search must return top-5 results in < 500 ms for a corpus of 100,000 chunks on standard on-premise hardware. |
| **Upload Throughput**    | The system must process and index a 10 MB PDF (including OCR) within 30 seconds.                                         |
| **Concurrent Users**     | The system must support at least 50 concurrent users without degradation of response time.                               |
| **Embedding Throughput** | The Python embedding service must process at least 100 text chunks per minute.                                           |
| **Availability**         | The system must achieve 99.5% uptime during business hours (08:00–20:00 local time).                                     |

### 6.2 Scalability

| **Category**        | **Requirement**                                                                                            |
|---|---|
| **Document Corpus** | The vector database must support at least 1 million indexed chunks without architectural change.           |
| **Storage Growth**  | The system must support horizontal scaling of Qdrant via Docker Compose or cluster mode for future growth. |
| **Database Scale**  | PostgreSQL must support a minimum of 500,000 document records with full-text audit log indexing.           |

### 6.3 Security

| **Category**              | **Requirement**                                                                                                                                        |
|---|---|
| **Encryption at Rest**    | All document files and database contents must be encrypted at rest using AES-256 or filesystem-level encryption.                                       |
| **Encryption in Transit** | All API traffic must be served over HTTPS/TLS 1.2 or higher; internal service communication must also use TLS.                                         |
| **Authentication**        | All endpoints except `/api/health` must require a valid JWT token.                                                                                       |
| **Authorization**         | RBAC must be enforced at the API layer; no frontend-only access control is acceptable.                                                                 |
| **File Safety**           | Uploaded files must be scanned for malware before any processing step.                                                                                 |
| **PII Handling**          | PII fields (bank accounts, SSNs, tax IDs) must be masked in API responses for non-privileged roles and may be redacted from stored content on request. |
| **Audit Integrity**       | Audit log records must be immutable; no user role including Administrator may delete individual log entries.                                           |
| **Secrets Management**    | No credentials, API keys, or passwords may be stored in source code or Docker images; use environment variables or a secrets vault.                    |

### 6.4 Accessibility

| **Category**              | **Requirement**                                                                         |
|---|---|
| **WCAG Compliance**       | The React frontend must conform to WCAG 2.1 Level AA accessibility standards.           |
| **Keyboard Navigation**   | All interactive elements must be fully navigable and operable via keyboard alone.       |
| **Screen Reader Support** | All upload inputs, result lists, and alert panels must include appropriate ARIA labels. |
| **Color Contrast**        | All text must meet a minimum contrast ratio of 4.5:1 against its background.            |

### 6.5 Compliance

| **Category**              | **Requirement**                                                                                                                          |
|---|---|
| **GDPR**                  | The system must support the Right to Erasure: complete removal of a data subject's documents and derived data within 30 days of request. |
| **Data Retention**        | Document retention periods must be configurable per document type (default 7 years for invoices) and enforced automatically.             |
| **Audit Logging**         | Audit logs must be retained for a minimum of 5 years and be exportable on demand.                                                        |
| **PII Minimization**      | The system must not store PII beyond what is operationally necessary for document processing.                                            |
| **On-Premise Constraint** | No document content, embeddings, or metadata may leave the organization's on-premise infrastructure.                                     |

## 7. Out of Scope (v1)

The following capabilities are explicitly excluded from the Version 1 release. Inclusion in future phases is noted where applicable.

- **Excluded:** Cloud deployment or SaaS hosting

All services run on-premise. Cloud infrastructure, managed vector databases (e.g. Qdrant Cloud, Pinecone), and cloud file storage are out of scope for v1.

- **Excluded:** Document approval workflow

The multi-step approval queue (upload → review → approve/reject) is a Phase 3 feature and will not be built in v1.

- **Excluded:** Advanced fraud scoring models

ML-based anomaly scoring beyond cosine-distance outlier flagging (e.g. isolation forests, autoencoders) is deferred to Phase 3.

- **Excluded:** Real-time streaming ingestion

Automated ingestion from email, ERP APIs, or file-system watchers is not in scope. v1 supports manual upload only.

- **Excluded:** Mobile native application

The frontend is a responsive web application. Native iOS or Android apps are not in scope.

- **Excluded:** Multi-language OCR beyond Tesseract defaults

While Tesseract supports 39 languages, active configuration, tuning, and QA for languages beyond English are deferred to Phase 2.

- **Excluded:** Document versioning with diff view

Tracking document revisions over time with visual diff is a Phase 3 feature.

- **Excluded:** Vendor analytics dashboard

A dedicated analytics dashboard with charts for vendor clusters, spending trends, and duplicate rates is a Phase 3 deliverable.

- **Excluded:** ERP or accounting system integration

Direct API integration with SAP, Oracle Financials, QuickBooks, or similar systems is not in scope for v1.

- **Excluded:** End-to-end payment reconciliation

Automated matching and reconciliation of invoice-to-payment records in an accounting system is out of scope; v1 surfaces candidate matches only.

## 8. Assumptions & Dependencies

### 8.1 Assumptions

| **Assumption**                                         | **Detail**                                                                                                                                                                                                    |
|---|---|
| **On-premise infrastructure is available**             | The organization has servers or workstations capable of running Docker containers for Qdrant, PostgreSQL, and the Python embedding service with adequate CPU/RAM (minimum 8-core CPU, 16 GB RAM recommended). |
| **Docker is installed and approved**                   | The IT department has approved Docker and Docker Compose for use in the production environment.                                                                                                               |
| **Tesseract OCR language packs are licensed**          | Required Tesseract language packs are available and licensable for the target document languages.                                                                                                             |
| **Finance users will upload documents manually in v1** | No automated document ingestion pipeline exists at launch; users upload documents via the web UI.                                                                                                             |
| **Document corpus is in supported formats**            | The majority of existing documents are in PDF, DOCX, TXT, or image formats. Legacy formats (e.g. .xls, .doc) are handled by pre-conversion.                                                                   |
| **A designated system administrator exists**           | At least one IT staff member will manage Docker services, backups, and security patching.                                                                                                                     |
| **GDPR and local data protection laws apply**          | The organization is subject to GDPR or equivalent PII regulations and requires configurable retention and erasure support.                                                                                    |

### 8.2 External Dependencies & Technologies

| **Dependency**                           | **Detail**                                                                                                                             |
|---|---|
| **Qdrant (open-source, Docker)**         | Vector database for storing and querying 384-dimensional embeddings. Version: latest stable. License: Apache 2.0.                      |
| **Python sentence-transformers library** | Provides the all-MiniLM-L6-v2 embedding model. Requires Python 3.9+. License: Apache 2.0. Model weights downloaded at service startup. |
| **Apache PDFBox (Java)**                 | Text extraction from PDF files. Included as a Maven dependency.                                                                        |
| **Apache POI (Java)**                    | Text extraction from DOCX and other Office formats. Included as a Maven dependency.                                                    |
| **Tesseract OCR**                        | Open-source OCR engine for scanned documents. Must be installed on the host running the backend or as a Docker sidecar.                |
| **PostgreSQL 15+**                       | Relational database for document metadata, user accounts, RBAC, and audit logs. Optional pgvector extension for hybrid search.         |
| **Spring Boot 3.x (Java 21)**            | Backend API framework. Requires Java 21 LDT.                                                                                           |
| **React 18+**                            | Frontend framework. Requires Node.js 18+ and npm/yarn.                                                                                 |
| **Flask (Python)**                       | Lightweight HTTP server for the embedding microservice.                                                                                |
| **Docker Compose**                       | Orchestrates all local services (Qdrant, PostgreSQL, embedding service) in a reproducible local environment.                           |
| **Prometheus + Grafana (optional)**      | Monitoring and alerting stack for tracking API latency, QPS, and embedding throughput in production.                                   |

## 9. Open Questions

The following questions require stakeholder input before the PRD can be finalized and development work commenced.

| **#** | **Question**                                                                                             | **Context & Impact**                                                                                                                                                 | **Owner**                     |
|---|---|---|---|
| 1      | What is the definitive data retention policy per document type?                                          | Invoices, receipts, and bank statements may have different regulatory retention windows. This determines the archival and deletion automation logic.                 | Compliance Officer            |
| 2      | Should the embedding service support batch embedding for bulk historical import?                         | If the organization has an existing archive of thousands of documents to import at launch, a batch API endpoint on the embedding service is required.                | Product Manager               |
| 3      | What is the acceptable false-positive rate for duplicate detection alerts?                               | Too sensitive a threshold creates alert fatigue; too lenient misses real duplicates. Stakeholders must define the acceptable tradeoff.                               | Finance Manager               |
| 4      | Is PostgreSQL the approved relational database, or must the system use an existing enterprise DB?        | Some organizations require Oracle or MSSQL. If so, JPA configuration and pgvector availability need revisiting.                                                      | IT / Infrastructure           |
| 5      | Will the system integrate with an existing identity provider (e.g. Active Directory, LDAP, SSO)?         | If yes, Spring Security must be configured for SAML or OAuth2/OIDC integration rather than local JWT user management.                                                | IT / Security                 |
| 6      | Is virus scanning via ClamAV approved, or is there an existing enterprise antivirus API?                 | The chosen malware scanning approach affects upload latency and infrastructure requirements.                                                                         | IT / Security                 |
| 7      | What fraud alert notification channels are required (email, Slack, in-app only)?                         | Alert delivery mechanism affects Phase 2 architecture. If email or Slack integration is required at launch, this expands scope.                                      | Finance Manager               |
| 8      | Should similarity search results be role-restricted (e.g. clerks see only their department's documents)? | Department-scoped search requires metadata tagging and Qdrant filter logic per user role. If required, this is a significant additional functional requirement.      | Finance Manager / Compliance  |
| 9      | What is the go/no-go criterion for OCR accuracy on the organization's scanned document quality?          | Tesseract accuracy varies significantly with scan resolution and document quality. A minimum accuracy threshold must be agreed before OCR is released to production. | QA / Finance Manager          |
| 10     | Is there a preference for a larger embedding model (all-mpnet-base-v2, 768-dim) if hardware supports it? | A larger model improves similarity accuracy at the cost of 3–5× slower embedding generation. Hardware assessment and user acceptance testing are needed to decide.   | Engineering / Finance Manager |

All open questions should be resolved in the stakeholder review session and documented in the decision log before sprint planning begins.