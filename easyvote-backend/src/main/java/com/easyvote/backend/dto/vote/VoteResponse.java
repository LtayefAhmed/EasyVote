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
public class VoteResponse {

    private String message;
    private String confirmationCode;
    private LocalDateTime votedAt;
}
