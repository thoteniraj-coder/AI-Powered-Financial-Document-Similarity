package com.fintech.simdocfinder.repository;

import com.fintech.simdocfinder.model.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
