package com.easyvote.backend.controller;

import com.easyvote.backend.dto.auth.*;
import com.easyvote.backend.dto.common.ApiResponse;
import com.easyvote.backend.exception.UnauthorizedException;
import com.easyvote.backend.security.UserPrincipal;
import com.easyvote.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ── POST /api/auth/register ───────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        log.info("Registration request for email: {}", request.getEmail());
        RegisterResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Compte créé avec succès", response));
    }

    // ── POST /api/auth/verify-otp ─────────────────────────────

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request) {
        log.info("OTP verification request for email: {}", request.getEmail());
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Email vérifié. Connexion réussie.", response));
    }

    // ── POST /api/auth/login ──────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        log.info("Login request for email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Connexion réussie", response));
    }

    // ── POST /api/auth/resend-otp ─────────────────────────────

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(
            @Valid @RequestBody ResendOtpRequest request) {
        log.info("Resend OTP request for email: {}", request.getEmail());
        authService.resendOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Nouveau code OTP envoyé", null));
    }

    // ── POST /api/auth/refresh ────────────────────────────────

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        log.debug("Token refresh request");
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token rafraîchi", response));
    }

    // ── GET /api/auth/me (PROTECTED — requires JWT) ───────────

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummary>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("Authentification requise");
        }
        log.debug("Get current user request for userId: {}", principal.getUserId());
        UserSummary summary = authService.getCurrentUser(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
