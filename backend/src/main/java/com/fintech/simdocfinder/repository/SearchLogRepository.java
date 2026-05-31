package com.fintech.simdocfinder.repository;

import com.fintech.simdocfinder.model.entity.SearchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SearchLogRepository extends JpaRepository<SearchLog, UUID> {
}
