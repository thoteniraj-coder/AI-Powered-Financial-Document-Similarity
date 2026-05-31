package com.fintech.simdocfinder.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "search_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "searched_by", nullable = false)
    private User searchedBy;

    @ManyToOne
    @JoinColumn(name = "query_document_id")
    private Document queryDocument;

    @Column(name = "result_count", nullable = false)
    private Integer resultCount;

    @Column(name = "threshold_used", nullable = false, precision = 4, scale = 3)
    private BigDecimal thresholdUsed;

    @Column(name = "searched_at", nullable = false, updatable = false)
    private LocalDateTime searchedAt;
}
