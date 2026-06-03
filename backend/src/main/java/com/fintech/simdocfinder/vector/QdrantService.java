package com.fintech.simdocfinder.vector;

import io.qdrant.client.QdrantClient;
import io.qdrant.client.QdrantGrpcClient;
import io.qdrant.client.grpc.Collections.Distance;
import io.qdrant.client.grpc.Collections.VectorParams;
import io.qdrant.client.grpc.Points.Filter;
import io.qdrant.client.grpc.Points.PointStruct;
import io.qdrant.client.grpc.Points.ScoredPoint;
import io.qdrant.client.grpc.Points.SearchPoints;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import static io.qdrant.client.ValueFactory.value;
import static io.qdrant.client.ConditionFactory.matchKeyword;
import static io.qdrant.client.PointIdFactory.id;

@Service
@Slf4j
public class QdrantService {

    private final QdrantClient qdrantClient;
    private static final String COLLECTION_NAME = "financial_documents";

    public QdrantService(@Value("${qdrant.host:localhost}") String host, @Value("${qdrant.port:6334}") int port) {
        this.qdrantClient = new QdrantClient(QdrantGrpcClient.newBuilder(host, port, false).build());
    }

    @PostConstruct
    public void ensureCollection() {
        try {
            boolean exists = qdrantClient.collectionExistsAsync(COLLECTION_NAME).get();
            if (!exists) {
                log.info("Creating Qdrant collection: {}", COLLECTION_NAME);
                qdrantClient.createCollectionAsync(COLLECTION_NAME,
                        VectorParams.newBuilder().setSize(384).setDistance(Distance.Cosine).build()).get();
            } else {
                log.info("Qdrant collection {} already exists", COLLECTION_NAME);
            }
        } catch (Exception e) {
            log.error("Failed to ensure Qdrant collection exists", e);
        }
    }

    public void upsertPoints(UUID documentId, List<UUID> pointIds, List<String> chunks, List<float[]> embeddings, Map<String, Object> metadata) {
        log.info("Upserting {} points to Qdrant for document: {}", chunks.size(), documentId);
        try {
            if (pointIds.size() != chunks.size() || embeddings.size() != chunks.size()) {
                throw new IllegalArgumentException("Point IDs, chunks, and embeddings must have matching sizes");
            }

            List<PointStruct> points = new java.util.ArrayList<>();
            for (int i = 0; i < chunks.size(); i++) {
                Map<String, io.qdrant.client.grpc.JsonWithInt.Value> payload = new java.util.HashMap<>();
                payload.put("document_id", value(documentId.toString()));
                payload.put("chunk_index", value(i));
                payload.put("chunk_text", value(chunks.get(i)));
                if (metadata.get("filename") != null) payload.put("filename", value(metadata.get("filename").toString()));
                if (metadata.get("document_type") != null) payload.put("document_type", value(metadata.get("document_type").toString()));
                if (metadata.get("vendor") != null) payload.put("vendor", value(metadata.get("vendor").toString()));
                if (metadata.get("invoice_number") != null) payload.put("invoice_number", value(metadata.get("invoice_number").toString()));
                if (metadata.get("invoice_date") != null) payload.put("invoice_date", value(metadata.get("invoice_date").toString()));
                if (metadata.get("total_amount") != null) payload.put("total_amount", value(metadata.get("total_amount").toString()));
                if (metadata.get("currency") != null) payload.put("currency", value(metadata.get("currency").toString()));
                if (metadata.get("uploaded_by") != null) payload.put("uploaded_by", value(metadata.get("uploaded_by").toString()));
                if (metadata.get("upload_timestamp") != null) payload.put("upload_timestamp", value(metadata.get("upload_timestamp").toString()));

                points.add(PointStruct.newBuilder()
                        .setId(id(pointIds.get(i)))
                        .setVectors(io.qdrant.client.grpc.Points.Vectors.newBuilder()
                                .setVector(io.qdrant.client.grpc.Points.Vector.newBuilder()
                                        .addAllData(toList(embeddings.get(i)))
                                        .build())
                                .build())
                        .putAllPayload(payload)
                        .build());
            }
            qdrantClient.upsertAsync(COLLECTION_NAME, points).get();
            log.info("Successfully upserted points to Qdrant");
        } catch (Exception e) {
            log.error("Failed to upsert points to Qdrant", e);
            throw new RuntimeException("Qdrant upsert failed", e);
        }
    }

    private Iterable<Float> toList(float[] floats) {
        List<Float> list = new java.util.ArrayList<>(floats.length);
        for (float f : floats) {
            list.add(f);
        }
        return list;
    }

    public List<ScoredPoint> searchSimilar(float[] queryEmbedding, int topK, double threshold, Filter filter) {
        try {
            SearchPoints.Builder searchBuilder = SearchPoints.newBuilder()
                    .setCollectionName(COLLECTION_NAME)
                    .addAllVector(toList(queryEmbedding))
                    .setLimit(topK)
                    .setScoreThreshold((float) threshold)
                    .setWithPayload(io.qdrant.client.grpc.Points.WithPayloadSelector.newBuilder().setEnable(true).build());
            
            if (filter != null) {
                searchBuilder.setFilter(filter);
            }

            return qdrantClient.searchAsync(searchBuilder.build()).get();
        } catch (Exception e) {
            log.error("Failed to search similar points in Qdrant", e);
            throw new RuntimeException("Qdrant search failed", e);
        }
    }

    public void deleteByDocumentId(UUID documentId) {
        try {
            Filter filter = Filter.newBuilder()
                    .addMust(matchKeyword("document_id", documentId.toString()))
                    .build();
            qdrantClient.deleteAsync(COLLECTION_NAME, filter).get();
            log.info("Successfully deleted points for document: {}", documentId);
        } catch (Exception e) {
            log.error("Failed to delete points for document: {}", documentId, e);
            throw new RuntimeException("Qdrant delete failed", e);
        }
    }

    public Filter buildExcludeDocumentFilter(UUID excludeDocumentId) {
        return Filter.newBuilder()
                .addMustNot(matchKeyword("document_id", excludeDocumentId.toString()))
                .build();
    }

    public boolean healthCheck() {
        try {
            return qdrantClient.collectionExistsAsync(COLLECTION_NAME).get();
        } catch (Exception e) {
            return false;
        }
    }
}
