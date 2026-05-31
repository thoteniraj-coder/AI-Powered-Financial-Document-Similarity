package com.fintech.simdocfinder.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @GetMapping
    public ResponseEntity<List<Object>> getAlerts() {
        return ResponseEntity.ok(List.of()); // Stub for now
    }
}
