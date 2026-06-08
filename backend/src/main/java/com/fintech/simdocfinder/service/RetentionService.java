package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.model.entity.Document;
import com.fintech.simdocfinder.model.entity.RetentionPolicy;
import com.fintech.simdocfinder.repository.DocumentRepository;
import com.fintech.simdocfinder.repository.RetentionPolicyRepository;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class RetentionService {

    private final RetentionPolicyRepository retentionPolicyRepository;
    private final DocumentRepository documentRepository;
    private final DocumentService documentService;

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void executeRetentionPolicy() {
        log.info("Executing document retention policy");
        List<RetentionPolicy> policies = retentionPolicyRepository.findByIsActiveTrue();
        for (RetentionPolicy policy : policies) {
            LocalDateTime cutoff = LocalDateTime.now().minusYears(policy.getRetentionYears());
            List<Document> expiredDocuments = documentRepository
                    .findByIsDeletedFalseAndDocumentTypeAndCreatedAtBefore(policy.getDocumentType(), cutoff);

            for (Document document : expiredDocuments) {
                if ("delete".equalsIgnoreCase(policy.getActionOnExpiry())) {
                    documentService.eraseDocument(document.getId(), null, "retention-policy");
                } else {
                    document.setProcessingStatus("archived");
                    document.setUpdatedAt(LocalDateTime.now());
                    documentRepository.save(document);
                }
            }
        }
    }
}
