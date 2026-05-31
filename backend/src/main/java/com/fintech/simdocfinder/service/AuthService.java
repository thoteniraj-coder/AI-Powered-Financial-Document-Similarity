package com.fintech.simdocfinder.service;

import com.fintech.simdocfinder.model.dto.LoginRequest;
import com.fintech.simdocfinder.model.dto.LoginResponse;
import com.fintech.simdocfinder.model.entity.User;
import com.fintech.simdocfinder.repository.UserRepository;
import com.fintech.simdocfinder.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public LoginResponse authenticate(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = tokenProvider.generateToken(user);

        return LoginResponse.builder()
                .token(token)
                .expiresIn(tokenProvider.getExpirationMs())
                .role(user.getRole().getName())
                .fullName(user.getFullName())
                .build();
    }
}
