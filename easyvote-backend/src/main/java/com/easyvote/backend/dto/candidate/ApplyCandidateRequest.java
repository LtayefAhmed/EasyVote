package com.easyvote.backend.dto.candidate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyCandidateRequest {

    @NotNull(message = "L'ID de l'élection est obligatoire")
    private Long electionId;

    @NotBlank(message = "Le slogan est obligatoire")
    @Size(max = 200, message = "Le slogan ne doit pas dépasser 200 caractères")
    private String slogan;

    @NotBlank(message = "Le programme est obligatoire")
    @Size(max = 5000, message = "Le programme ne doit pas dépasser 5000 caractères")
    private String program;

    private String photoUrl;
}
