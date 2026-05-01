package com.easyvote.backend.service;

import com.easyvote.backend.entity.OtpCode;
import com.easyvote.backend.entity.User;
import com.easyvote.backend.repository.OtpCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpCodeRepository otpCodeRepository;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_MINUTES = 10;

    private final SecureRandom secureRandom = new SecureRandom();

    // ── Generate OTP ──────────────────────────────────────────

    @Transactional
    public String generateOtp(User user) {
        // Delete any previous OTP codes for this user
        otpCodeRepository.deleteByUserId(user.getId());

        // Generate a cryptographically secure 6-digit code
        String code = String.format("%06d", secureRandom.nextInt(1_000_000));

        OtpCode otpCode = OtpCode.builder()
                .user(user)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES))
                .used(false)
                .build();

        otpCodeRepository.save(otpCode);
        log.debug("OTP generated for user {}: expires at {}", user.getEmail(), otpCode.getExpiresAt());

        return code;
    }

    // ── Verify OTP ────────────────────────────────────────────

    @Transactional
    public boolean verifyOtp(User user, String code) {
        return otpCodeRepository
                .findFirstByUserIdAndUsedFalseOrderByCreatedAtDesc(user.getId())
                .filter(otp -> !otp.isUsed())
                .filter(otp -> otp.getExpiresAt().isAfter(LocalDateTime.now()))
                .filter(otp -> otp.getCode().equals(code))
                .map(otp -> {
                    otp.setUsed(true);
                    otpCodeRepository.save(otp);
                    log.info("OTP verified successfully for user {}", user.getEmail());
                    return true;
                })
                .orElseGet(() -> {
                    log.warn("OTP verification failed for user {}", user.getEmail());
                    return false;
                });
    }

    // ── Scheduled Cleanup ─────────────────────────────────────

    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional
    public void cleanupExpiredOtps() {
        otpCodeRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        log.info("Expired OTP codes cleanup completed");
    }
}
