package com.easyvote.backend.controller;

import com.easyvote.backend.dto.common.ApiResponse;
import com.easyvote.backend.dto.election.*;
import com.easyvote.backend.entity.enums.ElectionStatus;
import com.easyvote.backend.service.ElectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/elections")
@RequiredArgsConstructor
public class ElectionController {

    private final ElectionService electionService;

    // ── GET /api/elections — Toutes les élections ─────────────
    @GetMapping
    public ResponseEntity<ApiResponse<List<ElectionResponse>>> getAllElections() {
        log.debug("GET /api/elections");
        return ResponseEntity.ok(ApiResponse.success(electionService.getAllElections()));
    }

    // ── GET /api/elections/active — Élections actives ─────────
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ElectionSummary>>> getActiveElections() {
        log.debug("GET /api/elections/active");
        return ResponseEntity.ok(
                ApiResponse.success("Élections actives", electionService.getActiveElections()));
    }

    // ── GET /api/elections/{id} — Détail d'une élection ──────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ElectionResponse>> getElectionById(@PathVariable Long id) {
        log.debug("GET /api/elections/{}", id);
        return ResponseEntity.ok(ApiResponse.success(electionService.getElectionById(id)));
    }

    // ── POST /api/elections — Créer une élection (ADMIN) ─────
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ElectionResponse>> createElection(
            @Valid @RequestBody CreateElectionRequest request) {
        log.info("POST /api/elections — title: {}", request.getTitle());
        ElectionResponse response = electionService.createElection(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Élection créée avec succès", response));
    }

    // ── PUT /api/elections/{id} — Modifier une élection (ADMIN)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ElectionResponse>> updateElection(
            @PathVariable Long id,
            @Valid @RequestBody UpdateElectionRequest request) {
        log.info("PUT /api/elections/{}", id);
        ElectionResponse response = electionService.updateElection(id, request);
        return ResponseEntity.ok(ApiResponse.success("Élection mise à jour", response));
    }

    // ── DELETE /api/elections/{id} — Supprimer (ADMIN, DRAFT) ─
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteElection(@PathVariable Long id) {
        log.info("DELETE /api/elections/{}", id);
        electionService.deleteElection(id);
        return ResponseEntity.ok(ApiResponse.success("Élection supprimée", null));
    }

    // ── PATCH /api/elections/{id}/status — Changer statut (ADMIN)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        log.info("PATCH /api/elections/{}/status → {}", id, body.get("status"));
        ElectionStatus newStatus = ElectionStatus.valueOf(body.get("status"));
        electionService.updateElectionStatus(id, newStatus);
        return ResponseEntity.ok(ApiResponse.success("Statut mis à jour", null));
    }
}
