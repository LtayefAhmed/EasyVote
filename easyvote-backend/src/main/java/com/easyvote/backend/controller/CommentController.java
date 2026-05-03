package com.easyvote.backend.controller;

import com.easyvote.backend.dto.common.ApiResponse;
import com.easyvote.backend.dto.engagement.CommentResponse;
import com.easyvote.backend.dto.engagement.CreateCommentRequest;
import com.easyvote.backend.security.UserPrincipal;
import com.easyvote.backend.service.CommentService;
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
@RequestMapping("/api/candidates/{candidateId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal up) return up.getUserId();
        return null;
    }

    // ── POST /api/candidates/{candidateId}/comments ──────────
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentResponse>> postComment(
            @PathVariable Long candidateId,
            @Valid @RequestBody CreateCommentRequest request) {
        Long userId = getCurrentUserId();
        log.info("POST comment on candidate {} by user {}", candidateId, userId);
        CommentResponse response = commentService.postComment(userId, candidateId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Commentaire publié", response));
    }

    // ── GET /api/candidates/{candidateId}/comments ───────────
    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @PathVariable Long candidateId) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(
                ApiResponse.success(commentService.getCommentsByCandidate(candidateId, userId)));
    }

    // ── DELETE /api/candidates/{candidateId}/comments/{commentId}
    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long candidateId,
            @PathVariable Long commentId) {
        Long userId = getCurrentUserId();
        log.info("DELETE comment {} by user {}", commentId, userId);
        commentService.deleteComment(userId, commentId);
        return ResponseEntity.ok(ApiResponse.success("Commentaire supprimé", null));
    }
}
