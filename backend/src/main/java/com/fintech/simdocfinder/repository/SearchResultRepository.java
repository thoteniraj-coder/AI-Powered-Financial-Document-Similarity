package com.fintech.simdocfinder.repository;

import com.fintech.simdocfinder.model.entity.SearchResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SearchResultRepository extends JpaRepository<SearchResult, UUID> {
}
