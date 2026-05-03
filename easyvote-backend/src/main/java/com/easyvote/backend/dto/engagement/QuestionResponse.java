package com.easyvote.backend.dto.engagement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionResponse {

    private Long id;
    private Long candidateId;
    private Long userId;
    private String userFullName;
    private String userInitials;
    private String content;
    private String answer;
    private LocalDateTime createdAt;
    private LocalDateTime answeredAt;
    private boolean answered;
}
