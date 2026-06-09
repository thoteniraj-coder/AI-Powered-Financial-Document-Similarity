package com.fintech.simdocfinder.model.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DocumentResponse {
    private UUID id;
    private String filename;
    private String fileType;
    private String documentType;
    private String processingStatus;
    private Long fileSizeBytes;
    private String vendor;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private BigDecimal totalAmount;
    private String currency;
    private Integer chunksCount;
    private Boolean ocrUsed;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private String extractedText;
    private java.util.List<String> chunks;
}
