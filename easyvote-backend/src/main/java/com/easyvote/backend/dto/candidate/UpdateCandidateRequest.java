package com.easyvote.backend.dto.candidate;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCandidateRequest {

    @Size(max = 200, message = "Le slogan ne doit pas dépasser 200 caractères")
    private String slogan;

    @Size(max = 5000, message = "Le programme ne doit pas dépasser 5000 caractères")
    private String program;

    private String photoUrl;
}
