package com.easyvote.backend.dto.campaign;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AnnouncementResponse {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
}