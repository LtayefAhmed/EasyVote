package com.easyvote.backend.repository;

import com.easyvote.backend.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

    Optional<OtpCode> findFirstByUserIdAndUsedFalseOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Transactional
    void deleteByExpiresAtBefore(LocalDateTime now);

    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}
