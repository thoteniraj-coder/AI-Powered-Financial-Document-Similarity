package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.embedding.EmbeddingClient;
import com.fintech.simdocfinder.model.dto.SearchRequest;
import com.fintech.simdocfinder.model.dto.SearchResponse;
import com.fintech.simdocfinder.model.dto.SearchResultItem;
import com.fintech.simdocfinder.model.dto.SearchTextRequest;
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

        List<SearchResultItem> finalResults = buildResultsForChunks(chunks, request, user, null);

        UUID searchId = saveSearchLog(user, null, request.getThreshold(), finalResults);
        auditService.logAction(user, "DOCUMENT_SEARCH", "SEARCH", searchId.toString(), "Performed similarity search", ipAddress);

        return SearchResponse.builder()
                .searchId(searchId)
                .resultCount(finalResults.size())
                .results(finalResults)
                .build();
    }

    public SearchResponse searchSimilarText(SearchTextRequest request, User user, String ipAddress) {
        log.info("Starting text similarity search");

        String cleanedText = textCleaningService.cleanText(request.getQueryText());
        List<String> chunks = chunkingService.chunkText(cleanedText);

        if (chunks.isEmpty()) {
            throw new RuntimeException("No valid text found in query");
        }

        List<SearchResultItem> finalResults = buildResultsForChunks(chunks, request, user, null);

        UUID searchId = saveSearchLog(user, null, request.getThreshold(), finalResults);
        auditService.logAction(user, "DOCUMENT_TEXT_SEARCH", "SEARCH", searchId.toString(), "Performed text similarity search", ipAddress);

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

        List<SearchResultItem> finalResults = buildResultsForChunks(chunkTexts, request, user, documentId);

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

    private List<SearchResultItem> buildResultsForChunks(List<String> queryChunks,
                                                         SearchRequest request,
                                                         User user,
                                                         UUID excludeDocumentId) {
        List<float[]> embeddings = embeddingClient.embedBatch(queryChunks);
        Map<UUID, SearchResultItem> bestMatches = new HashMap<>();
        Filter filter = buildSearchFilter(request.getFilters(), excludeDocumentId);

        for (float[] queryEmbedding : embeddings) {
            List<ScoredPoint> points = qdrantService.searchSimilar(queryEmbedding, request.getTopK() * 2, request.getThreshold(), filter);

            for (ScoredPoint point : points) {
                if (!payloadMatchesFilters(point, request.getFilters())) {
                    continue;
                }

                String docIdStr = point.getPayloadMap().get("document_id").getStringValue();
                UUID docId = UUID.fromString(docIdStr);

                String filename = payloadString(point, "filename", "Unknown");
                String vendor = payloadString(point, "vendor", null);
                String invoiceNumber = payloadString(point, "invoice_number", null);
                String docType = payloadString(point, "document_type", null);
                LocalDate invoiceDate = payloadDate(point.getPayloadMap(), "invoice_date");
                BigDecimal totalAmount = payloadDecimal(point.getPayloadMap(), "total_amount");
                String currency = payloadString(point, "currency", null);
                String chunkText = payloadString(point, "chunk_text", null);
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
                            .invoiceDate(invoiceDate)
                            .totalAmount(totalAmount)
                            .currency(currency)
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

        return finalResults;
    }

    private String getMatchCategory(double score) {
        if (score >= 0.85) return "STRONG_MATCH";
        if (score >= 0.70) return "RELATED";
        return "WEAK_MATCH";
    }

    private Filter buildSearchFilter(SearchRequest.SearchFilters filters, UUID excludeDocumentId) {
        Filter.Builder builder = Filter.newBuilder();
        boolean hasFilter = false;

        if (excludeDocumentId != null) {
            builder.addMustNot(matchKeyword("document_id", excludeDocumentId.toString()));
            hasFilter = true;
        }

        if (filters != null && hasText(filters.getDocumentType())) {
            builder.addMust(matchKeyword("document_type", filters.getDocumentType()));
            hasFilter = true;
        }
        if (filters != null && hasText(filters.getCurrency())) {
            builder.addMust(matchKeyword("currency", filters.getCurrency()));
            hasFilter = true;
        }

        return hasFilter ? builder.build() : null;
    }

    private String payloadString(ScoredPoint point, String key, String fallback) {
        return point.getPayloadMap().containsKey(key) ? point.getPayloadMap().get(key).getStringValue() : fallback;
    }

    private boolean payloadMatchesFilters(ScoredPoint point, SearchRequest.SearchFilters filters) {
        if (filters == null) {
            return true;
        }

        Map<String, io.qdrant.client.grpc.JsonWithInt.Value> payload = point.getPayloadMap();

        if (hasText(filters.getVendor())) {
            String vendor = payload.containsKey("vendor") ? payload.get("vendor").getStringValue() : null;
            if (vendor == null || !vendor.toLowerCase().contains(filters.getVendor().trim().toLowerCase())) {
                return false;
            }
        }

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
