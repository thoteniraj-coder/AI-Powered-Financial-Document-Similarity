package com.fintech.simdocfinder.model.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class AlertResponse {
    private Integer id;
    private String alertType;
    private String severity;
    private String description;
    private String status;
    private List<DocumentResponse> affectedDocuments;
    private LocalDateTime createdAt;
    private String resolvedBy;
    private LocalDateTime resolvedAt;
}
