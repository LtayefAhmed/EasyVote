package com.easyvote.backend.service;

import com.easyvote.backend.dto.vote.CastVoteRequest;
import com.easyvote.backend.dto.vote.VoteResponse;
import com.easyvote.backend.dto.vote.VoteStatusResponse;
import com.easyvote.backend.entity.Candidate;
import com.easyvote.backend.entity.Election;
import com.easyvote.backend.entity.User;
import com.easyvote.backend.entity.Vote;
import com.easyvote.backend.entity.VoteToken;
import com.easyvote.backend.entity.enums.CandidateStatus;
import com.easyvote.backend.entity.enums.ElectionStatus;
import com.easyvote.backend.exception.BusinessException;
import com.easyvote.backend.exception.ForbiddenException;
import com.easyvote.backend.exception.ResourceNotFoundException;
import com.easyvote.backend.repository.CandidateRepository;
import com.easyvote.backend.repository.ElectionRepository;
import com.easyvote.backend.repository.UserRepository;
import com.easyvote.backend.repository.VoteRepository;
import com.easyvote.backend.repository.VoteTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VoteService {

    private final VoteRepository voteRepository;
    private final VoteTokenRepository voteTokenRepository;
    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final VoteTokenService voteTokenService;

    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    // ── 1. Caster un vote (Coeur du module) ────────────────────
    public VoteResponse castVote(Long userId, Long electionId, CastVoteRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!user.isVerified()) {
            throw new ForbiddenException("Votre compte n'est pas vérifié");
        }

        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", electionId));

        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", request.getCandidateId()));

        if (!candidate.getElection().getId().equals(electionId)) {
            throw new BusinessException("Ce candidat ne participe pas à cette élection");
        }

        if (candidate.getStatus() != CandidateStatus.VALIDATED) {
            throw new BusinessException("Ce candidat n'est pas validé");
        }

        if (election.getStatus() != ElectionStatus.VOTE_ACTIVE) {
            throw new BusinessException("Le vote n'est pas ouvert pour cette élection");
        }

        // On respecte le statut explicite de l'élection (modifié par l'admin)
        // Le vote n'est interdit que si la date de fin est dépassée
        LocalDateTime now = LocalDateTime.now();
        if (election.getVoteEnd() != null && now.isAfter(election.getVoteEnd())) {
            throw new BusinessException("La période de vote est terminée");
        }

        // Récupérer le token de vote (générer à la volée s'il n'existe pas)
        Optional<VoteToken> optionalToken = voteTokenRepository.findByUserIdAndElectionId(userId, electionId);
        VoteToken token;
        
        if (optionalToken.isEmpty()) {
            log.info("Generating on-the-fly vote token for user {} on election {}", userId, electionId);
            String rawToken = voteTokenService.generateRawToken();
            String tokenHash = voteTokenService.hashToken(rawToken);
            token = VoteToken.builder()
                    .user(user)
                    .election(election)
                    .tokenHash(tokenHash)
                    .used(false)
                    .build();
            token = voteTokenRepository.save(token);
        } else {
            token = optionalToken.get();
        }

        if (token.isUsed()) {
            throw new BusinessException("Vous avez déjà voté pour cette élection");
        }

        // Marquer le token comme utilisé
        token.setUsed(true);
        token.setUsedAt(now);
        voteTokenRepository.save(token);

        // Enregistrer le vote anonyme
        Vote vote = Vote.builder()
                .election(election)
                .candidate(candidate)
                .tokenHash(token.getTokenHash())
                .votedAt(now)
                .build();
        voteRepository.save(vote);

        String confirmationCode = generateConfirmationCode();
        log.info("Vote cast anonymously for election {}, candidate {}", electionId, candidate.getId());

        return VoteResponse.builder()
                .message("Votre vote a été enregistré anonymement")
                .confirmationCode(confirmationCode)
                .votedAt(now)
                .build();
    }

    // ── 2. Statut du vote d'un utilisateur ─────────────────────
    @Transactional(readOnly = true)
    public VoteStatusResponse getVoteStatus(Long userId, Long electionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", electionId));

        boolean canVote = true;
        String message = "";
        boolean hasVoted = false;

        if (!user.isVerified()) {
            canVote = false;
            message = "Votre compte n'est pas vérifié";
        } else if (election.getStatus() != ElectionStatus.VOTE_ACTIVE) {
            canVote = false;
            message = "Le vote n'est pas ouvert";
        } else {
            hasVoted = voteTokenService.hasUserVoted(userId, electionId);
            if (hasVoted) {
                canVote = false;
                message = "Vous avez déjà voté";
            } else {
                LocalDateTime now = LocalDateTime.now();
                if (election.getVoteEnd() != null && now.isAfter(election.getVoteEnd())) {
                    canVote = false;
                    message = "Le vote est terminé";
                }
            }
        }

        return VoteStatusResponse.builder()
                .hasVoted(hasVoted)
                .canVote(canVote)
                .voteEndAt(election.getVoteEnd())
                .message(message)
                .build();
    }

    // ── Helper ─────────────────────────────────────────────────
    private String generateConfirmationCode() {
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) {
            sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
        }
        return sb.toString();
    }
}
