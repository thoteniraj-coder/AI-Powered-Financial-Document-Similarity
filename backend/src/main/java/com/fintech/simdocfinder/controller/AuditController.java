package com.fintech.simdocfinder.controller;

import com.fintech.simdocfinder.model.entity.AuditLog;
import com.fintech.simdocfinder.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

import com.fintech.simdocfinder.service.AuditService;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {
    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(auditService.getAuditLogs(userId, action, startDate, endDate, pageRequest));
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportAuditLogs(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        List<AuditLog> logs = auditService.getAuditLogsForExport(userId, action, startDate, endDate);
        StringBuilder csv = new StringBuilder("timestamp,user_id,action,entity_type,entity_id,ip_address,payload\n");
        for (AuditLog log : logs) {
            csv.append(csv(log.getCreatedAt()))
                    .append(',')
                    .append(csv(log.getActorUserId()))
                    .append(',')
                    .append(csv(log.getAction()))
                    .append(',')
                    .append(csv(log.getEntityType()))
                    .append(',')
                    .append(csv(log.getEntityId()))
                    .append(',')
                    .append(csv(log.getIpAddress()))
                    .append(',')
                    .append(csv(log.getPayload()))
                    .append('\n');
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"audit-logs.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.toString());
    }

    private String csv(Object value) {
        if (value == null) {
            return "";
        }
        return "\"" + String.valueOf(value).replace("\"", "\"\"") + "\"";
    }
}
