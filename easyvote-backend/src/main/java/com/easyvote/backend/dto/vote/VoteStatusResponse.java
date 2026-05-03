package com.easyvote.backend.dto.vote;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteStatusResponse {

    private boolean hasVoted;
    private boolean canVote;
    private LocalDateTime voteEndAt;
    private String message;
}
