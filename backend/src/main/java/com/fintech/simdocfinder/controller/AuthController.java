package com.fintech.simdocfinder.controller;

import com.fintech.simdocfinder.model.dto.LoginRequest;
import com.fintech.simdocfinder.model.dto.LoginResponse;
import com.fintech.simdocfinder.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.authenticate(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Stateless JWT logout is usually handled on client side by deleting token.
        // We can add a token blacklist later if required.
        return ResponseEntity.ok().build();
    }
}
