package com.easyvote.backend.service;

import com.easyvote.backend.dto.engagement.LikeToggleResponse;
import com.easyvote.backend.entity.Candidate;
import com.easyvote.backend.entity.CandidateLike;
import com.easyvote.backend.entity.User;
import com.easyvote.backend.entity.enums.CandidateStatus;
import com.easyvote.backend.exception.BusinessException;
import com.easyvote.backend.exception.ResourceNotFoundException;
import com.easyvote.backend.repository.CandidateLikeRepository;
import com.easyvote.backend.repository.CandidateRepository;
import com.easyvote.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CandidateLikeService {

    private final CandidateLikeRepository candidateLikeRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ── Toggle like (ajouter / retirer) ────────────────────────
    public LikeToggleResponse toggleLike(Long userId, Long candidateId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));

        if (candidate.getStatus() != CandidateStatus.VALIDATED) {
            throw new BusinessException("Impossible de liker un candidat non validé");
        }

        Optional<CandidateLike> existing = candidateLikeRepository
                .findByCandidateIdAndUserId(candidateId, userId);

        boolean liked;
        if (existing.isPresent()) {
            // Unlike
            candidateLikeRepository.delete(existing.get());
            liked = false;
            log.info("User {} unliked candidate {}", userId, candidateId);
        } else {
            // Like
            CandidateLike like = CandidateLike.builder()
                    .candidate(candidate)
                    .user(user)
                    .build();
            candidateLikeRepository.save(like);
            liked = true;
            log.info("User {} liked candidate {}", userId, candidateId);

            // Send notification to candidate owner
            try {
                notificationService.notify(
                    candidate.getUser().getId(),
                    com.easyvote.backend.entity.enums.NotificationType.NEW_COMMENT,
                    "Nouveau like ❤️",
                    user.getFullName() + " a aimé votre programme.",
                    "/my-campaign"
                );
            } catch (Exception e) {
                log.warn("Failed to send like notification", e);
            }
        }

        long totalLikes = candidateLikeRepository.countByCandidateId(candidateId);
        return LikeToggleResponse.builder()
                .liked(liked)
                .totalLikes(totalLikes)
                .build();
    }
}
