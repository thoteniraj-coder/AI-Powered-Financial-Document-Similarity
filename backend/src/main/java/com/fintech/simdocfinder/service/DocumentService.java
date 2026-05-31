package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.embedding.EmbeddingClient;
import com.fintech.simdocfinder.model.dto.DocumentResponse;
import com.fintech.simdocfinder.model.dto.DocumentUploadResponse;
import com.fintech.simdocfinder.model.entity.*;
import com.fintech.simdocfinder.parser.ParserService;
import com.fintech.simdocfinder.repository.DocumentChunkRepository;
import com.fintech.simdocfinder.repository.DocumentMetadataRepository;
import com.fintech.simdocfinder.repository.DocumentRepository;
import com.fintech.simdocfinder.repository.UserRepository;
import com.fintech.simdocfinder.vector.QdrantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
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
    private final EmbeddingClient embeddingClient;
    private final QdrantService qdrantService;
    private final AuditService auditService;
    private final DuplicateDetectionService duplicateDetectionService;
    private final FraudDetectionService fraudDetectionService;

    @Value("${file.storage-path:/tmp/simdocfinder/uploads}")
    private String fileStoragePath;

    @Transactional
    public DocumentUploadResponse uploadDocument(MultipartFile file, String documentType, String userIdStr, String ipAddress) {
        log.info("Starting document upload process for file: {}", file.getOriginalFilename());
        
        User user = null;
        if (userIdStr != null) {
            user = userRepository.findById(Integer.parseInt(userIdStr)).orElse(null);
        }

        if (file.getSize() > 50 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 50MB limit");
        }

        try {
            // Save file to disk
            String filename = file.getOriginalFilename();
            String extension = filename != null && filename.contains(".") ? filename.substring(filename.lastIndexOf(".")) : "";
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
                    .fileType(file.getContentType())
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
            processDocument(document, file, user, ipAddress);

            return DocumentUploadResponse.builder()
                    .documentId(documentId)
                    .filename(filename)
                    .status("completed")
                    .message("Document processed successfully")
                    .build();

        } catch (IOException e) {
            log.error("Failed to save file", e);
            throw new RuntimeException("File storage failed", e);
        }
    }

    private void processDocument(Document document, MultipartFile file, User user, String ipAddress) {
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

            qdrantService.upsertPoints(document.getId(), chunks, embeddings, qdrantMetadata);

            for (int i = 0; i < chunks.size(); i++) {
                DocumentChunk chunk = DocumentChunk.builder()
                        .document(document)
                        .chunkIndex(i)
                        .chunkText(chunks.get(i))
                        .qdrantPointId(UUID.randomUUID().toString())
                        .createdAt(LocalDateTime.now())
                        .build();
                documentChunkRepository.save(chunk);
            }

            document.setProcessingStatus("completed");
            documentRepository.save(document);

            auditService.logAction(user, "DOCUMENT_UPLOAD", "DOCUMENT", document.getId().toString(), "File uploaded: " + document.getFilename(), ipAddress);

            duplicateDetectionService.checkForDuplicates(document, chunks.get(0), embeddings.get(0), metadata);
            fraudDetectionService.checkForAnomalies(document, metadata);

        } catch (Exception e) {
            log.error("Failed to process document {}", document.getId(), e);
            document.setProcessingStatus("failed");
            documentRepository.save(document);
        }
    }

    public Page<DocumentResponse> getDocuments(Pageable pageable) {
        return documentRepository.findByIsDeletedFalse(pageable)
                .map(this::mapToResponse);
    }

    public DocumentResponse getDocumentById(UUID id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        return mapToResponse(document);
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
                .uploadedBy(doc.getUploadedBy() != null ? doc.getUploadedBy().getUsername() : null)
                .uploadedAt(doc.getCreatedAt())
                .build();
    }
}
