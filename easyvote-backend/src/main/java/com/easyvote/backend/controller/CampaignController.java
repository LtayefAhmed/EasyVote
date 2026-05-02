package com.easyvote.backend.controller;

import com.easyvote.backend.dto.campaign.*;
import com.easyvote.backend.security.UserPrincipal;
import com.easyvote.backend.service.CampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    // ── Apply as Candidate ────────────────────────────────────

    @PostMapping("/candidates/apply")
    @PreAuthorize("hasAnyRole('STUDENT', 'CANDIDATE')")
    public ResponseEntity<CandidateResponse> apply(
            @Valid @RequestBody CandidateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(campaignService.apply(request, principal.getUserId()));
    }

    // ── Upload Photo ──────────────────────────────────────────

    @PostMapping("/candidates/{id}/photo")
    @PreAuthorize("hasAnyRole('STUDENT', 'CANDIDATE')")
    public ResponseEntity<String> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        return ResponseEntity.ok(campaignService.uploadPhoto(id, file, principal.getUserId()));
    }

    // ── Get Candidates (public — validated only) ──────────────

    @GetMapping("/candidates")
    public ResponseEntity<List<CandidateResponse>> getCandidates(
            @RequestParam Long electionId,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getUserId() : null;
        return ResponseEntity.ok(campaignService.getCandidatesByElection(electionId, userId));
    }

    // ── Get Single Candidate ──────────────────────────────────

    @GetMapping("/candidates/{id}")
    public ResponseEntity<CandidateResponse> getCandidate(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getUserId() : null;
        return ResponseEntity.ok(campaignService.getCandidate(id, userId));
    }

    // ── Admin: Get All Candidates ─────────────────────────────

    @GetMapping("/admin/candidates")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CandidateResponse>> getAllCandidates(
            @RequestParam Long electionId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(campaignService.getAllCandidatesByElection(electionId, principal.getUserId()));
    }

    // ── Admin: Get Pending Candidates ─────────────────────────

    @GetMapping("/admin/candidates/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CandidateResponse>> getPending(
            @RequestParam Long electionId) {
        return ResponseEntity.ok(campaignService.getPendingCandidates(electionId));
    }

    // ── Admin: Validate/Reject Candidate ──────────────────────

    @PutMapping("/admin/candidates/{id}/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CandidateResponse> validateCandidate(
            @PathVariable Long id,
            @RequestParam boolean approve) {
        return ResponseEntity.ok(campaignService.validateCandidate(id, approve));
    }

    // ── Toggle Like ───────────────────────────────────────────

    @PostMapping("/candidates/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        long count = campaignService.toggleLike(id, principal.getUserId());
        return ResponseEntity.ok(Map.of("likeCount", count));
    }

    // ── Comments ──────────────────────────────────────────────

    @PostMapping("/candidates/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(campaignService.addComment(id, request, principal.getUserId()));
    }

    @GetMapping("/candidates/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getComments(id));
    }

    // ── Questions ─────────────────────────────────────────────

    @PostMapping("/candidates/{id}/questions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuestionResponse> askQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(campaignService.askQuestion(id, request, principal.getUserId()));
    }

    @PutMapping("/candidates/questions/{questionId}/answer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuestionResponse> answerQuestion(
            @PathVariable Long questionId,
            @Valid @RequestBody AnswerRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(campaignService.answerQuestion(questionId, request, principal.getUserId()));
    }

    @GetMapping("/candidates/{id}/questions")
    public ResponseEntity<List<QuestionResponse>> getQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getQuestions(id));
    }

    // ── Announcements ─────────────────────────────────────────

    @PostMapping("/candidates/{id}/announcements")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AnnouncementResponse> addAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncementRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(campaignService.addAnnouncement(id, request, principal.getUserId()));
    }

    @GetMapping("/candidates/{id}/announcements")
    public ResponseEntity<List<AnnouncementResponse>> getAnnouncements(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getAnnouncements(id));
    }
}