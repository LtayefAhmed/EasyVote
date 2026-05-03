package com.easyvote.backend.service;

import com.easyvote.backend.dto.candidate.*;
import com.easyvote.backend.entity.Candidate;
import com.easyvote.backend.entity.Election;
import com.easyvote.backend.entity.User;
import com.easyvote.backend.entity.enums.CandidateStatus;
import com.easyvote.backend.entity.enums.ElectionStatus;
import com.easyvote.backend.entity.enums.Role;
import com.easyvote.backend.exception.BusinessException;
import com.easyvote.backend.exception.DuplicateResourceException;
import com.easyvote.backend.exception.ForbiddenException;
import com.easyvote.backend.exception.ResourceNotFoundException;
import com.easyvote.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final ElectionRepository electionRepository;
    private final UserRepository userRepository;
    private final CandidateLikeRepository candidateLikeRepository;
    private final CommentRepository commentRepository;
    private final QuestionRepository questionRepository;
    private final NotificationService notificationService;

    // ── 1. Déposer sa candidature ──────────────────────────────
    public CandidateResponse applyToElection(Long userId, ApplyCandidateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Election election = electionRepository.findById(request.getElectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", request.getElectionId()));

        // Vérifier que l'élection accepte les candidatures
        if (election.getStatus() != ElectionStatus.DRAFT
                && election.getStatus() != ElectionStatus.CAMPAIGN_ACTIVE) {
            throw new BusinessException("Les inscriptions sont fermées pour cette élection");
        }

        // Vérifier qu'il n'est pas déjà candidat
        if (candidateRepository.existsByUserIdAndElectionId(userId, election.getId())) {
            throw new DuplicateResourceException("Candidate", "userId+electionId",
                    userId + "+" + election.getId());
        }

        Candidate candidate = Candidate.builder()
                .user(user)
                .election(election)
                .slogan(request.getSlogan())
                .program(request.getProgram())
                .photoUrl(request.getPhotoUrl())
                .status(CandidateStatus.PENDING)
                .build();

        Candidate saved = candidateRepository.save(candidate);

        // Upgrader le rôle STUDENT → CANDIDATE
        if (user.getRole() == Role.STUDENT) {
            user.setRole(Role.CANDIDATE);
            userRepository.save(user);
            log.info("Rôle utilisateur {} upgradé : STUDENT → CANDIDATE", user.getEmail());
        }

        log.info("Candidature déposée : {} pour l'élection {} (ID: {})",
                user.getFullName(), election.getTitle(), saved.getId());
        return mapToResponse(saved, userId);
    }

    // ── 2. Modifier sa propre candidature ──────────────────────
    public CandidateResponse updateMyCandidacy(Long userId, Long candidateId, UpdateCandidateRequest request) {
        Candidate candidate = findCandidateOrThrow(candidateId);

        // Vérifier ownership
        if (!candidate.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Vous ne pouvez modifier que votre propre candidature");
        }

        // Interdire modification pendant le vote si déjà validé
        if (candidate.getStatus() == CandidateStatus.VALIDATED
                && candidate.getElection().getStatus() == ElectionStatus.VOTE_ACTIVE) {
            throw new BusinessException("Modification impossible pendant la période de vote");
        }

        if (request.getSlogan() != null) {
            candidate.setSlogan(request.getSlogan());
        }
        if (request.getProgram() != null) {
            candidate.setProgram(request.getProgram());
        }
        if (request.getPhotoUrl() != null) {
            candidate.setPhotoUrl(request.getPhotoUrl());
        }

        Candidate saved = candidateRepository.save(candidate);
        log.info("Candidature modifiée : ID {}", candidateId);
        return mapToResponse(saved, userId);
    }

    // ── 3. Valider / Rejeter une candidature (ADMIN) ───────────
    public CandidateResponse validateCandidate(Long candidateId, ValidateCandidateRequest request) {
        Candidate candidate = findCandidateOrThrow(candidateId);

        if (candidate.getStatus() != CandidateStatus.PENDING) {
            throw new BusinessException("Cette candidature a déjà été traitée (statut actuel : "
                    + candidate.getStatus() + ")");
        }

        candidate.setStatus(request.getStatus());
        if (request.getStatus() == CandidateStatus.VALIDATED) {
            candidate.setValidatedAt(LocalDateTime.now());
        }

        Candidate saved = candidateRepository.save(candidate);
        log.info("Candidature {} : {} (ID: {})",
                request.getStatus() == CandidateStatus.VALIDATED ? "validée" : "rejetée",
                candidate.getUser().getFullName(), candidateId);

        if (request.getStatus() == CandidateStatus.VALIDATED) {
            notificationService.notify(
                candidate.getUser().getId(),
                com.easyvote.backend.entity.enums.NotificationType.CANDIDATE_VALIDATED,
                "Candidature validée ! 🎉",
                "Votre candidature pour " + candidate.getElection().getTitle() + " a été validée.",
                "/elections/" + candidate.getElection().getId()
            );
        }

        return mapToResponse(saved, null);
    }

    // ── 4. Candidats validés d'une élection ────────────────────
    @Transactional(readOnly = true)
    public List<CandidateResponse> getCandidatesByElection(Long electionId, Long currentUserId) {
        return candidateRepository.findByElectionIdAndStatus(electionId, CandidateStatus.VALIDATED)
                .stream()
                .map(c -> mapToResponse(c, currentUserId))
                .collect(Collectors.toList());
    }

    // ── 5. Candidatures en attente (ADMIN) ─────────────────────
    @Transactional(readOnly = true)
    public List<CandidateResponse> getPendingCandidates() {
        return candidateRepository.findByStatus(CandidateStatus.PENDING)
                .stream()
                .map(c -> mapToResponse(c, null))
                .collect(Collectors.toList());
    }

    // ── 6. Détail d'un candidat ────────────────────────────────
    @Transactional(readOnly = true)
    public CandidateResponse getCandidateById(Long candidateId, Long currentUserId) {
        Candidate candidate = findCandidateOrThrow(candidateId);
        return mapToResponse(candidate, currentUserId);
    }

    // ── 7. Ma candidature pour une élection donnée ─────────────
    @Transactional(readOnly = true)
    public CandidateResponse getMyCandidacy(Long userId, Long electionId) {
        Candidate candidate = candidateRepository.findByUserIdAndElectionId(userId, electionId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "userId+electionId",
                        userId + "+" + electionId));
        return mapToResponse(candidate, userId);
    }

    // ── 8. Mettre à jour la photo ──────────────────────────────
    public void updatePhoto(Long userId, Long candidateId, String photoUrl) {
        Candidate candidate = findCandidateOrThrow(candidateId);

        if (!candidate.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Vous ne pouvez modifier que votre propre candidature");
        }

        candidate.setPhotoUrl(photoUrl);
        candidateRepository.save(candidate);
        log.info("Photo candidat mise à jour : ID {}", candidateId);
    }

    // ══════════════════════════════════════════════════════════════
    // HELPERS PRIVÉS
    // ══════════════════════════════════════════════════════════════

    private Candidate findCandidateOrThrow(Long candidateId) {
        return candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));
    }

    private CandidateResponse mapToResponse(Candidate candidate, Long currentUserId) {
        long likesCount = candidateLikeRepository.countByCandidateId(candidate.getId());
        long commentsCount = commentRepository.countByCandidateId(candidate.getId());
        long questionsCount = questionRepository.countByCandidateIdAndAnswerIsNull(candidate.getId());

        boolean likedByMe = false;
        if (currentUserId != null) {
            likedByMe = candidateLikeRepository.existsByCandidateIdAndUserId(
                    candidate.getId(), currentUserId);
        }

        return CandidateResponse.builder()
                .id(candidate.getId())
                .userId(candidate.getUser().getId())
                .userFullName(candidate.getUser().getFullName())
                .userEmail(candidate.getUser().getEmail())
                .electionId(candidate.getElection().getId())
                .electionTitle(candidate.getElection().getTitle())
                .slogan(candidate.getSlogan())
                .program(candidate.getProgram())
                .photoUrl(candidate.getPhotoUrl())
                .status(candidate.getStatus())
                .likesCount(likesCount)
                .commentsCount(commentsCount)
                .questionsCount(questionsCount)
                .likedByMe(likedByMe)
                .createdAt(candidate.getCreatedAt())
                .build();
    }
}
