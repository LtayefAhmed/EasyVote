package com.easyvote.backend.controller;

import com.easyvote.backend.dto.common.ApiResponse;
import com.easyvote.backend.dto.vote.CastVoteRequest;
import com.easyvote.backend.dto.vote.ElectionResultsResponse;
import com.easyvote.backend.dto.vote.ElectionStatsResponse;
import com.easyvote.backend.dto.vote.PublicStatsResponse;
import com.easyvote.backend.dto.vote.VoteResponse;
import com.easyvote.backend.dto.vote.VoteStatusResponse;
import com.easyvote.backend.security.UserPrincipal;
import com.easyvote.backend.service.VoteAnalyticsService;
import com.easyvote.backend.service.VoteService;
import com.easyvote.backend.service.VoteTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;
    private final VoteAnalyticsService voteAnalyticsService;
    private final VoteTokenService voteTokenService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal up) return up.getUserId();
        return null;
    }

    // ══════════════════════════════════════════════════════════════
    // API ÉTUDIANT / VOTE
    // ══════════════════════════════════════════════════════════════

    @PostMapping("/api/elections/{electionId}/vote")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<VoteResponse>> castVote(
            @PathVariable Long electionId,
            @Valid @RequestBody CastVoteRequest request) {
        Long userId = getCurrentUserId();
        log.info("Casting vote for election {} by user {}", electionId, userId);
        VoteResponse response = voteService.castVote(userId, electionId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vote enregistré avec succès", response));
    }

    @GetMapping("/api/elections/{electionId}/vote/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<VoteStatusResponse>> getVoteStatus(
            @PathVariable Long electionId) {
        Long userId = getCurrentUserId();
        VoteStatusResponse response = voteService.getVoteStatus(userId, electionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ══════════════════════════════════════════════════════════════
    // API RÉSULTATS (PUBLIC / AUTHENTIFIÉ)
    // ══════════════════════════════════════════════════════════════

    @GetMapping("/api/elections/{electionId}/results")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ElectionResultsResponse>> getResults(
            @PathVariable Long electionId) {
        ElectionResultsResponse response = voteAnalyticsService.getResults(electionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/elections/{electionId}/results/pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> exportResultsToPdf(
            @PathVariable Long electionId) {
        log.info("Exporting results to PDF for election {}", electionId);
        byte[] pdfBytes = voteAnalyticsService.exportResultsToPdf(electionId);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resultats-election-" + electionId + ".pdf\"")
                .body(pdfBytes);
    }

    @GetMapping("/api/elections/{electionId}/stats/public")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PublicStatsResponse>> getPublicStats(
            @PathVariable Long electionId) {
        PublicStatsResponse response = voteAnalyticsService.getPublicStats(electionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ══════════════════════════════════════════════════════════════
    // API ADMIN / STATS
    // ══════════════════════════════════════════════════════════════

    @PostMapping("/api/admin/elections/{electionId}/generate-tokens")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> generateTokens(
            @PathVariable Long electionId) {
        log.info("Admin generating tokens for election {}", electionId);
        voteTokenService.generateTokensForElection(electionId);
        return ResponseEntity.ok(ApiResponse.success("Tokens générés pour tous les électeurs", null));
    }

    @GetMapping("/api/admin/elections/{electionId}/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ElectionStatsResponse>> getLiveStats(
            @PathVariable Long electionId) {
        ElectionStatsResponse response = voteAnalyticsService.getLiveStats(electionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
