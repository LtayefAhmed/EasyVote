package com.easyvote.backend.service;

import com.easyvote.backend.dto.engagement.AnnouncementResponse;
import com.easyvote.backend.dto.engagement.CreateAnnouncementRequest;
import com.easyvote.backend.dto.engagement.UpdateAnnouncementRequest;
import com.easyvote.backend.entity.Announcement;
import com.easyvote.backend.entity.Candidate;
import com.easyvote.backend.entity.enums.CandidateStatus;
import com.easyvote.backend.exception.BusinessException;
import com.easyvote.backend.exception.ForbiddenException;
import com.easyvote.backend.exception.ResourceNotFoundException;
import com.easyvote.backend.repository.AnnouncementRepository;
import com.easyvote.backend.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final CandidateRepository candidateRepository;

    // ── 1. Créer une annonce ───────────────────────────────────
    public AnnouncementResponse createAnnouncement(Long userId, Long candidateId,
                                                    CreateAnnouncementRequest request) {
        Candidate candidate = findCandidateAndCheckOwnership(candidateId, userId);

        if (candidate.getStatus() != CandidateStatus.VALIDATED) {
            throw new BusinessException("Candidat non validé, impossible de publier une annonce");
        }

        Announcement announcement = Announcement.builder()
                .candidate(candidate)
                .title(request.getTitle())
                .content(request.getContent())
                .build();

        Announcement saved = announcementRepository.save(announcement);
        log.info("Announcement created by candidate {} : {}", candidateId, request.getTitle());
        return mapToResponse(saved);
    }

    // ── 2. Modifier une annonce ────────────────────────────────
    public AnnouncementResponse updateAnnouncement(Long userId, Long announcementId,
                                                    UpdateAnnouncementRequest request) {
        Announcement announcement = findAnnouncementOrThrow(announcementId);
        checkOwnership(announcement, userId);

        if (request.getTitle() != null) {
            announcement.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            announcement.setContent(request.getContent());
        }

        Announcement saved = announcementRepository.save(announcement);
        log.info("Announcement {} updated", announcementId);
        return mapToResponse(saved);
    }

    // ── 3. Supprimer une annonce ───────────────────────────────
    public void deleteAnnouncement(Long userId, Long announcementId) {
        Announcement announcement = findAnnouncementOrThrow(announcementId);
        checkOwnership(announcement, userId);

        announcementRepository.delete(announcement);
        log.info("Announcement {} deleted by user {}", announcementId, userId);
    }

    // ── 4. Lister les annonces d'un candidat ───────────────────
    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAnnouncementsByCandidate(Long candidateId) {
        return announcementRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════

    private Candidate findCandidateAndCheckOwnership(Long candidateId, Long userId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));
        if (!candidate.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Vous ne pouvez gérer que les annonces de votre propre candidature");
        }
        return candidate;
    }

    private Announcement findAnnouncementOrThrow(Long announcementId) {
        return announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", announcementId));
    }

    private void checkOwnership(Announcement announcement, Long userId) {
        if (!announcement.getCandidate().getUser().getId().equals(userId)) {
            throw new ForbiddenException("Vous ne pouvez gérer que vos propres annonces");
        }
    }

    private AnnouncementResponse mapToResponse(Announcement a) {
        return AnnouncementResponse.builder()
                .id(a.getId())
                .candidateId(a.getCandidate().getId())
                .candidateName(a.getCandidate().getUser().getFullName())
                .title(a.getTitle())
                .content(a.getContent())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
