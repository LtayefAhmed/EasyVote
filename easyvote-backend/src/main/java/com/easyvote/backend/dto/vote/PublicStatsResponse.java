package com.easyvote.backend.dto.vote;

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
public class PublicStatsResponse {
    private Long electionId;
    private String electionTitle;
    private ElectionStatus status;
    private long totalVotes;
    private long totalEligibleVoters;
    private double participationRate;
    private LocalDateTime updatedAt;
}
