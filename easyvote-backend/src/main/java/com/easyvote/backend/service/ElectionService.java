package com.easyvote.backend.service;

import com.easyvote.backend.dto.election.*;
import com.easyvote.backend.entity.Election;
import com.easyvote.backend.entity.enums.ElectionStatus;
import com.easyvote.backend.exception.BusinessException;
import com.easyvote.backend.exception.ResourceNotFoundException;
import com.easyvote.backend.repository.CandidateRepository;
import com.easyvote.backend.repository.ElectionRepository;
import com.easyvote.backend.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ElectionService {

    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final VoteRepository voteRepository;
    private final NotificationService notificationService;

    // ── 1. Créer une élection (ADMIN) ──────────────────────────
    public ElectionResponse createElection(CreateElectionRequest request) {
        // Validation des dates
        validateDates(request.getCampaignStart(), request.getCampaignEnd(),
                request.getVoteStart(), request.getVoteEnd());

        Election election = Election.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .campaignStart(request.getCampaignStart())
                .campaignEnd(request.getCampaignEnd())
                .voteStart(request.getVoteStart())
                .voteEnd(request.getVoteEnd())
                .status(ElectionStatus.DRAFT)
                .build();

        Election saved = electionRepository.save(election);
        log.info("Élection créée : {} (ID: {})", saved.getTitle(), saved.getId());
        return mapToResponse(saved);
    }

    // ── 2. Modifier une élection (ADMIN) ───────────────────────
    public ElectionResponse updateElection(Long id, UpdateElectionRequest request) {
        Election election = findElectionOrThrow(id);

        if (request.getTitle() != null) {
            election.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            election.setDescription(request.getDescription());
        }
        if (request.getCampaignStart() != null) {
            election.setCampaignStart(request.getCampaignStart());
        }
        if (request.getCampaignEnd() != null) {
            election.setCampaignEnd(request.getCampaignEnd());
        }
        if (request.getVoteStart() != null) {
            election.setVoteStart(request.getVoteStart());
        }
        if (request.getVoteEnd() != null) {
            election.setVoteEnd(request.getVoteEnd());
        }
        if (request.getStatus() != null) {
            election.setStatus(request.getStatus());
        }

        // Re-valider les dates après modification
        validateDates(election.getCampaignStart(), election.getCampaignEnd(),
                election.getVoteStart(), election.getVoteEnd());

        Election saved = electionRepository.save(election);
        log.info("Élection modifiée : {} (ID: {})", saved.getTitle(), saved.getId());
        return mapToResponse(saved);
    }

    // ── 3. Supprimer une élection (ADMIN, DRAFT uniquement) ────
    public void deleteElection(Long id) {
        Election election = findElectionOrThrow(id);

        if (election.getStatus() != ElectionStatus.DRAFT) {
            throw new BusinessException("Impossible de supprimer une élection lancée");
        }

        electionRepository.delete(election);
        log.info("Élection supprimée : {} (ID: {})", election.getTitle(), id);
    }

    // ── 4. Lister toutes les élections ─────────────────────────
    @Transactional(readOnly = true)
    public List<ElectionResponse> getAllElections() {
        return electionRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt() != null && a.getCreatedAt() != null
                        ? b.getCreatedAt().compareTo(a.getCreatedAt()) : 0)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── 5. Lister les élections actives (campagne + vote) ──────
    @Transactional(readOnly = true)
    public List<ElectionSummary> getActiveElections() {
        List<Election> active = new ArrayList<>();
        active.addAll(electionRepository.findByStatusOrderByCreatedAtDesc(ElectionStatus.CAMPAIGN_ACTIVE));
        active.addAll(electionRepository.findByStatusOrderByCreatedAtDesc(ElectionStatus.VOTE_ACTIVE));
        return active.stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());
    }

    // ── 6. Détail d'une élection ───────────────────────────────
    @Transactional(readOnly = true)
    public ElectionResponse getElectionById(Long id) {
        return mapToResponse(findElectionOrThrow(id));
    }

    // ── 7. Transition manuelle de statut (ADMIN) ───────────────
    public void updateElectionStatus(Long id, ElectionStatus newStatus) {
        Election election = findElectionOrThrow(id);
        ElectionStatus current = election.getStatus();

        boolean valid = (current == ElectionStatus.DRAFT && newStatus == ElectionStatus.CAMPAIGN_ACTIVE)
                || (current == ElectionStatus.CAMPAIGN_ACTIVE && newStatus == ElectionStatus.VOTE_ACTIVE)
                || (current == ElectionStatus.VOTE_ACTIVE && newStatus == ElectionStatus.CLOSED);

        if (!valid) {
            throw new BusinessException(
                    String.format("Transition de statut invalide : %s → %s", current, newStatus));
        }

        election.setStatus(newStatus);
        electionRepository.save(election);
        log.info("Statut élection {} : {} → {}", id, current, newStatus);
        
        if (newStatus == ElectionStatus.CAMPAIGN_ACTIVE) {
            notificationService.notifyAll(
                com.easyvote.backend.entity.enums.NotificationType.CAMPAIGN_STARTED, 
                "Nouvelle campagne ouverte", 
                "La campagne pour '" + election.getTitle() + "' vient d'ouvrir !", 
                "/elections/" + election.getId()
            );
        } else if (newStatus == ElectionStatus.VOTE_ACTIVE) {
            notificationService.notifyAll(
                com.easyvote.backend.entity.enums.NotificationType.VOTE_STARTED, 
                "Le vote est ouvert ! 🗳️", 
                "Votez maintenant pour '" + election.getTitle() + "'", 
                "/elections/" + election.getId() + "/vote"
            );
        } else if (newStatus == ElectionStatus.CLOSED) {
            notificationService.notifyAll(
                com.easyvote.backend.entity.enums.NotificationType.RESULTS_PUBLISHED, 
                "Résultats disponibles", 
                "Les résultats de '" + election.getTitle() + "' sont publiés.", 
                "/elections/" + election.getId() + "/results"
            );
        }
    }

    // ── 8. Auto-update des statuts (CRON toutes les minutes) ───
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoUpdateStatuses() {
        LocalDateTime now = LocalDateTime.now();
        int updated = 0;

        // DRAFT → CAMPAIGN_ACTIVE
        List<Election> drafts = electionRepository.findByStatus(ElectionStatus.DRAFT);
        for (Election e : drafts) {
            if (e.getCampaignStart() != null && !now.isBefore(e.getCampaignStart())) {
                e.setStatus(ElectionStatus.CAMPAIGN_ACTIVE);
                electionRepository.save(e);
                log.info("Auto-transition DRAFT → CAMPAIGN_ACTIVE : {} (ID: {})", e.getTitle(), e.getId());
                updated++;
            }
        }

        // CAMPAIGN_ACTIVE → VOTE_ACTIVE
        List<Election> campaigns = electionRepository.findByStatus(ElectionStatus.CAMPAIGN_ACTIVE);
        for (Election e : campaigns) {
            if (e.getVoteStart() != null && !now.isBefore(e.getVoteStart())) {
                e.setStatus(ElectionStatus.VOTE_ACTIVE);
                electionRepository.save(e);
                log.info("Auto-transition CAMPAIGN_ACTIVE → VOTE_ACTIVE : {} (ID: {})", e.getTitle(), e.getId());
                updated++;
            }
        }

        // VOTE_ACTIVE → CLOSED
        List<Election> votes = electionRepository.findByStatus(ElectionStatus.VOTE_ACTIVE);
        for (Election e : votes) {
            if (e.getVoteEnd() != null && !now.isBefore(e.getVoteEnd())) {
                e.setStatus(ElectionStatus.CLOSED);
                electionRepository.save(e);
                log.info("Auto-transition VOTE_ACTIVE → CLOSED : {} (ID: {})", e.getTitle(), e.getId());
                updated++;
            }
        }

        if (updated > 0) {
            log.info("Auto-update statuts : {} élection(s) mise(s) à jour", updated);
        }
    }

    // ══════════════════════════════════════════════════════════════
    // HELPERS PRIVÉS
    // ══════════════════════════════════════════════════════════════

    private Election findElectionOrThrow(Long id) {
        return electionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", id));
    }

    private void validateDates(LocalDateTime campaignStart, LocalDateTime campaignEnd,
                               LocalDateTime voteStart, LocalDateTime voteEnd) {
        if (campaignStart != null && campaignEnd != null && voteStart != null && voteEnd != null) {
            if (!campaignStart.isBefore(campaignEnd)) {
                throw new BusinessException("La date de début de campagne doit précéder la date de fin de campagne");
            }
            if (campaignEnd.isAfter(voteStart)) {
                throw new BusinessException("La campagne doit se terminer avant ou au moment du début du vote");
            }
            if (!voteStart.isBefore(voteEnd)) {
                throw new BusinessException("La date de début de vote doit précéder la date de fin de vote");
            }
        }
    }

    private ElectionResponse mapToResponse(Election election) {
        LocalDateTime now = LocalDateTime.now();
        int totalCandidates = (int) candidateRepository.countByElectionId(election.getId());
        int totalVotes = (int) voteRepository.countByElectionId(election.getId());

        boolean isCampaignActive = election.getCampaignStart() != null
                && election.getCampaignEnd() != null
                && !now.isBefore(election.getCampaignStart())
                && now.isBefore(election.getCampaignEnd());

        boolean isVoteActive = election.getVoteStart() != null
                && election.getVoteEnd() != null
                && !now.isBefore(election.getVoteStart())
                && now.isBefore(election.getVoteEnd());

        return ElectionResponse.builder()
                .id(election.getId())
                .title(election.getTitle())
                .description(election.getDescription())
                .campaignStart(election.getCampaignStart())
                .campaignEnd(election.getCampaignEnd())
                .voteStart(election.getVoteStart())
                .voteEnd(election.getVoteEnd())
                .status(election.getStatus())
                .totalCandidates(totalCandidates)
                .totalVotes(totalVotes)
                .isCampaignActive(isCampaignActive)
                .isVoteActive(isVoteActive)
                .createdAt(election.getCreatedAt())
                .build();
    }

    private ElectionSummary mapToSummary(Election election) {
        int totalCandidates = (int) candidateRepository.countByElectionId(election.getId());

        return ElectionSummary.builder()
                .id(election.getId())
                .title(election.getTitle())
                .status(election.getStatus())
                .voteStart(election.getVoteStart())
                .voteEnd(election.getVoteEnd())
                .totalCandidates(totalCandidates)
                .build();
    }
}
