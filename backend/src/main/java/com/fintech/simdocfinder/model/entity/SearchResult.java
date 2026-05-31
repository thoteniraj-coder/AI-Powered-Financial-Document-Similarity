package com.fintech.simdocfinder.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "search_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "search_log_id", nullable = false)
    private SearchLog searchLog;

    @ManyToOne
    @JoinColumn(name = "matched_document_id", nullable = false)
    private Document matchedDocument;

    @Column(name = "similarity_score", nullable = false, precision = 6, scale = 5)
    private BigDecimal similarityScore;

    @Column(nullable = false)
    private Integer rank;

    @Column(name = "matched_snippet", columnDefinition = "TEXT")
    private String matchedSnippet;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
