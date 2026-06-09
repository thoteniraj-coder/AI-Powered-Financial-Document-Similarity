package com.fintech.simdocfinder.model.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class SearchResultItem {
    private UUID documentId;
    private String filename;
    private String vendor;
    private String invoiceNumber;
    private String documentType;
    private LocalDate invoiceDate;
    private BigDecimal totalAmount;
    private String currency;
    private Double similarityScore;
    private Integer rank;
    private String matchedSnippet;
    private String matchCategory; // STRONG_MATCH, RELATED, WEAK_MATCH
}
