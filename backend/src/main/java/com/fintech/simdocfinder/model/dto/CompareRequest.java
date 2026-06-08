package com.fintech.simdocfinder.model.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class CompareRequest {
    private UUID documentIdA;
    private UUID documentIdB;
}
