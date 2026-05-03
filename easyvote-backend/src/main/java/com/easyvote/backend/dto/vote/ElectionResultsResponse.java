package com.easyvote.backend.dto.vote;

import com.easyvote.backend.entity.enums.ElectionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectionResultsResponse {

    private Long electionId;
    private String electionTitle;
    private ElectionStatus status;
    private long totalVotes;
    private long totalEligibleVoters;
    private double participationRate;
    private List<CandidateVoteResult> results;
    private LocalDateTime computedAt;
    private boolean isFinal;
}
