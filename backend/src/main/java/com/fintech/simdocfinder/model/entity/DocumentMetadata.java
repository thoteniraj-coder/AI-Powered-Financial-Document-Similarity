package com.fintech.simdocfinder.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "document_metadata")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentMetadata {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "document_id", nullable = false, unique = true)
    private Document document;

    @Column(name = "invoice_number", length = 100)
    private String invoiceNumber;

    @Column(length = 255)
    private String vendor;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(length = 3, columnDefinition = "bpchar")
    private String currency;

    @Column(name = "account_code", length = 50)
    private String accountCode;

    @Column(length = 100)
    private String department;

    @Column(columnDefinition = "TEXT[]")
    private String[] tags;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
