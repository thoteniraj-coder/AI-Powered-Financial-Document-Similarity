package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.embedding.EmbeddingClient;
import com.fintech.simdocfinder.model.dto.SearchRequest;
import com.fintech.simdocfinder.model.dto.SearchResponse;
import com.fintech.simdocfinder.model.dto.SearchResultItem;
import com.fintech.simdocfinder.model.entity.*;
import com.fintech.simdocfinder.parser.ParserService;
import com.fintech.simdocfinder.repository.DocumentChunkRepository;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static io.qdrant.client.ConditionFactory.matchKeyword;

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
    private final DocumentChunkRepository documentChunkRepository;
    private final SearchLogRepository searchLogRepository;
    private final SearchResultRepository searchResultRepository;
    private final AuditService auditService;
    private final PiiMaskingService piiMaskingService;

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
            
            Filter filter = buildKeywordFilter(request.getFilters());

            List<ScoredPoint> points = qdrantService.searchSimilar(queryEmbedding, request.getTopK() * 2, request.getThreshold(), filter);

            for (ScoredPoint point : points) {
                if (!payloadMatchesFilters(point, request.getFilters())) {
                    continue;
                }

                String docIdStr = point.getPayloadMap().get("document_id").getStringValue();
                UUID docId = UUID.fromString(docIdStr);
                
                String filename = point.getPayloadMap().containsKey("filename") ? point.getPayloadMap().get("filename").getStringValue() : "Unknown";
                String vendor = point.getPayloadMap().containsKey("vendor") ? point.getPayloadMap().get("vendor").getStringValue() : null;
                String invoiceNumber = point.getPayloadMap().containsKey("invoice_number") ? point.getPayloadMap().get("invoice_number").getStringValue() : null;
                String docType = point.getPayloadMap().containsKey("document_type") ? point.getPayloadMap().get("document_type").getStringValue() : null;
                String chunkText = point.getPayloadMap().containsKey("chunk_text") ? point.getPayloadMap().get("chunk_text").getStringValue() : null;
                chunkText = piiMaskingService.maskForUser(chunkText, user);

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

        UUID searchId = saveSearchLog(user, null, request.getThreshold(), finalResults);
        auditService.logAction(user, "DOCUMENT_SEARCH", "SEARCH", searchId.toString(), "Performed similarity search", ipAddress);

        return SearchResponse.builder()
                .searchId(searchId)
                .resultCount(finalResults.size())
                .results(finalResults)
                .build();
    }

    public SearchResponse searchByDocumentId(UUID documentId, SearchRequest request, User user, String ipAddress) {
        log.info("Starting similarity search for existing document: {}", documentId);

        Document sourceDoc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));

        List<DocumentChunk> chunks = documentChunkRepository.findByDocumentId(documentId);
        if (chunks.isEmpty()) {
            throw new RuntimeException("No chunks found for document: " + documentId + ". The document may not have been processed yet.");
        }

        // Sort by chunk_index to maintain order
        chunks.sort(Comparator.comparingInt(DocumentChunk::getChunkIndex));
        List<String> chunkTexts = chunks.stream().map(DocumentChunk::getChunkText).collect(Collectors.toList());

        List<float[]> embeddings = embeddingClient.embedBatch(chunkTexts);

        // Build filter to exclude the source document from results
        Filter excludeFilter = qdrantService.buildExcludeDocumentFilter(documentId);

        Map<UUID, SearchResultItem> bestMatches = new HashMap<>();

        for (int i = 0; i < embeddings.size(); i++) {
            float[] queryEmbedding = embeddings.get(i);

            List<ScoredPoint> points = qdrantService.searchSimilar(
                    queryEmbedding, request.getTopK() * 2, request.getThreshold(), excludeFilter);

            for (ScoredPoint point : points) {
                String docIdStr = point.getPayloadMap().get("document_id").getStringValue();
                UUID docId = UUID.fromString(docIdStr);

                String filename = point.getPayloadMap().containsKey("filename") ? point.getPayloadMap().get("filename").getStringValue() : "Unknown";
                String vendor = point.getPayloadMap().containsKey("vendor") ? point.getPayloadMap().get("vendor").getStringValue() : null;
                String invoiceNumber = point.getPayloadMap().containsKey("invoice_number") ? point.getPayloadMap().get("invoice_number").getStringValue() : null;
                String docType = point.getPayloadMap().containsKey("document_type") ? point.getPayloadMap().get("document_type").getStringValue() : null;
                String chunkText = point.getPayloadMap().containsKey("chunk_text") ? point.getPayloadMap().get("chunk_text").getStringValue() : null;
                chunkText = piiMaskingService.maskForUser(chunkText, user);

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

        UUID searchId = saveSearchLog(user, sourceDoc, request.getThreshold(), finalResults);
        auditService.logAction(user, "DOCUMENT_FIND_SIMILAR", "DOCUMENT", documentId.toString(),
                "Find similar for: " + sourceDoc.getFilename(), ipAddress);

        return SearchResponse.builder()
                .searchId(searchId)
                .queryDocumentId(documentId)
                .resultCount(finalResults.size())
                .results(finalResults)
                .build();
    }

    private String getMatchCategory(double score) {
        if (score >= 0.85) return "STRONG_MATCH";
        if (score >= 0.70) return "RELATED";
        return "WEAK_MATCH";
    }

    private Filter buildKeywordFilter(SearchRequest.SearchFilters filters) {
        if (filters == null) {
            return null;
        }

        Filter.Builder builder = Filter.newBuilder();
        boolean hasFilter = false;

        if (hasText(filters.getVendor())) {
            builder.addMust(matchKeyword("vendor", filters.getVendor()));
            hasFilter = true;
        }
        if (hasText(filters.getDocumentType())) {
            builder.addMust(matchKeyword("document_type", filters.getDocumentType()));
            hasFilter = true;
        }
        if (hasText(filters.getCurrency())) {
            builder.addMust(matchKeyword("currency", filters.getCurrency()));
            hasFilter = true;
        }

        return hasFilter ? builder.build() : null;
    }

    private boolean payloadMatchesFilters(ScoredPoint point, SearchRequest.SearchFilters filters) {
        if (filters == null) {
            return true;
        }

        Map<String, io.qdrant.client.grpc.JsonWithInt.Value> payload = point.getPayloadMap();

        if (filters.getAmountMin() != null || filters.getAmountMax() != null) {
            BigDecimal amount = payloadDecimal(payload, "total_amount");
            if (amount == null) {
                return false;
            }
            if (filters.getAmountMin() != null && amount.compareTo(filters.getAmountMin()) < 0) {
                return false;
            }
            if (filters.getAmountMax() != null && amount.compareTo(filters.getAmountMax()) > 0) {
                return false;
            }
        }

        if (filters.getDateFrom() != null || filters.getDateTo() != null) {
            LocalDate invoiceDate = payloadDate(payload, "invoice_date");
            if (invoiceDate == null) {
                return false;
            }
            if (filters.getDateFrom() != null && invoiceDate.isBefore(filters.getDateFrom())) {
                return false;
            }
            if (filters.getDateTo() != null && invoiceDate.isAfter(filters.getDateTo())) {
                return false;
            }
        }

        return true;
    }

    private BigDecimal payloadDecimal(Map<String, io.qdrant.client.grpc.JsonWithInt.Value> payload, String key) {
        if (!payload.containsKey(key)) {
            return null;
        }
        try {
            return new BigDecimal(payload.get(key).getStringValue());
        } catch (RuntimeException e) {
            return null;
        }
    }

    private LocalDate payloadDate(Map<String, io.qdrant.client.grpc.JsonWithInt.Value> payload, String key) {
        if (!payload.containsKey(key)) {
            return null;
        }
        try {
            return LocalDate.parse(payload.get(key).getStringValue());
        } catch (RuntimeException e) {
            return null;
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private UUID saveSearchLog(User user, Document queryDocument, double threshold, List<SearchResultItem> results) {
        SearchLog logEntity = SearchLog.builder()
                .searchedBy(user)
                .queryDocument(queryDocument)
                .searchedAt(LocalDateTime.now())
                .resultCount(results.size())
                .thresholdUsed(java.math.BigDecimal.valueOf(threshold))
                .build();
        logEntity = searchLogRepository.save(logEntity);

        for (SearchResultItem result : results) {
            Document doc = documentRepository.findById(result.getDocumentId()).orElse(null);
            if (doc != null) {
                SearchResult sr = SearchResult.builder()
                        .searchLog(logEntity)
                        .matchedDocument(doc)
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
