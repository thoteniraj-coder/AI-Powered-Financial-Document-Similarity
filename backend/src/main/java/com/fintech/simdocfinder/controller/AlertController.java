package com.fintech.simdocfinder.controller;

import com.fintech.simdocfinder.model.dto.AlertResponse;
import com.fintech.simdocfinder.model.dto.DocumentResponse;
import com.fintech.simdocfinder.model.entity.Alert;
import com.fintech.simdocfinder.model.entity.Document;
import com.fintech.simdocfinder.model.entity.User;
import com.fintech.simdocfinder.repository.AlertRepository;
import com.fintech.simdocfinder.repository.UserRepository;
import com.fintech.simdocfinder.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAlerts(
            @RequestParam(required = false) Integer days) {
        List<AlertResponse> alerts;
        if (days != null) {
            LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
            alerts = alertRepository.findByCreatedAtAfter(cutoff, Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                    .map(this::mapToResponse)
                    .toList();
        } else {
            alerts = alertRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                    .map(this::mapToResponse)
                    .toList();
        }
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
            Authentication authentication,
            HttpServletRequest servletRequest) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        String status = request.getOrDefault("status", alert.getStatus());
        String comment = request.getOrDefault("comment", "").trim();
        if (requiresComment(status) && comment.isBlank()) {
            throw new IllegalArgumentException("A comment is required to " + status + " an alert.");
        }

        User actor = null;
        if (authentication != null) {
            actor = userRepository.findByEmail(authentication.getName()).orElse(null);
        }

        alert.setStatus(status);
        if (isTerminalStatus(status)) {
            alert.setResolvedAt(LocalDateTime.now());
            if (actor != null) {
                alert.setResolvedBy(actor);
            }
        }

        Alert saved = alertRepository.save(alert);
        auditService.logAction(actor, "ALERT_" + status.toUpperCase(), "ALERT", id.toString(),
                comment.isBlank() ? "Alert status changed to " + status : comment,
                servletRequest.getRemoteAddr());

        return ResponseEntity.ok(mapToResponse(saved));
    }

    private AlertResponse mapToResponse(Alert alert) {
        User resolvedBy = alert.getResolvedBy();
        return AlertResponse.builder()
                .id(alert.getId())
                .alertType(alert.getAlertType())
                .severity(alert.getSeverity())
                .description(alert.getDescription())
                .status(alert.getStatus())
                .affectedDocuments(alert.getDocuments() == null ? List.of() : alert.getDocuments().stream().map(this::mapDocument).toList())
                .createdAt(alert.getCreatedAt())
                .resolvedBy(resolvedBy != null ? resolvedBy.getEmail() : null)
                .resolvedAt(alert.getResolvedAt())
                .build();
    }

    private DocumentResponse mapDocument(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .filename(document.getFilename())
                .fileType(document.getFileType())
                .documentType(document.getDocumentType())
                .processingStatus(document.getProcessingStatus())
                .fileSizeBytes(document.getFileSizeBytes())
                .uploadedBy(document.getUploadedBy() != null ? document.getUploadedBy().getEmail() : null)
                .uploadedAt(document.getCreatedAt())
                .build();
    }

    private boolean requiresComment(String status) {
        return "resolved".equalsIgnoreCase(status)
                || "dismissed".equalsIgnoreCase(status)
                || "escalated".equalsIgnoreCase(status);
    }

    private boolean isTerminalStatus(String status) {
        return "resolved".equalsIgnoreCase(status) || "dismissed".equalsIgnoreCase(status);
    }
}
