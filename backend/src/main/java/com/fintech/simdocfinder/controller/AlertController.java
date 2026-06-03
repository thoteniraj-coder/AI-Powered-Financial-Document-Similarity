package com.fintech.simdocfinder.controller;

import com.fintech.simdocfinder.model.dto.AlertResponse;
import com.fintech.simdocfinder.model.entity.Alert;
import com.fintech.simdocfinder.model.entity.User;
import com.fintech.simdocfinder.repository.AlertRepository;
import com.fintech.simdocfinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAlerts() {
        List<AlertResponse> alerts = alertRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::mapToResponse)
                .toList();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlertResponse> getAlert(@PathVariable Integer id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        return ResponseEntity.ok(mapToResponse(alert));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AlertResponse> updateAlert(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        String status = request.getOrDefault("status", alert.getStatus());
        alert.setStatus(status);
        if ("resolved".equalsIgnoreCase(status)) {
            alert.setResolvedAt(LocalDateTime.now());
            if (authentication != null) {
                userRepository.findByEmail(authentication.getName()).ifPresent(alert::setResolvedBy);
            }
        }

        return ResponseEntity.ok(mapToResponse(alertRepository.save(alert)));
    }

    private AlertResponse mapToResponse(Alert alert) {
        User resolvedBy = alert.getResolvedBy();
        return AlertResponse.builder()
                .id(alert.getId())
                .alertType(alert.getAlertType())
                .severity(alert.getSeverity())
                .description(alert.getDescription())
                .status(alert.getStatus())
                .affectedDocuments(List.of())
                .createdAt(alert.getCreatedAt())
                .resolvedBy(resolvedBy != null ? resolvedBy.getEmail() : null)
                .resolvedAt(alert.getResolvedAt())
                .build();
    }
}
