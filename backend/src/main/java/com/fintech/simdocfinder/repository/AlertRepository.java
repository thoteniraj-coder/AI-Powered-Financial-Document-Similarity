package com.fintech.simdocfinder.repository;

import com.fintech.simdocfinder.model.entity.Alert;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Integer>, JpaSpecificationExecutor<Alert> {
    List<Alert> findByStatus(String status);
    List<Alert> findByCreatedAtAfter(LocalDateTime createdAt, Sort sort);
}
