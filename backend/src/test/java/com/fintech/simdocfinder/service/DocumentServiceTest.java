package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.embedding.EmbeddingClient;
import com.fintech.simdocfinder.model.dto.DocumentResponse;
import com.fintech.simdocfinder.model.dto.DocumentUploadResponse;
import com.fintech.simdocfinder.model.entity.Document;
import com.fintech.simdocfinder.model.entity.DocumentMetadata;
import com.fintech.simdocfinder.model.entity.User;
import com.fintech.simdocfinder.parser.ParserService;
import com.fintech.simdocfinder.repository.DocumentChunkRepository;
import com.fintech.simdocfinder.repository.DocumentMetadataRepository;
import com.fintech.simdocfinder.repository.DocumentRepository;
import com.fintech.simdocfinder.repository.UserRepository;
import com.fintech.simdocfinder.vector.QdrantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentMetadataRepository documentMetadataRepository;
    @Mock private DocumentChunkRepository documentChunkRepository;
    @Mock private UserRepository userRepository;
    @Mock private ParserService parserService;
    @Mock private TextCleaningService textCleaningService;
    @Mock private ChunkingService chunkingService;
    @Mock private MetadataExtractionService metadataExtractionService;
    @Mock private FileValidationService fileValidationService;
    @Mock private MalwareScanService malwareScanService;
    @Mock private EmbeddingClient embeddingClient;
    @Mock private QdrantService qdrantService;
    @Mock private AuditService auditService;
    @Mock private DuplicateDetectionService duplicateDetectionService;
    @Mock private FraudDetectionService fraudDetectionService;
    @Mock private PiiMaskingService piiMaskingService;

    @InjectMocks
    private DocumentService documentService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(documentService, "fileStoragePath", "target/test-uploads");
    }

    @Test
    void uploadDocument_success() throws Exception {
        // Arrange
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "dummy content".getBytes());
        User user = new User();
        user.setId(1);
        user.setEmail("test@test.com");

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(fileValidationService.validate(file))
                .thenReturn(new FileValidationService.ValidationResult("test.pdf", "pdf", "pdf"));
        
        Document savedDoc = new Document();
        savedDoc.setId(UUID.randomUUID());
        savedDoc.setFilename("test.pdf");
        savedDoc.setCreatedAt(LocalDateTime.now());
        when(documentRepository.save(any(Document.class))).thenReturn(savedDoc);

        when(parserService.parseFile(any())).thenReturn(new ParserService.ParserResult("extracted text", 1, false));
        when(textCleaningService.cleanText("extracted text")).thenReturn("cleaned text");
        
        DocumentMetadata mockMetadata = new DocumentMetadata();
        when(metadataExtractionService.extractMetadata("cleaned text")).thenReturn(mockMetadata);
        
        when(chunkingService.chunkText("cleaned text")).thenReturn(List.of("chunk1"));
        when(embeddingClient.embedBatch(anyList())).thenReturn(List.of(new float[]{0.1f, 0.2f}));

        // Act
        DocumentUploadResponse response = documentService.uploadDocument(file, "invoice", "1", "127.0.0.1");

        // Assert
        assertNotNull(response);
        assertEquals("completed", response.getStatus());
        assertEquals("test.pdf", response.getFilename());
        
        verify(qdrantService, times(1)).upsertPoints(any(), anyList(), anyList(), anyList(), anyMap());
        verify(documentChunkRepository, times(1)).save(any());
        verify(auditService, times(1)).logAction(eq(user), eq("DOCUMENT_UPLOAD"), eq("DOCUMENT"), anyString(), anyString(), eq("127.0.0.1"));
    }

    @Test
    void uploadDocument_processingFailureReturnsFailedStatusAndAuditsFailure() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "broken.pdf",
                "application/pdf",
                "invalid content".getBytes()
        );
        User user = new User();
        user.setId(1);
        user.setEmail("test@test.com");

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(fileValidationService.validate(file))
                .thenReturn(new FileValidationService.ValidationResult("broken.pdf", "pdf", "pdf"));

        Document savedDoc = new Document();
        savedDoc.setId(UUID.randomUUID());
        savedDoc.setFilename("broken.pdf");
        savedDoc.setCreatedAt(LocalDateTime.now());
        when(documentRepository.save(any(Document.class))).thenReturn(savedDoc);
        when(parserService.parseFile(any())).thenThrow(new RuntimeException("Unable to parse PDF"));

        DocumentUploadResponse response = documentService.uploadDocument(file, "invoice", "1", "127.0.0.1");

        assertEquals("failed", response.getStatus());
        assertEquals("failed", savedDoc.getProcessingStatus());
        verify(auditService).logAction(
                eq(user),
                eq("DOCUMENT_UPLOAD_FAILED"),
                eq("DOCUMENT"),
                eq(savedDoc.getId().toString()),
                contains("Unable to parse PDF"),
                eq("127.0.0.1")
        );
        verifyNoInteractions(qdrantService);
    }
}
