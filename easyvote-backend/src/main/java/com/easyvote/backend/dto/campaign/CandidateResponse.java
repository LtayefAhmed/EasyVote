package com.easyvote.backend.dto.campaign;

import com.easyvote.backend.entity.enums.CandidateStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CandidateResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String slogan;
    private String program;
    private String photoUrl;
    private CandidateStatus status;
    private Long electionId;
    private String electionTitle;
    private long likeCount;
    private boolean likedByCurrentUser;
    private LocalDateTime createdAt;
}