package com.easyvote.backend.dto.election;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateElectionRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 200, message = "Le titre ne doit pas dépasser 200 caractères")
    private String title;

    @Size(max = 2000, message = "La description ne doit pas dépasser 2000 caractères")
    private String description;

    @NotNull(message = "La date de début de campagne est obligatoire")
    @Future(message = "La date de début de campagne doit être dans le futur")
    private LocalDateTime campaignStart;

    @NotNull(message = "La date de fin de campagne est obligatoire")
    private LocalDateTime campaignEnd;

    @NotNull(message = "La date de début de vote est obligatoire")
    private LocalDateTime voteStart;

    @NotNull(message = "La date de fin de vote est obligatoire")
    private LocalDateTime voteEnd;
}
