package com.easyvote.backend.controller;

import com.easyvote.backend.dto.candidate.*;
import com.easyvote.backend.dto.common.ApiResponse;
import com.easyvote.backend.entity.enums.CandidateStatus;
import com.easyvote.backend.exception.BusinessException;
import com.easyvote.backend.security.UserPrincipal;
import com.easyvote.backend.service.CandidateService;
import com.easyvote.backend.service.PhotoUploadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;
    private final PhotoUploadService photoUploadService;

    // ── Helper : récupérer userId du contexte de sécurité ────
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal up) return up.getUserId();
        return null;
    }

    // ── GET /api/candidates/by-election/{electionId} ─────────
    @GetMapping("/by-election/{electionId}")
    public ResponseEntity<ApiResponse<List<CandidateResponse>>> getCandidatesByElection(
            @PathVariable Long electionId) {
        log.debug("GET /api/candidates/by-election/{}", electionId);
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(
                ApiResponse.success(candidateService.getCandidatesByElection(electionId, userId)));
    }

    // ── GET /api/candidates/{id} ─────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CandidateResponse>> getCandidateById(
            @PathVariable Long id) {
        log.debug("GET /api/candidates/{}", id);
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(
                ApiResponse.success(candidateService.getCandidateById(id, userId)));
    }

    // ── POST /api/candidates/apply — Déposer candidature ─────
    @PostMapping("/apply")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CandidateResponse>> applyToElection(
            @Valid @RequestBody ApplyCandidateRequest request) {
        Long userId = getCurrentUserId();
        log.info("POST /api/candidates/apply — userId: {}, electionId: {}", userId, request.getElectionId());
        CandidateResponse response = candidateService.applyToElection(userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Candidature déposée. En attente de validation.", response));
    }

    // ── PUT /api/candidates/{id} — Modifier sa candidature ───
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CandidateResponse>> updateMyCandidacy(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCandidateRequest request) {
        Long userId = getCurrentUserId();
        log.info("PUT /api/candidates/{} — userId: {}", id, userId);
        CandidateResponse response = candidateService.updateMyCandidacy(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Candidature mise à jour", response));
    }

    // ── GET /api/candidates/my/{electionId} — Ma candidature ─
    @GetMapping("/my/{electionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CandidateResponse>> getMyCandidacy(
            @PathVariable Long electionId) {
        Long userId = getCurrentUserId();
        log.debug("GET /api/candidates/my/{} — userId: {}", electionId, userId);
        return ResponseEntity.ok(
                ApiResponse.success(candidateService.getMyCandidacy(userId, electionId)));
    }

    // ── POST /api/candidates/{id}/photo — Upload photo ───────
    @PostMapping("/{id}/photo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        Long userId = getCurrentUserId();
        log.info("POST /api/candidates/{}/photo — userId: {}", id, userId);

        // Validation du fichier
        if (file.isEmpty()) {
            throw new BusinessException("Fichier vide");
        }
        if (file.getSize() > 5_000_000) {
            throw new BusinessException("Fichier trop volumineux (max 5MB)");
        }
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new BusinessException("Format non supporté. Seules les images sont acceptées.");
        }

        String photoUrl = photoUploadService.savePhoto(file);
        candidateService.updatePhoto(userId, id, photoUrl);

        return ResponseEntity.ok(
                ApiResponse.success("Photo mise à jour", Map.of("photoUrl", photoUrl)));
    }

    // ── GET /api/candidates/admin/pending — Candidatures en attente (ADMIN)
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CandidateResponse>>> getPendingCandidates() {
        log.debug("GET /api/candidates/admin/pending");
        return ResponseEntity.ok(
                ApiResponse.success(candidateService.getPendingCandidates()));
    }

    // ── POST /api/candidates/{id}/validate — Valider/Rejeter (ADMIN)
    @PostMapping("/{id}/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CandidateResponse>> validateCandidate(
            @PathVariable Long id,
            @Valid @RequestBody ValidateCandidateRequest request) {
        log.info("POST /api/candidates/{}/validate → {}", id, request.getStatus());
        CandidateResponse response = candidateService.validateCandidate(id, request);
        String msg = request.getStatus() == CandidateStatus.VALIDATED
                ? "Candidature validée"
                : "Candidature rejetée";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }
}
