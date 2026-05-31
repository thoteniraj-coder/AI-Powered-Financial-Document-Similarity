package com.fintech.simdocfinder.model.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class SearchResponse {
    private UUID searchId;
    private UUID queryDocumentId;
    private Integer resultCount;
    private List<SearchResultItem> results;
}
