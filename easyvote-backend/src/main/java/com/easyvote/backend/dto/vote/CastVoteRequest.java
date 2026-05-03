package com.easyvote.backend.dto.vote;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CastVoteRequest {

    @NotNull(message = "L'ID du candidat est obligatoire")
    private Long candidateId;
}
