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
public class AskQuestionRequest {

    @NotBlank(message = "La question ne peut pas être vide")
    @Size(max = 1000, message = "La question ne doit pas dépasser 1000 caractères")
    private String content;
}
