package com.fintech.simdocfinder.controller;

import com.fintech.simdocfinder.model.dto.UserResponse;
import com.fintech.simdocfinder.model.entity.User;
import com.fintech.simdocfinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getUsers() {
        List<UserResponse> users = userRepository.findAll(Sort.by(Sort.Direction.ASC, "fullName")).stream()
                .filter(user -> user.getDeletedAt() == null)
                .map(this::mapToResponse)
                .toList();
        return ResponseEntity.ok(users);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole() != null ? user.getRole().getName() : null)
                .department(user.getDepartment())
                .active(user.getIsActive())
                .onboardingCompleted(user.getOnboardingCompleted())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
