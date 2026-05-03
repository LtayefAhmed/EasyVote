package com.easyvote.backend.dto.candidate;

import com.easyvote.backend.entity.enums.CandidateStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidateCandidateRequest {

    @NotNull(message = "Le statut est obligatoire (VALIDATED ou REJECTED)")
    private CandidateStatus status;

    private String adminNote;
}
