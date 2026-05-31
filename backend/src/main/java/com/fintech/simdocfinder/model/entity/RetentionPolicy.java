package com.fintech.simdocfinder.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "retention_policies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RetentionPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "document_type", nullable = false, unique = true, length = 50)
    private String documentType;

    @Column(name = "retention_years", nullable = false)
    private Integer retentionYears;

    @Column(name = "action_on_expiry", nullable = false, length = 20)
    private String actionOnExpiry;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
