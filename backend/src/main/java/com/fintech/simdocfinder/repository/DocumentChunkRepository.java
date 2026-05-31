package com.fintech.simdocfinder.repository;

import com.fintech.simdocfinder.model.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, UUID> {
    List<DocumentChunk> findByDocumentId(UUID documentId);
    int countByDocumentId(UUID documentId);
}
