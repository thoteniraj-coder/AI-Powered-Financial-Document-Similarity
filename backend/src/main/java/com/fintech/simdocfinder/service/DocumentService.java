package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.embedding.EmbeddingClient;
import com.fintech.simdocfinder.model.dto.CompareRequest;
import com.fintech.simdocfinder.model.dto.CompareResponse;
import com.fintech.simdocfinder.model.dto.DocumentResponse;
import com.fintech.simdocfinder.model.dto.DocumentUploadResponse;
import com.fintech.simdocfinder.model.dto.SpreadsheetPreviewResponse;
import com.fintech.simdocfinder.model.entity.*;
import com.fintech.simdocfinder.parser.ParserService;
import com.fintech.simdocfinder.repository.DocumentChunkRepository;
import com.fintech.simdocfinder.repository.DocumentMetadataRepository;
import com.fintech.simdocfinder.repository.DocumentRepository;
import com.fintech.simdocfinder.repository.UserRepository;
import com.fintech.simdocfinder.vector.QdrantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentMetadataRepository documentMetadataRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final UserRepository userRepository;
    
    private final ParserService parserService;
    private final TextCleaningService textCleaningService;
    private final ChunkingService chunkingService;
    private final MetadataExtractionService metadataExtractionService;
    private final FileValidationService fileValidationService;
    private final MalwareScanService malwareScanService;
    private final EmbeddingClient embeddingClient;
    private final QdrantService qdrantService;
    private final AuditService auditService;
    private final DuplicateDetectionService duplicateDetectionService;
    private final FraudDetectionService fraudDetectionService;
    private final PiiMaskingService piiMaskingService;

    @Value("${file.storage-path:/tmp/simdocfinder/uploads}")
    private String fileStoragePath;

    private static final int SPREADSHEET_PREVIEW_MAX_ROWS = 200;
    private static final int SPREADSHEET_PREVIEW_MAX_COLUMNS = 50;

    @Transactional
    public DocumentUploadResponse uploadDocument(MultipartFile file, String documentType, String userIdStr, String ipAddress) {
        return uploadDocument(file, documentType, null, null, null, null, null, null, userIdStr, ipAddress);
    }

    @Transactional
    public DocumentUploadResponse uploadDocument(MultipartFile file,
                                                 String documentType,
                                                 String vendor,
                                                 String invoiceNumber,
                                                 LocalDate invoiceDate,
                                                 BigDecimal amount,
                                                 String currency,
                                                 String department,
                                                 String userIdStr,
                                                 String ipAddress) {
        log.info("Starting document upload process for file: {}", file.getOriginalFilename());
        
        User user = null;
        if (userIdStr != null) {
            user = userRepository.findById(Integer.parseInt(userIdStr)).orElse(null);
        }

        if (file.getSize() > 50 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 50MB limit");
        }

        FileValidationService.ValidationResult validation = fileValidationService.validate(file);
        malwareScanService.scan(file);

        try {
            // Save file to disk
            String filename = validation.originalFilename();
            String extension = "." + validation.extension();
            UUID documentId = UUID.randomUUID();
            String savedFilename = documentId + extension;
            Path storageDir = Paths.get(fileStoragePath);
            if (!Files.exists(storageDir)) {
                Files.createDirectories(storageDir);
            }
            Path targetPath = storageDir.resolve(savedFilename);
            file.transferTo(targetPath.toFile());

            // Create Document record
            Document document = Document.builder()
                    .id(documentId)
                    .uploadedBy(user)
                    .filename(filename)
                    .fileType(validation.normalizedType())
                    .storagePath(targetPath.toString())
                    .processingStatus("processing")
                    .documentType(documentType)
                    .fileSizeBytes(file.getSize())
                    .isDeleted(false)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            document = documentRepository.save(document);

            // Async processing could be here, doing sync for simplicity
            ProcessingResult processingResult = processDocument(
                    document,
                    file,
                    user,
                    ipAddress,
                    vendor,
                    invoiceNumber,
                    invoiceDate,
                    amount,
                    currency,
                    department
            );

            return DocumentUploadResponse.builder()
                    .documentId(document.getId())
                    .filename(filename)
                    .status(processingResult.status())
                    .message(processingResult.message())
                    .build();

        } catch (IOException e) {
            log.error("Failed to save file", e);
            throw new RuntimeException("File storage failed", e);
        }
    }

    private ProcessingResult processDocument(Document document,
                                             MultipartFile file,
                                             User user,
                                             String ipAddress,
                                             String vendor,
                                             String invoiceNumber,
                                             LocalDate invoiceDate,
                                             BigDecimal amount,
                                             String currency,
                                             String department) {
        try {
            ParserService.ParserResult parserResult = parserService.parseFile(file);
            document.setPageCount(parserResult.pageCount());
            
            String cleanedText = textCleaningService.cleanText(parserResult.text());
            if (cleanedText.isEmpty()) {
                document.setProcessingStatus("failed");
                documentRepository.save(document);
                throw new RuntimeException("No text extracted from document");
            }

            DocumentMetadata metadata = metadataExtractionService.extractMetadata(cleanedText);
            applyUploadedMetadata(metadata, vendor, invoiceNumber, invoiceDate, amount, currency, department);
            metadata.setDocument(document);
            metadata.setCreatedAt(LocalDateTime.now());
            metadata.setUpdatedAt(LocalDateTime.now());
            documentMetadataRepository.save(metadata);

            List<String> chunks = chunkingService.chunkText(cleanedText);
            List<float[]> embeddings = embeddingClient.embedBatch(chunks);

            Map<String, Object> qdrantMetadata = new HashMap<>();
            qdrantMetadata.put("filename", document.getFilename());
            qdrantMetadata.put("document_type", document.getDocumentType());
            qdrantMetadata.put("vendor", metadata.getVendor());
            qdrantMetadata.put("invoice_number", metadata.getInvoiceNumber());
            qdrantMetadata.put("invoice_date", metadata.getInvoiceDate());
            qdrantMetadata.put("total_amount", metadata.getTotalAmount());
            qdrantMetadata.put("currency", metadata.getCurrency());
            qdrantMetadata.put("uploaded_by", user != null ? user.getEmail() : null);
            qdrantMetadata.put("upload_timestamp", document.getCreatedAt());

            List<UUID> pointIds = chunks.stream()
                    .map(chunk -> UUID.randomUUID())
                    .collect(Collectors.toList());

            qdrantService.upsertPoints(document.getId(), pointIds, chunks, embeddings, qdrantMetadata);

            for (int i = 0; i < chunks.size(); i++) {
                DocumentChunk chunk = DocumentChunk.builder()
                        .document(document)
                        .chunkIndex(i)
                        .chunkText(chunks.get(i))
                        .qdrantPointId(pointIds.get(i).toString())
                        .createdAt(LocalDateTime.now())
                        .build();
                documentChunkRepository.save(chunk);
            }

            document.setProcessingStatus("completed");
            documentRepository.save(document);

            auditService.logAction(user, "DOCUMENT_UPLOAD", "DOCUMENT", document.getId().toString(), "File uploaded: " + document.getFilename(), ipAddress);

            duplicateDetectionService.checkForDuplicates(document, chunks.get(0), embeddings.get(0), metadata);
            fraudDetectionService.checkForAnomalies(document, metadata);

            return new ProcessingResult("completed", "Document processed successfully");
        } catch (Exception e) {
            log.error("Failed to process document {}", document.getId(), e);
            document.setProcessingStatus("failed");
            documentRepository.save(document);
            auditService.logAction(
                    user,
                    "DOCUMENT_UPLOAD_FAILED",
                    "DOCUMENT",
                    document.getId().toString(),
                    "Document processing failed: " + e.getMessage(),
                    ipAddress
            );
            return new ProcessingResult("failed", "Document processing failed: " + e.getMessage());
        }
    }

    private record ProcessingResult(String status, String message) {}

    private void applyUploadedMetadata(DocumentMetadata metadata,
                                       String vendor,
                                       String invoiceNumber,
                                       LocalDate invoiceDate,
                                       BigDecimal amount,
                                       String currency,
                                       String department) {
        if (hasText(vendor)) {
            metadata.setVendor(vendor.trim());
        }
        if (hasText(invoiceNumber)) {
            metadata.setInvoiceNumber(invoiceNumber.trim());
        }
        if (invoiceDate != null) {
            metadata.setInvoiceDate(invoiceDate);
        }
        if (amount != null) {
            metadata.setTotalAmount(amount);
        }
        if (hasText(currency)) {
            metadata.setCurrency(currency.trim().toUpperCase());
        }
        if (hasText(department)) {
            metadata.setDepartment(department.trim());
        }
    }

    public Page<DocumentResponse> getDocuments(Pageable pageable, Integer days) {
        return getDocuments(pageable, days, null, null, null, null, null, null, null, null, null);
    }

    public Page<DocumentResponse> getDocuments(Pageable pageable,
                                               Integer days,
                                               String query,
                                               String documentType,
                                               String status,
                                               String vendor,
                                               LocalDate dateFrom,
                                               LocalDate dateTo,
                                               BigDecimal amountMin,
                                               BigDecimal amountMax,
                                               String currency) {
        return documentRepository.findAll(
                        documentSpec(days, query, documentType, status, vendor, dateFrom, dateTo, amountMin, amountMax, currency),
                        pageable
                )
                .map(this::mapToResponse);
    }

    private Specification<Document> documentSpec(Integer days,
                                                 String query,
                                                 String documentType,
                                                 String status,
                                                 String vendor,
                                                 LocalDate dateFrom,
                                                 LocalDate dateTo,
                                                 BigDecimal amountMin,
                                                 BigDecimal amountMax,
                                                 String currency) {
        return (root, criteriaQuery, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (days != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), LocalDateTime.now().minusDays(days)));
            }
            if (hasText(documentType)) {
                predicates.add(cb.equal(cb.lower(root.get("documentType")), documentType.trim().toLowerCase()));
            }
            if (hasText(status)) {
                predicates.add(cb.equal(cb.lower(root.get("processingStatus")), status.trim().toLowerCase()));
            }
            if (hasText(query)) {
                String like = contains(query);
                jakarta.persistence.criteria.Subquery<Integer> metadataQuery = criteriaQuery.subquery(Integer.class);
                jakarta.persistence.criteria.Root<DocumentMetadata> meta = metadataQuery.from(DocumentMetadata.class);
                metadataQuery.select(meta.get("id"))
                        .where(
                                cb.equal(meta.get("document").get("id"), root.get("id")),
                                cb.or(
                                        cb.like(cb.lower(meta.get("vendor")), like),
                                        cb.like(cb.lower(meta.get("invoiceNumber")), like),
                                        cb.like(cb.lower(meta.get("currency")), like)
                                )
                        );

                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("filename")), like),
                        cb.like(cb.lower(root.get("documentType")), like),
                        cb.like(cb.lower(root.get("processingStatus")), like),
                        cb.exists(metadataQuery)
                ));
            }

            addMetadataFilters(criteriaQuery, root, cb, predicates, vendor, dateFrom, dateTo, amountMin, amountMax, currency);
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private void addMetadataFilters(jakarta.persistence.criteria.CriteriaQuery<?> criteriaQuery,
                                    jakarta.persistence.criteria.Root<Document> root,
                                    jakarta.persistence.criteria.CriteriaBuilder cb,
                                    List<jakarta.persistence.criteria.Predicate> predicates,
                                    String vendor,
                                    LocalDate dateFrom,
                                    LocalDate dateTo,
                                    BigDecimal amountMin,
                                    BigDecimal amountMax,
                                    String currency) {
        if (!hasText(vendor) && dateFrom == null && dateTo == null && amountMin == null && amountMax == null && !hasText(currency)) {
            return;
        }

        jakarta.persistence.criteria.Subquery<Integer> metadataQuery = criteriaQuery.subquery(Integer.class);
        jakarta.persistence.criteria.Root<DocumentMetadata> meta = metadataQuery.from(DocumentMetadata.class);
        List<jakarta.persistence.criteria.Predicate> metadataPredicates = new ArrayList<>();
        metadataPredicates.add(cb.equal(meta.get("document").get("id"), root.get("id")));

        if (hasText(vendor)) {
            metadataPredicates.add(cb.like(cb.lower(meta.get("vendor")), contains(vendor)));
        }
        if (dateFrom != null) {
            metadataPredicates.add(cb.greaterThanOrEqualTo(meta.get("invoiceDate"), dateFrom));
        }
        if (dateTo != null) {
            metadataPredicates.add(cb.lessThanOrEqualTo(meta.get("invoiceDate"), dateTo));
        }
        if (amountMin != null) {
            metadataPredicates.add(cb.greaterThanOrEqualTo(meta.get("totalAmount"), amountMin));
        }
        if (amountMax != null) {
            metadataPredicates.add(cb.lessThanOrEqualTo(meta.get("totalAmount"), amountMax));
        }
        if (hasText(currency)) {
            metadataPredicates.add(cb.equal(cb.lower(meta.get("currency")), currency.trim().toLowerCase()));
        }

        metadataQuery.select(meta.get("id"))
                .where(metadataPredicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        predicates.add(cb.exists(metadataQuery));
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String contains(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }

    public DocumentResponse getDocumentById(UUID id) {
        return getDocumentById(id, null);
    }

    public DocumentResponse getDocumentById(UUID id, User user) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        DocumentResponse response = mapToResponse(document);
        
        List<DocumentChunk> chunks = documentChunkRepository.findByDocumentId(id);
        if (chunks != null && !chunks.isEmpty()) {
            chunks.sort(java.util.Comparator.comparingInt(DocumentChunk::getChunkIndex));
            List<String> chunkTexts = chunks.stream()
                    .map(DocumentChunk::getChunkText)
                    .collect(Collectors.toList());
            List<String> maskedChunks = chunkTexts.stream()
                    .map(chunk -> piiMaskingService.maskForUser(chunk, user))
                    .collect(Collectors.toList());
            response.setChunks(maskedChunks);
            response.setExtractedText(String.join("\n\n", maskedChunks));
        }
        
        return response;
    }

    @Transactional
    public void softDeleteDocument(UUID id, User user, String ipAddress) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        
        document.setIsDeleted(true);
        document.setDeletedAt(LocalDateTime.now());
        documentRepository.save(document);

        qdrantService.deleteByDocumentId(id);

        auditService.logAction(user, "DOCUMENT_DELETE", "DOCUMENT", id.toString(), "Soft deleted document", ipAddress);
    }

    @Transactional
    public void eraseDocument(UUID id, User user, String ipAddress) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        qdrantService.deleteByDocumentId(id);
        try {
            Files.deleteIfExists(Paths.get(document.getStoragePath()));
        } catch (IOException e) {
            log.warn("Unable to delete stored file for erased document {}: {}", id, e.getMessage());
        }
        documentRepository.delete(document);
        auditService.logAction(user, "DOCUMENT_ERASE", "DOCUMENT", id.toString(), "Permanently erased document and vectors", ipAddress);
    }

    private DocumentResponse mapToResponse(Document doc) {
        DocumentMetadata meta = documentMetadataRepository.findByDocumentId(doc.getId()).orElse(new DocumentMetadata());
        int chunksCount = documentChunkRepository.countByDocumentId(doc.getId());
        
        return DocumentResponse.builder()
                .id(doc.getId())
                .filename(doc.getFilename())
                .fileType(doc.getFileType())
                .documentType(doc.getDocumentType())
                .processingStatus(doc.getProcessingStatus())
                .fileSizeBytes(doc.getFileSizeBytes())
                .vendor(meta.getVendor())
                .invoiceNumber(meta.getInvoiceNumber())
                .invoiceDate(meta.getInvoiceDate())
                .totalAmount(meta.getTotalAmount())
                .currency(meta.getCurrency())
                .chunksCount(chunksCount)
                .uploadedBy(doc.getUploadedBy() != null ? doc.getUploadedBy().getEmail() : null)
                .uploadedAt(doc.getCreatedAt())
                .build();
    }

    public org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> downloadDocument(UUID id) {
        try {
            Document document = documentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            
            Path path = Paths.get(document.getStoragePath());
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(path.toUri());
            
            if (resource.exists() || resource.isReadable()) {
                String contentType = document.getFileType();
                if (contentType == null || contentType.isEmpty() || !contentType.contains("/")) {
                    try {
                        contentType = Files.probeContentType(path);
                    } catch (IOException ex) {
                        // ignore
                    }
                    if (contentType == null) {
                        if ("pdf".equalsIgnoreCase(document.getFileType())) contentType = "application/pdf";
                        else if ("png".equalsIgnoreCase(document.getFileType())) contentType = "image/png";
                        else if ("jpg".equalsIgnoreCase(document.getFileType()) || "jpeg".equalsIgnoreCase(document.getFileType())) contentType = "image/jpeg";
                        else contentType = "application/octet-stream";
                    }
                }
                return org.springframework.http.ResponseEntity.ok()
                        .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFilename() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("Could not read the file!");
            }
        } catch (Exception e) {
            log.error("Error downloading file", e);
            throw new RuntimeException("Error downloading file: " + e.getMessage());
        }
    }

    public SpreadsheetPreviewResponse getSpreadsheetPreview(UUID id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        Path path = Paths.get(document.getStoragePath());
        DataFormatter formatter = new DataFormatter();
        List<SpreadsheetPreviewResponse.SheetPreview> sheetPreviews = new ArrayList<>();

        try (InputStream inputStream = Files.newInputStream(path);
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            for (Sheet sheet : workbook) {
                int originalRows = sheet.getLastRowNum() + 1;
                int originalColumns = getMaxColumnCount(sheet);
                int rowLimit = Math.min(originalRows, SPREADSHEET_PREVIEW_MAX_ROWS);
                int columnLimit = Math.min(originalColumns, SPREADSHEET_PREVIEW_MAX_COLUMNS);
                List<List<String>> rows = new ArrayList<>();

                for (int rowIndex = 0; rowIndex < rowLimit; rowIndex++) {
                    Row row = sheet.getRow(rowIndex);
                    List<String> cells = new ArrayList<>();

                    for (int columnIndex = 0; columnIndex < columnLimit; columnIndex++) {
                        cells.add(row == null ? "" : formatter.formatCellValue(row.getCell(columnIndex)));
                    }

                    rows.add(cells);
                }

                sheetPreviews.add(SpreadsheetPreviewResponse.SheetPreview.builder()
                        .name(sheet.getSheetName())
                        .rows(rows)
                        .truncated(originalRows > rowLimit || originalColumns > columnLimit)
                        .originalRows(originalRows)
                        .originalColumns(originalColumns)
                        .build());
            }

            return SpreadsheetPreviewResponse.builder()
                    .sheets(sheetPreviews)
                    .maxRows(SPREADSHEET_PREVIEW_MAX_ROWS)
                    .maxColumns(SPREADSHEET_PREVIEW_MAX_COLUMNS)
                    .build();
        } catch (Exception e) {
            log.error("Error generating spreadsheet preview", e);
            throw new RuntimeException("Error generating spreadsheet preview: " + e.getMessage(), e);
        }
    }

    private int getMaxColumnCount(Sheet sheet) {
        int maxColumns = 0;
        for (Row row : sheet) {
            if (row.getLastCellNum() > maxColumns) {
                maxColumns = row.getLastCellNum();
            }
        }
        return Math.max(maxColumns, 0);
    }

    public CompareResponse compareDocuments(CompareRequest request, User user, String ipAddress) {
        UUID idA = request.getDocumentIdA();
        UUID idB = request.getDocumentIdB();

        Document docA = documentRepository.findById(idA)
                .orElseThrow(() -> new RuntimeException("Document A not found"));
        Document docB = documentRepository.findById(idB)
                .orElseThrow(() -> new RuntimeException("Document B not found"));

        DocumentMetadata metaA = documentMetadataRepository.findByDocumentId(idA).orElse(new DocumentMetadata());
        DocumentMetadata metaB = documentMetadataRepository.findByDocumentId(idB).orElse(new DocumentMetadata());

        // Simple metadata-based scoring (mimicking the frontend logic for backend validation)
        int matchedFields = 0;
        int totalFields = 5;

        if (metaA.getVendor() != null && metaA.getVendor().equals(metaB.getVendor())) matchedFields++;
        if (metaA.getInvoiceNumber() != null && metaA.getInvoiceNumber().equals(metaB.getInvoiceNumber())) matchedFields++;
        if (metaA.getInvoiceDate() != null && metaA.getInvoiceDate().equals(metaB.getInvoiceDate())) matchedFields++;
        if (metaA.getTotalAmount() != null && metaA.getTotalAmount().equals(metaB.getTotalAmount())) matchedFields++;
        if (docA.getDocumentType() != null && docA.getDocumentType().equals(docB.getDocumentType())) matchedFields++;

        double score = (double) matchedFields / totalFields;

        String similarityLabel = "WEAK_MATCH";
        if (score >= 0.8) similarityLabel = "STRONG_MATCH";
        else if (score >= 0.4) similarityLabel = "RELATED";

        auditService.logAction(user, "DOCUMENT_COMPARE", "DOCUMENT", idA.toString() + "," + idB.toString(), "Compared documents", ipAddress);

        return CompareResponse.builder()
                .documentIdA(idA)
                .documentIdB(idB)
                .score(score)
                .similarityLabel(similarityLabel)
                .isDuplicateCandidate(score >= 0.8)
                .build();
    }
}
