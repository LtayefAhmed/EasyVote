package com.easyvote.backend.controller;

import com.easyvote.backend.dto.common.ApiResponse;
import com.easyvote.backend.dto.engagement.LikeToggleResponse;
import com.easyvote.backend.security.UserPrincipal;
import com.easyvote.backend.service.CandidateLikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/candidates/{candidateId}/like")
@RequiredArgsConstructor
public class LikeController {

    private final CandidateLikeService candidateLikeService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal up) return up.getUserId();
        return null;
    }

    // ── POST /api/candidates/{candidateId}/like (toggle) ─────
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<LikeToggleResponse>> toggleLike(
            @PathVariable Long candidateId) {
        Long userId = getCurrentUserId();
        log.info("Like toggle on candidate {} by user {}", candidateId, userId);
        LikeToggleResponse response = candidateLikeService.toggleLike(userId, candidateId);
        String msg = response.isLiked() ? "Like ajouté" : "Like retiré";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }
}
