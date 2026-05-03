package com.easyvote.backend.service;

import com.easyvote.backend.dto.engagement.CommentResponse;
import com.easyvote.backend.dto.engagement.CreateCommentRequest;
import com.easyvote.backend.entity.Candidate;
import com.easyvote.backend.entity.Comment;
import com.easyvote.backend.entity.User;
import com.easyvote.backend.entity.enums.CandidateStatus;
import com.easyvote.backend.exception.BusinessException;
import com.easyvote.backend.exception.ForbiddenException;
import com.easyvote.backend.exception.ResourceNotFoundException;
import com.easyvote.backend.repository.CandidateRepository;
import com.easyvote.backend.repository.CommentRepository;
import com.easyvote.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ── 1. Poster un commentaire ───────────────────────────────
    public CommentResponse postComment(Long userId, Long candidateId, CreateCommentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));

        if (candidate.getStatus() != CandidateStatus.VALIDATED) {
            throw new BusinessException("Impossible de commenter un candidat non validé");
        }

        Comment comment = Comment.builder()
                .candidate(candidate)
                .user(user)
                .content(request.getContent())
                .build();

        Comment saved = commentRepository.save(comment);
        log.info("Comment posted on candidate {} by user {}", candidateId, userId);
        
        notificationService.notify(
            candidate.getUser().getId(),
            com.easyvote.backend.entity.enums.NotificationType.NEW_COMMENT,
            "Nouveau commentaire",
            user.getFullName() + " a commenté votre programme.",
            "/my-campaign"
        );
        
        return mapToResponse(saved, userId);
    }

    // ── 2. Lister les commentaires d'un candidat ───────────────
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByCandidate(Long candidateId, Long currentUserId) {
        return commentRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .stream()
                .map(c -> mapToResponse(c, currentUserId))
                .collect(Collectors.toList());
    }

    // ── 3. Supprimer un commentaire (auteur uniquement) ────────
    public void deleteComment(Long userId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Vous ne pouvez supprimer que vos propres commentaires");
        }

        commentRepository.delete(comment);
        log.info("Comment {} deleted by user {}", commentId, userId);
    }

    // ══════════════════════════════════════════════════════════════
    // HELPER
    // ══════════════════════════════════════════════════════════════

    private CommentResponse mapToResponse(Comment c, Long currentUserId) {
        return CommentResponse.builder()
                .id(c.getId())
                .candidateId(c.getCandidate().getId())
                .userId(c.getUser().getId())
                .userFullName(c.getUser().getFullName())
                .userInitials(computeInitials(c.getUser().getFullName()))
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .isMine(c.getUser().getId().equals(currentUserId))
                .build();
    }

    private String computeInitials(String fullName) {
        if (fullName == null || fullName.isBlank()) return "?";
        return Arrays.stream(fullName.trim().split("\\s+"))
                .filter(s -> !s.isEmpty())
                .map(s -> String.valueOf(s.charAt(0)))
                .limit(2)
                .collect(Collectors.joining())
                .toUpperCase();
    }
}
