package com.fintech.simdocfinder.repository;

import com.fintech.simdocfinder.model.entity.RetentionPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RetentionPolicyRepository extends JpaRepository<RetentionPolicy, Integer> {
    List<RetentionPolicy> findByIsActiveTrue();
}
