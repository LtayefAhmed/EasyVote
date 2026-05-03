package com.easyvote.backend.controller;

import com.easyvote.backend.dto.common.ApiResponse;
import com.easyvote.backend.dto.engagement.AnnouncementResponse;
import com.easyvote.backend.dto.engagement.CreateAnnouncementRequest;
import com.easyvote.backend.dto.engagement.UpdateAnnouncementRequest;
import com.easyvote.backend.security.UserPrincipal;
import com.easyvote.backend.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/candidates/{candidateId}/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal up) return up.getUserId();
        return null;
    }

    // ── POST /api/candidates/{candidateId}/announcements ─────
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(
            @PathVariable Long candidateId,
            @Valid @RequestBody CreateAnnouncementRequest request) {
        Long userId = getCurrentUserId();
        log.info("POST announcement for candidate {} by user {}", candidateId, userId);
        AnnouncementResponse response = announcementService.createAnnouncement(userId, candidateId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Annonce publiée", response));
    }

    // ── PUT /api/candidates/{candidateId}/announcements/{announcementId}
    @PutMapping("/{announcementId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> updateAnnouncement(
            @PathVariable Long candidateId,
            @PathVariable Long announcementId,
            @Valid @RequestBody UpdateAnnouncementRequest request) {
        Long userId = getCurrentUserId();
        log.info("PUT announcement {} by user {}", announcementId, userId);
        AnnouncementResponse response = announcementService.updateAnnouncement(userId, announcementId, request);
        return ResponseEntity.ok(ApiResponse.success("Annonce mise à jour", response));
    }

    // ── DELETE /api/candidates/{candidateId}/announcements/{announcementId}
    @DeleteMapping("/{announcementId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(
            @PathVariable Long candidateId,
            @PathVariable Long announcementId) {
        Long userId = getCurrentUserId();
        log.info("DELETE announcement {} by user {}", announcementId, userId);
        announcementService.deleteAnnouncement(userId, announcementId);
        return ResponseEntity.ok(ApiResponse.success("Annonce supprimée", null));
    }

    // ── GET /api/candidates/{candidateId}/announcements ──────
    @GetMapping
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAnnouncements(
            @PathVariable Long candidateId) {
        return ResponseEntity.ok(
                ApiResponse.success(announcementService.getAnnouncementsByCandidate(candidateId)));
    }
}
