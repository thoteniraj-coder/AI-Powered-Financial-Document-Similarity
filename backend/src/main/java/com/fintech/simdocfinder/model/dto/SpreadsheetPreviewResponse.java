package com.fintech.simdocfinder.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpreadsheetPreviewResponse {
    private List<SheetPreview> sheets;
    private int maxRows;
    private int maxColumns;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SheetPreview {
        private String name;
        private List<List<String>> rows;
        private boolean truncated;
        private int originalRows;
        private int originalColumns;
    }
}
