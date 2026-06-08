package com.fintech.simdocfinder.model.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class CompareResponse {
    private UUID documentIdA;
    private UUID documentIdB;
    private Double score;
    private String similarityLabel;
    private Boolean isDuplicateCandidate;
}
