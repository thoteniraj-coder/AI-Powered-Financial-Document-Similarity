package com.fintech.simdocfinder.model.dto;

import lombok.Data;

@Data
public class SearchTextRequest extends SearchRequest {
    private String queryText;
}
