package com.fintech.simdocfinder.repository;

import com.fintech.simdocfinder.model.entity.ApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Integer> {
}
