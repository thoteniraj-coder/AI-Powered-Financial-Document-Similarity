package com.fintech.simdocfinder.repository;

import com.fintech.simdocfinder.model.entity.RetentionPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RetentionPolicyRepository extends JpaRepository<RetentionPolicy, Integer> {
}
