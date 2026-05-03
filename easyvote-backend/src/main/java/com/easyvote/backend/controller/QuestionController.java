package com.easyvote.backend.controller;

import com.easyvote.backend.dto.common.ApiResponse;
import com.easyvote.backend.dto.engagement.AnswerQuestionRequest;
import com.easyvote.backend.dto.engagement.AskQuestionRequest;
import com.easyvote.backend.dto.engagement.QuestionResponse;
import com.easyvote.backend.security.UserPrincipal;
import com.easyvote.backend.service.QuestionService;
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
@RequestMapping("/api/candidates/{candidateId}/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal up) return up.getUserId();
        return null;
    }

    // ── POST /api/candidates/{candidateId}/questions ─────────
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<QuestionResponse>> askQuestion(
            @PathVariable Long candidateId,
            @Valid @RequestBody AskQuestionRequest request) {
        Long userId = getCurrentUserId();
        log.info("Question asked to candidate {} by user {}", candidateId, userId);
        QuestionResponse response = questionService.askQuestion(userId, candidateId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question posée", response));
    }

    // ── GET /api/candidates/{candidateId}/questions ──────────
    @GetMapping
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getQuestions(
            @PathVariable Long candidateId,
            @RequestParam(defaultValue = "false") boolean answeredOnly) {
        return ResponseEntity.ok(
                ApiResponse.success(questionService.getQuestionsByCandidate(candidateId, answeredOnly)));
    }

    // ── POST /api/candidates/{candidateId}/questions/{questionId}/answer
    @PostMapping("/{questionId}/answer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<QuestionResponse>> answerQuestion(
            @PathVariable Long candidateId,
            @PathVariable Long questionId,
            @Valid @RequestBody AnswerQuestionRequest request) {
        Long userId = getCurrentUserId();
        log.info("Question {} answered by user {}", questionId, userId);
        QuestionResponse response = questionService.answerQuestion(userId, questionId, request);
        return ResponseEntity.ok(ApiResponse.success("Réponse publiée", response));
    }

    // ── GET /api/candidates/my-pending-questions (hors candidateId)
    // Note: cet endpoint est accessible via /api/questions/my-pending dans un controller séparé
    // ou via le CandidateController. Pour simplifier, on l'ajoute ici avec un path dédié.
}
