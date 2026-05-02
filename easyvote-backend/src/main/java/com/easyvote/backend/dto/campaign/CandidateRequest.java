package com.easyvote.backend.dto.campaign;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CandidateRequest {
    @NotBlank
    private String slogan;
    @NotBlank
    private String program;
    @NotNull
    private Long electionId;
}