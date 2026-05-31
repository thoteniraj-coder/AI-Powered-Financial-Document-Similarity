package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.model.entity.Alert;
import com.fintech.simdocfinder.model.entity.Document;
import com.fintech.simdocfinder.model.entity.DocumentMetadata;
import com.fintech.simdocfinder.repository.AlertRepository;
import com.fintech.simdocfinder.vector.QdrantService;
import io.qdrant.client.grpc.Points.Filter;
import io.qdrant.client.grpc.Points.ScoredPoint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static io.qdrant.client.ConditionFactory.matchKeyword;

@Service
@RequiredArgsConstructor
@Slf4j
public class DuplicateDetectionService {

    private final QdrantService qdrantService;
    private final AlertRepository alertRepository;

    public void checkForDuplicates(Document newDoc, String firstChunk, float[] chunkEmbedding, DocumentMetadata metadata) {
        try {
            // Simple filter to exclude the new doc itself
            Filter filter = null; // In real app, we'd add "must_not: document_id == newDoc.id"

            List<ScoredPoint> similar = qdrantService.searchSimilar(chunkEmbedding, 5, 0.85, filter);

            for (ScoredPoint point : similar) {
                String docIdStr = point.getPayloadMap().get("document_id").getStringValue();
                if (docIdStr.equals(newDoc.getId().toString())) continue;

                double score = point.getScore();
                String invoiceNumber = point.getPayloadMap().containsKey("invoice_number") ? point.getPayloadMap().get("invoice_number").getStringValue() : null;
                String vendor = point.getPayloadMap().containsKey("vendor") ? point.getPayloadMap().get("vendor").getStringValue() : null;

                if (score > 0.90 && metadata.getInvoiceNumber() != null && metadata.getInvoiceNumber().equals(invoiceNumber)) {
                    createAlert("CONFIRMED_DUPLICATE", "HIGH", "Exact invoice duplicate detected.", newDoc.getId(), UUID.fromString(docIdStr));
                } else if (score > 0.85 && metadata.getVendor() != null && metadata.getVendor().equals(vendor)) {
                    createAlert("SUSPECTED_DUPLICATE", "MEDIUM", "Similar document from same vendor detected.", newDoc.getId(), UUID.fromString(docIdStr));
                }
            }
        } catch (Exception e) {
            log.error("Error during duplicate detection", e);
        }
    }

    private void createAlert(String type, String severity, String desc, UUID doc1, UUID doc2) {
        Alert alert = Alert.builder()
                .alertType(type)
                .severity(severity)
                .description(desc)
                .status("NEW")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        alertRepository.save(alert);
        // Note: Missing mapping for Alert <-> Document in Alert class (alert_documents), so skipping link for now
    }
}
