package com.fintech.simdocfinder.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    @GetMapping
    public ResponseEntity<List<Object>> getAuditLogs() {
        return ResponseEntity.ok(List.of()); // Stub for now
    }
}
