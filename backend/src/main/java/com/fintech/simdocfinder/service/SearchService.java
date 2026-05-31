package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.embedding.EmbeddingClient;
import com.fintech.simdocfinder.model.dto.SearchRequest;
import com.fintech.simdocfinder.model.dto.SearchResponse;
import com.fintech.simdocfinder.model.dto.SearchResultItem;
import com.fintech.simdocfinder.model.entity.*;
import com.fintech.simdocfinder.parser.ParserService;
import com.fintech.simdocfinder.repository.DocumentRepository;
import com.fintech.simdocfinder.repository.SearchLogRepository;
import com.fintech.simdocfinder.repository.SearchResultRepository;
import com.fintech.simdocfinder.vector.QdrantService;
import io.qdrant.client.grpc.Points.Filter;
import io.qdrant.client.grpc.Points.ScoredPoint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final ParserService parserService;
    private final TextCleaningService textCleaningService;
    private final ChunkingService chunkingService;
    private final EmbeddingClient embeddingClient;
    private final QdrantService qdrantService;
    private final DocumentRepository documentRepository;
    private final SearchLogRepository searchLogRepository;
    private final SearchResultRepository searchResultRepository;
    private final AuditService auditService;

    public SearchResponse searchSimilar(MultipartFile queryFile, SearchRequest request, User user, String ipAddress) {
        log.info("Starting similarity search");
        
        ParserService.ParserResult parserResult = parserService.parseFile(queryFile);
        String cleanedText = textCleaningService.cleanText(parserResult.text());
        List<String> chunks = chunkingService.chunkText(cleanedText);
        
        if (chunks.isEmpty()) {
            throw new RuntimeException("No valid text found in query document");
        }

        List<float[]> embeddings = embeddingClient.embedBatch(chunks);

        Map<UUID, SearchResultItem> bestMatches = new HashMap<>();

        for (int i = 0; i < embeddings.size(); i++) {
            float[] queryEmbedding = embeddings.get(i);
            
            // Build filter if needed
            Filter filter = null; // Simplify for now

            List<ScoredPoint> points = qdrantService.searchSimilar(queryEmbedding, request.getTopK() * 2, request.getThreshold(), filter);

            for (ScoredPoint point : points) {
                String docIdStr = point.getPayloadMap().get("document_id").getStringValue();
                UUID docId = UUID.fromString(docIdStr);
                
                String filename = point.getPayloadMap().containsKey("filename") ? point.getPayloadMap().get("filename").getStringValue() : "Unknown";
                String vendor = point.getPayloadMap().containsKey("vendor") ? point.getPayloadMap().get("vendor").getStringValue() : null;
                String invoiceNumber = point.getPayloadMap().containsKey("invoice_number") ? point.getPayloadMap().get("invoice_number").getStringValue() : null;
                String docType = point.getPayloadMap().containsKey("document_type") ? point.getPayloadMap().get("document_type").getStringValue() : null;
                String chunkText = point.getPayloadMap().containsKey("chunk_text") ? point.getPayloadMap().get("chunk_text").getStringValue() : null;

                double score = point.getScore();
                
                SearchResultItem item = bestMatches.get(docId);
                if (item == null || score > item.getSimilarityScore()) {
                    bestMatches.put(docId, SearchResultItem.builder()
                            .documentId(docId)
                            .filename(filename)
                            .vendor(vendor)
                            .invoiceNumber(invoiceNumber)
                            .documentType(docType)
                            .similarityScore(score)
                            .matchedSnippet(chunkText)
                            .matchCategory(getMatchCategory(score))
                            .build());
                }
            }
        }

        List<SearchResultItem> finalResults = bestMatches.values().stream()
                .sorted(Comparator.comparing(SearchResultItem::getSimilarityScore).reversed())
                .limit(request.getTopK())
                .collect(Collectors.toList());

        for (int i = 0; i < finalResults.size(); i++) {
            finalResults.get(i).setRank(i + 1);
        }

        UUID searchId = saveSearchLog(user, finalResults);
        auditService.logAction(user, "DOCUMENT_SEARCH", "SEARCH", searchId.toString(), "Performed similarity search", ipAddress);

        return SearchResponse.builder()
                .searchId(searchId)
                .resultCount(finalResults.size())
                .results(finalResults)
                .build();
    }

    private String getMatchCategory(double score) {
        if (score >= 0.85) return "STRONG_MATCH";
        if (score >= 0.70) return "RELATED";
        return "WEAK_MATCH";
    }

    private UUID saveSearchLog(User user, List<SearchResultItem> results) {
        SearchLog logEntity = SearchLog.builder()
                .searchedBy(user)
                .searchedAt(LocalDateTime.now()).resultCount(results.size()).thresholdUsed(java.math.BigDecimal.valueOf(0.70))
                .createdAt(LocalDateTime.now())
                .build();
        logEntity = searchLogRepository.save(logEntity);

        for (SearchResultItem result : results) {
            Document doc = documentRepository.findById(result.getDocumentId()).orElse(null);
            if (doc != null) {
                SearchResult sr = SearchResult.builder()
                        .searchLog(logEntity)
                        .document(doc)
                        .similarityScore(java.math.BigDecimal.valueOf(result.getSimilarityScore()))
                        .rank(result.getRank())
                        .matchedSnippet(result.getMatchedSnippet())
                        .createdAt(LocalDateTime.now())
                        .build();
                searchResultRepository.save(sr);
            }
        }
        return logEntity.getId();
    }
}
