package com.easyvote.backend.dto.election;

import com.easyvote.backend.entity.enums.ElectionStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateElectionRequest {

    @Size(max = 200, message = "Le titre ne doit pas dépasser 200 caractères")
    private String title;

    @Size(max = 2000, message = "La description ne doit pas dépasser 2000 caractères")
    private String description;

    private LocalDateTime campaignStart;

    private LocalDateTime campaignEnd;

    private LocalDateTime voteStart;

    private LocalDateTime voteEnd;

    private ElectionStatus status;
}
