package com.fintech.simdocfinder.model.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class DocumentUploadResponse {
    private UUID documentId;
    private String filename;
    private String status;
    private String message;
}
