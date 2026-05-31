package com.fintech.simdocfinder.repository;

import com.fintech.simdocfinder.model.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Integer> {
    List<Alert> findByStatus(String status);
}
