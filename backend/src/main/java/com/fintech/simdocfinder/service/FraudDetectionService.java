package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.model.entity.Alert;
import com.fintech.simdocfinder.model.entity.Document;
import com.fintech.simdocfinder.model.entity.DocumentMetadata;
import com.fintech.simdocfinder.repository.AlertRepository;
import com.fintech.simdocfinder.repository.DocumentMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final DocumentMetadataRepository documentMetadataRepository;
    private final AlertRepository alertRepository;

    @Value("${fraud.amount-deviation-threshold:0.20}")
    private BigDecimal amountDeviationThreshold;

    public void checkForAnomalies(Document document, DocumentMetadata metadata) {
        if (metadata.getVendor() == null || metadata.getVendor().isBlank() || metadata.getTotalAmount() == null) {
            return;
        }

        List<BigDecimal> peerAmounts = documentMetadataRepository
                .findByVendorIgnoreCaseAndTotalAmountIsNotNull(metadata.getVendor())
                .stream()
                .filter(peer -> peer.getDocument() != null && !document.getId().equals(peer.getDocument().getId()))
                .map(DocumentMetadata::getTotalAmount)
                .toList();

        if (peerAmounts.isEmpty()) {
            return;
        }

        BigDecimal mean = peerAmounts.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(peerAmounts.size()), 4, RoundingMode.HALF_UP);

        if (mean.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        BigDecimal deviation = metadata.getTotalAmount()
                .subtract(mean)
                .abs()
                .divide(mean, 4, RoundingMode.HALF_UP);

        if (deviation.compareTo(amountDeviationThreshold) > 0) {
            Alert alert = Alert.builder()
                    .alertType("FRAUD_AMOUNT_DEVIATION")
                    .severity("HIGH")
                    .description("Invoice amount deviates by " + deviation.movePointRight(2).setScale(1, RoundingMode.HALF_UP)
                            + "% from the vendor mean.")
                    .status("open")
                    .documents(Set.of(document))
                    .createdAt(LocalDateTime.now())
                    .build();
            alertRepository.save(alert);
        }
    }
}
