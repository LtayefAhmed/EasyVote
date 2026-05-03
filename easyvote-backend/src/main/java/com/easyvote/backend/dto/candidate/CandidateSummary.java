package com.easyvote.backend.dto.candidate;

import com.easyvote.backend.entity.enums.CandidateStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateSummary {

    private Long id;
    private String fullName;
    private String slogan;
    private String photoUrl;
    private long likesCount;
    private CandidateStatus status;
}
