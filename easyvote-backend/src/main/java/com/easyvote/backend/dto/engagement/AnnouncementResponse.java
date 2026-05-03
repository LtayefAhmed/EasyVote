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
public class AnnouncementResponse {

    private Long id;
    private Long candidateId;
    private String candidateName;
    private String title;
    private String content;
    private LocalDateTime createdAt;
}
