package com.fintech.simdocfinder.controller;

import com.fintech.simdocfinder.model.entity.RetentionPolicy;
import com.fintech.simdocfinder.repository.RetentionPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/retention-policies")
@RequiredArgsConstructor
public class RetentionPolicyController {

    private final RetentionPolicyRepository retentionPolicyRepository;

    @GetMapping
    public ResponseEntity<List<RetentionPolicy>> getPolicies() {
        return ResponseEntity.ok(retentionPolicyRepository.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<RetentionPolicy> updatePolicy(@PathVariable Integer id, @RequestBody RetentionPolicy request) {
        RetentionPolicy policy = retentionPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Retention policy not found"));

        if (request.getRetentionYears() != null) {
            if (request.getRetentionYears() < 1 || request.getRetentionYears() > 7) {
                throw new IllegalArgumentException("Retention period must be between 1 and 7 years.");
            }
            policy.setRetentionYears(request.getRetentionYears());
        }
        if (request.getActionOnExpiry() != null && !request.getActionOnExpiry().isBlank()) {
            policy.setActionOnExpiry(request.getActionOnExpiry());
        }
        if (request.getIsActive() != null) {
            policy.setIsActive(request.getIsActive());
        }
        policy.setUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(retentionPolicyRepository.save(policy));
    }
}
