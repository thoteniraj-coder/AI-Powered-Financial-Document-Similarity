package com.fintech.simdocfinder.repository;

import com.fintech.simdocfinder.model.entity.DocumentMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentMetadataRepository extends JpaRepository<DocumentMetadata, Integer> {
    Optional<DocumentMetadata> findByDocumentId(UUID documentId);
    List<DocumentMetadata> findByVendorIgnoreCaseAndTotalAmountIsNotNull(String vendor);
}
