package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.model.entity.AuditLog;
import com.fintech.simdocfinder.model.entity.User;
import com.fintech.simdocfinder.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(User user, String action, String entityType, String entityId, String payload, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .actorUserId(user != null ? user.getId() : null)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .payload(payload)
                    .ipAddress(ipAddress)
                    .createdAt(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log created: {} by user {}", action, user != null ? user.getId() : "system");
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }

    public Page<AuditLog> getAuditLogs(Integer userId, String action, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findAll(auditLogSpec(userId, action, startDate, endDate), pageable);
    }

    public List<AuditLog> getAuditLogsForExport(Integer userId, String action, LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findAll(
                auditLogSpec(userId, action, startDate, endDate),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
    }

    private Specification<AuditLog> auditLogSpec(Integer userId, String action, LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (userId != null) {
                predicates.add(cb.equal(root.get("actorUserId"), userId));
            }
            if (action != null && !action.isBlank()) {
                predicates.add(cb.equal(root.get("action"), action));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
