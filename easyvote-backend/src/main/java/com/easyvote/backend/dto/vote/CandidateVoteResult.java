package com.easyvote.backend.dto.vote;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateVoteResult {

    private Long candidateId;
    private String fullName;
    private String slogan;
    private String photoUrl;
    private long votes;
    private double percentage;
    private int rank;
}
