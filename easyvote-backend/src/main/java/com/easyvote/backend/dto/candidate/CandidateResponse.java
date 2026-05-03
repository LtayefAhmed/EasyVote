package com.easyvote.backend.dto.candidate;

import com.easyvote.backend.entity.enums.CandidateStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateResponse {

    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private Long electionId;
    private String electionTitle;
    private String slogan;
    private String program;
    private String photoUrl;
    private CandidateStatus status;
    private long likesCount;
    private long commentsCount;
    private long questionsCount;
    private boolean likedByMe;
    private LocalDateTime createdAt;
}
