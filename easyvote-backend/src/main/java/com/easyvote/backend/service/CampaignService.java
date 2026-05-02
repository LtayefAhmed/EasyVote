package com.easyvote.backend.service;

import com.easyvote.backend.entity.*;
import com.easyvote.backend.entity.enums.CandidateStatus;
import com.easyvote.backend.entity.enums.Role;
import com.easyvote.backend.exception.BusinessException;
import com.easyvote.backend.exception.ResourceNotFoundException;
import com.easyvote.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import com.easyvote.backend.dto.campaign.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CampaignService {

    private final CandidateRepository candidateRepository;
    private final AnnouncementRepository announcementRepository;
    private final CommentRepository commentRepository;
    private final CandidateLikeRepository candidateLikeRepository;
    private final QuestionRepository questionRepository;
    private final ElectionRepository electionRepository;
    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/candidates/";

    // ── Apply as Candidate ────────────────────────────────────

    @Transactional
    public CandidateResponse apply(CandidateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Election election = electionRepository.findById(request.getElectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", request.getElectionId()));

        if (candidateRepository.findByUserIdAndElectionId(userId, request.getElectionId()).isPresent()) {
            throw new BusinessException("Vous avez déjà déposé une candidature pour cette élection");
        }

        Candidate candidate = Candidate.builder()
                .user(user)
                .election(election)
                .slogan(request.getSlogan())
                .program(request.getProgram())
                .status(CandidateStatus.PENDING)
                .build();

        candidate = candidateRepository.save(candidate);
        log.info("New candidacy submitted by user {} for election {}", userId, request.getElectionId());
        return toResponse(candidate, userId);
    }

    // ── Upload Photo ──────────────────────────────────────────

    @Transactional
    public String uploadPhoto(Long candidateId, MultipartFile file, Long userId) throws IOException {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));

        if (!candidate.getUser().getId().equals(userId)) {
            throw new BusinessException("Vous ne pouvez modifier que votre propre candidature");
        }

        String filename = "candidate_" + candidateId + "_" + System.currentTimeMillis()
                + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(UPLOAD_DIR);
        Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        candidate.setPhotoUrl("/uploads/candidates/" + filename);
        candidateRepository.save(candidate);
        log.info("Photo uploaded for candidate {}", candidateId);
        return candidate.getPhotoUrl();
    }

    // ── Get Candidates ────────────────────────────────────────

    public List<CandidateResponse> getCandidatesByElection(Long electionId, Long currentUserId) {
        return candidateRepository
                .findByElectionIdAndStatus(electionId, CandidateStatus.VALIDATED)
                .stream()
                .map(c -> toResponse(c, currentUserId))
                .toList();
    }

    public List<CandidateResponse> getAllCandidatesByElection(Long electionId, Long currentUserId) {
        return candidateRepository
                .findByElectionId(electionId)
                .stream()
                .map(c -> toResponse(c, currentUserId))
                .toList();
    }

    public CandidateResponse getCandidate(Long candidateId, Long currentUserId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));
        return toResponse(candidate, currentUserId);
    }

    // ── Admin: Validate/Reject ────────────────────────────────

    @Transactional
    public CandidateResponse validateCandidate(Long candidateId, boolean approve) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));

        candidate.setStatus(approve ? CandidateStatus.VALIDATED : CandidateStatus.REJECTED);
        candidate.setValidatedAt(LocalDateTime.now());
        candidateRepository.save(candidate);
        log.info("Candidate {} {}", candidateId, approve ? "approved" : "rejected");
        return toResponse(candidate, null);
    }

    public List<CandidateResponse> getPendingCandidates(Long electionId) {
        return candidateRepository
                .findByElectionIdAndStatus(electionId, CandidateStatus.PENDING)
                .stream()
                .map(c -> toResponse(c, null))
                .toList();
    }

    // ── Likes ─────────────────────────────────────────────────

    @Transactional
    public long toggleLike(Long candidateId, Long userId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (candidateLikeRepository.existsByCandidateIdAndUserId(candidateId, userId)) {
            candidateLikeRepository.deleteByCandidateIdAndUserId(candidateId, userId);
        } else {
            CandidateLike like = CandidateLike.builder()
                    .candidate(candidate)
                    .user(user)
                    .build();
            candidateLikeRepository.save(like);
        }
        return candidateLikeRepository.countByCandidateId(candidateId);
    }

    // ── Comments ──────────────────────────────────────────────

    @Transactional
    public CommentResponse addComment(Long candidateId, CommentRequest request, Long userId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Comment comment = Comment.builder()
                .candidate(candidate)
                .user(user)
                .content(request.getContent())
                .build();

        comment = commentRepository.save(comment);
        return toCommentResponse(comment);
    }

    public List<CommentResponse> getComments(Long candidateId) {
        return commentRepository
                .findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .stream()
                .map(this::toCommentResponse)
                .toList();
    }

    // ── Questions ─────────────────────────────────────────────

    @Transactional
    public QuestionResponse askQuestion(Long candidateId, QuestionRequest request, Long userId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Question question = Question.builder()
                .candidate(candidate)
                .user(user)
                .content(request.getContent())
                .build();

        question = questionRepository.save(question);
        return toQuestionResponse(question);
    }

    @Transactional
    public QuestionResponse answerQuestion(Long questionId, AnswerRequest request, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", questionId));

        if (!question.getCandidate().getUser().getId().equals(userId)) {
            throw new BusinessException("Seul le candidat peut répondre à cette question");
        }

        question.setAnswer(request.getAnswer());
        question.setAnsweredAt(LocalDateTime.now());
        question = questionRepository.save(question);
        return toQuestionResponse(question);
    }

    public List<QuestionResponse> getQuestions(Long candidateId) {
        return questionRepository
                .findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .stream()
                .map(this::toQuestionResponse)
                .toList();
    }

    // ── Announcements ─────────────────────────────────────────

    @Transactional
    public AnnouncementResponse addAnnouncement(Long candidateId, AnnouncementRequest request, Long userId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));

        if (!candidate.getUser().getId().equals(userId)) {
            throw new BusinessException("Seul le candidat peut publier des annonces");
        }

        Announcement announcement = Announcement.builder()
                .candidate(candidate)
                .content(request.getContent())
                .build();

        announcement = announcementRepository.save(announcement);
        return toAnnouncementResponse(announcement);
    }

    public List<AnnouncementResponse> getAnnouncements(Long candidateId) {
        return announcementRepository
                .findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .stream()
                .map(this::toAnnouncementResponse)
                .toList();
    }

    // ── Mappers ───────────────────────────────────────────────

    private CandidateResponse toResponse(Candidate c, Long currentUserId) {
        boolean liked = currentUserId != null
                && candidateLikeRepository.existsByCandidateIdAndUserId(c.getId(), currentUserId);

        return CandidateResponse.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .fullName(c.getUser().getFullName())
                .email(c.getUser().getEmail())
                .slogan(c.getSlogan())
                .program(c.getProgram())
                .photoUrl(c.getPhotoUrl())
                .status(c.getStatus())
                .electionId(c.getElection().getId())
                .electionTitle(c.getElection().getTitle())
                .likeCount(candidateLikeRepository.countByCandidateId(c.getId()))
                .likedByCurrentUser(liked)
                .createdAt(c.getCreatedAt())
                .build();
    }

    private CommentResponse toCommentResponse(Comment c) {
        return CommentResponse.builder()
                .id(c.getId())
                .authorName(c.getUser().getFullName())
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private QuestionResponse toQuestionResponse(Question q) {
        return QuestionResponse.builder()
                .id(q.getId())
                .askerName(q.getUser().getFullName())
                .content(q.getContent())
                .answer(q.getAnswer())
                .createdAt(q.getCreatedAt())
                .answeredAt(q.getAnsweredAt())
                .build();
    }

    private AnnouncementResponse toAnnouncementResponse(Announcement a) {
        return AnnouncementResponse.builder()
                .id(a.getId())
                .content(a.getContent())
                .createdAt(a.getCreatedAt())
                .build();
    }
}

