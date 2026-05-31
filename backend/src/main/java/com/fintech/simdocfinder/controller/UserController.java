package com.fintech.simdocfinder.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    public ResponseEntity<List<Object>> getUsers() {
        return ResponseEntity.ok(List.of()); // Stub for now
    }
}
