package com.easyvote.backend.dto.vote;

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
public class ElectionStatsResponse {

    private Long electionId;
    private long totalVotes;
    private long totalEligibleVoters;
    private double participationRate;
    private long votesLastHour;
    private List<HourlyVoteStat> hourlyDistribution;
    private List<CandidateVoteResult> currentRanking;
    private LocalDateTime updatedAt;
}
