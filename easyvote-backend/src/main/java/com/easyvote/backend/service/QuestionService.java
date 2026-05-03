package com.easyvote.backend.service;

import com.easyvote.backend.dto.engagement.AnswerQuestionRequest;
import com.easyvote.backend.dto.engagement.AskQuestionRequest;
import com.easyvote.backend.dto.engagement.QuestionResponse;
import com.easyvote.backend.entity.Candidate;
import com.easyvote.backend.entity.Question;
import com.easyvote.backend.entity.User;
import com.easyvote.backend.entity.enums.CandidateStatus;
import com.easyvote.backend.exception.BusinessException;
import com.easyvote.backend.exception.ForbiddenException;
import com.easyvote.backend.exception.ResourceNotFoundException;
import com.easyvote.backend.repository.CandidateRepository;
import com.easyvote.backend.repository.QuestionRepository;
import com.easyvote.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ── 1. Poser une question ──────────────────────────────────
    public QuestionResponse askQuestion(Long userId, Long candidateId, AskQuestionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));

        if (candidate.getStatus() != CandidateStatus.VALIDATED) {
            throw new BusinessException("Impossible de poser une question à un candidat non validé");
        }

        Question question = Question.builder()
                .candidate(candidate)
                .user(user)
                .content(request.getContent())
                .build();

        Question saved = questionRepository.save(question);
        log.info("Question asked to candidate {} by user {}", candidateId, userId);
        
        notificationService.notify(
            candidate.getUser().getId(),
            com.easyvote.backend.entity.enums.NotificationType.NEW_QUESTION,
            "Nouvelle question",
            user.getFullName() + " vous a posé une question.",
            "/my-campaign"
        );
        
        return mapToResponse(saved);
    }

    // ── 2. Le candidat répond à une question ───────────────────
    public QuestionResponse answerQuestion(Long userId, Long questionId, AnswerQuestionRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", questionId));

        // Seul le candidat concerné peut répondre
        if (!question.getCandidate().getUser().getId().equals(userId)) {
            throw new ForbiddenException("Seul le candidat concerné peut répondre à cette question");
        }

        if (question.getAnswer() != null) {
            throw new BusinessException("Cette question a déjà été répondue");
        }

        question.setAnswer(request.getAnswer());
        question.setAnsweredAt(LocalDateTime.now());

        Question saved = questionRepository.save(question);
        log.info("Question {} answered by candidate user {}", questionId, userId);
        
        notificationService.notify(
            question.getUser().getId(),
            com.easyvote.backend.entity.enums.NotificationType.QUESTION_ANSWERED,
            "Réponse à votre question",
            "Le candidat a répondu à votre question.",
            "/elections/" + question.getCandidate().getElection().getId()
        );
        
        return mapToResponse(saved);
    }

    // ── 3. Lister les questions d'un candidat ──────────────────
    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestionsByCandidate(Long candidateId, boolean answeredOnly) {
        List<Question> questions;
        if (answeredOnly) {
            questions = questionRepository.findByCandidateIdAndAnswerIsNotNullOrderByAnsweredAtDesc(candidateId);
        } else {
            questions = questionRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId);
        }
        return questions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── 4. Questions en attente du candidat connecté ────────────
    @Transactional(readOnly = true)
    public List<QuestionResponse> getMyPendingQuestions(Long userId) {
        // Trouver tous les candidates de cet user
        List<Candidate> myCandidates = candidateRepository.findByUserId(userId);

        List<QuestionResponse> pending = new ArrayList<>();
        for (Candidate candidate : myCandidates) {
            List<Question> unanswered = questionRepository
                    .findByCandidateIdOrderByCreatedAtDesc(candidate.getId())
                    .stream()
                    .filter(q -> q.getAnswer() == null)
                    .toList();
            unanswered.forEach(q -> pending.add(mapToResponse(q)));
        }

        // Trier par createdAt DESC
        pending.sort(Comparator.comparing(QuestionResponse::getCreatedAt).reversed());
        return pending;
    }

    // ══════════════════════════════════════════════════════════════
    // HELPER
    // ══════════════════════════════════════════════════════════════

    private QuestionResponse mapToResponse(Question q) {
        return QuestionResponse.builder()
                .id(q.getId())
                .candidateId(q.getCandidate().getId())
                .userId(q.getUser().getId())
                .userFullName(q.getUser().getFullName())
                .userInitials(computeInitials(q.getUser().getFullName()))
                .content(q.getContent())
                .answer(q.getAnswer())
                .createdAt(q.getCreatedAt())
                .answeredAt(q.getAnsweredAt())
                .answered(q.getAnswer() != null)
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
