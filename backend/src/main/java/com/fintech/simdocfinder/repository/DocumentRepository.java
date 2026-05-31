package com.fintech.simdocfinder.repository;

import com.fintech.simdocfinder.model.entity.Document;
import com.fintech.simdocfinder.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    Page<Document> findByUploadedByAndIsDeletedFalse(User uploadedBy, Pageable pageable);
    Page<Document> findByIsDeletedFalse(Pageable pageable);
}
