package com.fintech.simdocfinder.model.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Integer id;
    private String email;
    private String fullName;
    private String role;
    private String department;
    private Boolean active;
    private Boolean onboardingCompleted;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
