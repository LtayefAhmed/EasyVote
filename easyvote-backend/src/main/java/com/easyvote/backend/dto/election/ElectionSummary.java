package com.easyvote.backend.dto.election;

import com.easyvote.backend.entity.enums.ElectionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectionSummary {

    private Long id;
    private String title;
    private ElectionStatus status;
    private LocalDateTime voteStart;
    private LocalDateTime voteEnd;
    private int totalCandidates;
}
