package com.fintech.simdocfinder.controller;

import com.fintech.simdocfinder.model.dto.HealthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;

    @GetMapping
    public ResponseEntity<HealthResponse> healthCheck() {
        Map<String, String> components = new HashMap<>();
        String overallStatus = "UP";

        // Check DB
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(1000)) {
                components.put("postgresql", "UP");
            } else {
                components.put("postgresql", "DOWN");
                overallStatus = "DOWN";
            }
        } catch (Exception e) {
            components.put("postgresql", "DOWN: " + e.getMessage());
            overallStatus = "DOWN";
        }

        // Qdrant placeholder
        components.put("qdrant", "UP");

        // Embedding placeholder
        components.put("embedding-service", "UP");

        HealthResponse response = HealthResponse.builder()
                .status(overallStatus)
                .components(components)
                .build();

        if ("UP".equals(overallStatus)) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(503).body(response);
        }
    }
}
