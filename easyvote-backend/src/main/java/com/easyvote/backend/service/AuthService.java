package com.easyvote.backend.service;

import com.easyvote.backend.dto.auth.*;
import com.easyvote.backend.entity.User;
import com.easyvote.backend.entity.enums.Role;
import com.easyvote.backend.exception.BusinessException;
import com.easyvote.backend.exception.DuplicateResourceException;
import com.easyvote.backend.exception.ResourceNotFoundException;
import com.easyvote.backend.exception.UnauthorizedException;
import com.easyvote.backend.repository.UserRepository;
import com.easyvote.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;
    private final MailService mailService;

    @Value("${easyvote.jwt.expiration}")
    private long jwtExpiration;

    // ── Register ──────────────────────────────────────────────

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        // Check email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Check studentId uniqueness if provided
        if (request.getStudentId() != null && !request.getStudentId().isBlank()
                && userRepository.existsByStudentId(request.getStudentId())) {
            throw new DuplicateResourceException("User", "studentId", request.getStudentId());
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .studentId(request.getStudentId())
                .role(Role.STUDENT)
                .isVerified(false)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        // Generate and send OTP
        boolean otpSent = true;
        try {
            String otp = otpService.generateOtp(user);
            mailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);
        } catch (Exception e) {
            log.warn("Failed to send OTP email to {}: {}", user.getEmail(), e.getMessage());
            otpSent = false;
        }

        return RegisterResponse.builder()
                .message("Compte créé. Vérifiez votre email pour le code OTP.")
                .email(user.getEmail())
                .otpSent(otpSent)
                .build();
    }

    // ── Verify OTP ────────────────────────────────────────────

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (user.isVerified()) {
            throw new BusinessException("Ce compte est déjà vérifié");
        }

        if (!otpService.verifyOtp(user, request.getCode())) {
            throw new BusinessException("Code OTP invalide ou expiré");
        }

        // Mark user as verified
        user.setVerified(true);
        userRepository.save(user);
        log.info("User {} verified via OTP", user.getEmail());

        // Send welcome email (non-blocking)
        try {
            mailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
        } catch (Exception e) {
            log.warn("Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }

        return buildAuthResponse(user);
    }

    // ── Login ─────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Email ou mot de passe incorrect");
        } catch (DisabledException e) {
            throw new UnauthorizedException("Compte non vérifié. Vérifiez votre email pour le code OTP.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        log.info("User {} logged in successfully", user.getEmail());
        return buildAuthResponse(user);
    }

    // ── Resend OTP ────────────────────────────────────────────

    @Transactional
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (user.isVerified()) {
            throw new BusinessException("Ce compte est déjà vérifié");
        }

        String otp = otpService.generateOtp(user);
        mailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);
        log.info("OTP resent to {}", user.getEmail());
    }

    // ── Refresh Token ─────────────────────────────────────────

    public AuthResponse refreshToken(String refreshToken) {
        String email;
        try {
            email = jwtUtil.extractEmail(refreshToken);
        } catch (Exception e) {
            throw new UnauthorizedException("Refresh token invalide");
        }

        if (jwtUtil.isTokenExpired(refreshToken)) {
            throw new UnauthorizedException("Refresh token expiré");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        log.info("Token refreshed for user {}", user.getEmail());
        return buildAuthResponse(user);
    }

    // ── Get Current User ──────────────────────────────────────

    public UserSummary getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return mapToUserSummary(user);
    }

    // ── Private Helpers ───────────────────────────────────────

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        UserSummary summary = mapToUserSummary(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration)
                .user(summary)
                .build();
    }

    private UserSummary mapToUserSummary(User user) {
        return UserSummary.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .isVerified(user.isVerified())
                .profilePicture(user.getProfilePicture())
                .build();
    }
}
