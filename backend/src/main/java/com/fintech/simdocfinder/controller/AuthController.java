package com.fintech.simdocfinder.controller;

import com.fintech.simdocfinder.model.dto.LoginRequest;
import com.fintech.simdocfinder.model.dto.LoginResponse;
import com.fintech.simdocfinder.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import com.fintech.simdocfinder.security.TokenBlacklistService;
import com.fintech.simdocfinder.security.JwtTokenProvider;
import java.time.LocalDateTime;
import java.time.ZoneId;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.authenticate(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            java.util.Date expirationDate = jwtTokenProvider.getExpirationDateFromToken(token);
            LocalDateTime expiryTime = expirationDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
            tokenBlacklistService.blacklistToken(token, expiryTime);
        }
        return ResponseEntity.ok().build();
    }
}
