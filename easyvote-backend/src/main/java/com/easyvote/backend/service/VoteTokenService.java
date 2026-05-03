package com.easyvote.backend.service;

import com.easyvote.backend.entity.Election;
import com.easyvote.backend.entity.User;
import com.easyvote.backend.entity.VoteToken;
import com.easyvote.backend.exception.ResourceNotFoundException;
import com.easyvote.backend.repository.ElectionRepository;
import com.easyvote.backend.repository.UserRepository;
import com.easyvote.backend.repository.VoteTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VoteTokenService {

    private final VoteTokenRepository voteTokenRepository;
    private final UserRepository userRepository;
    private final ElectionRepository electionRepository;

    // ── 1. Générer les tokens pour tous les électeurs ──────────
    public void generateTokensForElection(Long electionId) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", electionId));

        if (voteTokenRepository.existsByElectionId(electionId)) {
            log.warn("Tokens already generated for election {}", electionId);
            return;
        }

        List<User> verifiedUsers = userRepository.findByIsVerifiedTrue();
        int generatedCount = 0;

        for (User user : verifiedUsers) {
            String rawToken = generateRawToken();
            String tokenHash = hashToken(rawToken);

            VoteToken token = VoteToken.builder()
                    .user(user)
                    .election(election)
                    .tokenHash(tokenHash)
                    .used(false)
                    .build();
            
            voteTokenRepository.save(token);
            generatedCount++;
        }

        log.info("Generated {} vote tokens for election {}", generatedCount, electionId);
    }

    // ── 2. Récupérer le token d'un user ────────────────────────
    public Optional<VoteToken> getTokenForUser(Long userId, Long electionId) {
        return voteTokenRepository.findByUserIdAndElectionId(userId, electionId);
    }

    // ── 3. Vérifier si l'user a déjà voté ──────────────────────
    public boolean hasUserVoted(Long userId, Long electionId) {
        return voteTokenRepository.findByUserIdAndElectionId(userId, electionId)
                .map(VoteToken::isUsed)
                .orElse(false);
    }

    // ── 4. Helper pour hasher dynamiquement un token ───────────
    public String hashToken(String rawToken) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erreur de hashage SHA-256 introuvable", e);
        }
    }

    // ── 5. Helper pour générer un raw token ────────────────────
    public String generateRawToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
