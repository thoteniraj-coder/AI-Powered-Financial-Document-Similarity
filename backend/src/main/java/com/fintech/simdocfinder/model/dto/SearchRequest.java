package com.fintech.simdocfinder.model.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SearchRequest {
    private int topK = 5;
    private double threshold = 0.70;
    private SearchFilters filters;

    @Data
    public static class SearchFilters {
        private String vendor;
        private String documentType;
        private LocalDate dateFrom;
        private LocalDate dateTo;
        private BigDecimal amountMin;
        private BigDecimal amountMax;
        private String currency;
    }
}
