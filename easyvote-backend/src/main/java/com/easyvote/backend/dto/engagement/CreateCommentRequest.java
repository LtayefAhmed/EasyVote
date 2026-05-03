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
public class CreateCommentRequest {

    @NotBlank(message = "Le commentaire ne peut pas être vide")
    @Size(max = 1000, message = "Le commentaire ne doit pas dépasser 1000 caractères")
    private String content;
}
