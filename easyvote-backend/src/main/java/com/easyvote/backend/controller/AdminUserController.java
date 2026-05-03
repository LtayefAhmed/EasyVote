package com.easyvote.backend.controller;

import com.easyvote.backend.dto.common.ApiResponse;
import com.easyvote.backend.dto.auth.UserSummary;
import com.easyvote.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {
  
  private final UserRepository userRepository;
  
  @GetMapping
  public ResponseEntity<ApiResponse<List<UserSummary>>> getAllUsers() {
    List<UserSummary> users = userRepository.findAll().stream()
      .map(u -> UserSummary.builder()
        .id(u.getId())
        .email(u.getEmail())
        .fullName(u.getFullName())
        .role(u.getRole().name())
        .isVerified(u.isVerified())
        .build())
      .toList();
    return ResponseEntity.ok(ApiResponse.success(users));
  }
}
