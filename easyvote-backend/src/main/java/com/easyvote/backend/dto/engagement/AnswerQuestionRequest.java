package com.easyvote.backend.dto.engagement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerQuestionRequest {

    @NotBlank(message = "La réponse ne peut pas être vide")
    @Size(max = 2000, message = "La réponse ne doit pas dépasser 2000 caractères")
    private String answer;
}
