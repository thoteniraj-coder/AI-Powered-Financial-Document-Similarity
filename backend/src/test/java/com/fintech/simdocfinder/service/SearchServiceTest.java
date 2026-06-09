package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.embedding.EmbeddingClient;
import com.fintech.simdocfinder.model.dto.SearchRequest;
import com.fintech.simdocfinder.model.dto.SearchResponse;
import com.fintech.simdocfinder.model.entity.SearchLog;
import com.fintech.simdocfinder.model.entity.User;
import com.fintech.simdocfinder.parser.ParserService;
import com.fintech.simdocfinder.repository.DocumentChunkRepository;
import com.fintech.simdocfinder.repository.DocumentRepository;
import com.fintech.simdocfinder.repository.SearchLogRepository;
import com.fintech.simdocfinder.repository.SearchResultRepository;
import com.fintech.simdocfinder.vector.QdrantService;
import io.qdrant.client.grpc.Points.ScoredPoint;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static io.qdrant.client.ValueFactory.value;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock private ParserService parserService;
    @Mock private TextCleaningService textCleaningService;
    @Mock private ChunkingService chunkingService;
    @Mock private EmbeddingClient embeddingClient;
    @Mock private QdrantService qdrantService;
    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentChunkRepository documentChunkRepository;
    @Mock private SearchLogRepository searchLogRepository;
    @Mock private SearchResultRepository searchResultRepository;
    @Mock private AuditService auditService;

    @InjectMocks
    private SearchService searchService;

    @Test
    void searchSimilar_success() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile("file", "query.pdf", "application/pdf", "dummy".getBytes());
        SearchRequest req = new SearchRequest();
        req.setTopK(5);
        req.setThreshold(0.6);
        User user = new User(); user.setId(1);

        when(parserService.parseFile(any())).thenReturn(new ParserService.ParserResult("text", 1, false));
        when(textCleaningService.cleanText("text")).thenReturn("clean text");
        when(chunkingService.chunkText("clean text")).thenReturn(List.of("chunk1"));
        when(embeddingClient.embedBatch(anyList())).thenReturn(List.of(new float[]{0.5f}));

        UUID matchDocId = UUID.randomUUID();
        ScoredPoint point = ScoredPoint.newBuilder()
                .setScore(0.88f)
                .putAllPayload(Map.of(
                        "document_id", value(matchDocId.toString()),
                        "filename", value("match.pdf"),
                        "chunk_text", value("matched chunk text")
                ))
                .build();
        
        when(qdrantService.searchSimilar(any(float[].class), anyInt(), anyDouble(), any())).thenReturn(List.of(point));

        SearchLog mockLog = new SearchLog(); mockLog.setId(UUID.randomUUID());
        when(searchLogRepository.save(any())).thenReturn(mockLog);

        // Act
        SearchResponse response = searchService.searchSimilar(file, req, user, "127.0.0.1");

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getResultCount());
        assertEquals(matchDocId, response.getResults().get(0).getDocumentId());
        assertEquals(0.88f, response.getResults().get(0).getSimilarityScore(), 0.001);
        assertEquals("STRONG_MATCH", response.getResults().get(0).getMatchCategory());
        
        verify(auditService).logAction(eq(user), eq("DOCUMENT_SEARCH"), anyString(), anyString(), anyString(), anyString());
    }
}
