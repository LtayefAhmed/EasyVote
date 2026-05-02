package com.easyvote.backend.dto.campaign;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {
    private Long id;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
}