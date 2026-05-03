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
public class ElectionResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime campaignStart;
    private LocalDateTime campaignEnd;
    private LocalDateTime voteStart;
    private LocalDateTime voteEnd;
    private ElectionStatus status;
    private int totalCandidates;
    private int totalVotes;
    private boolean isCampaignActive;
    private boolean isVoteActive;
    private LocalDateTime createdAt;
}
