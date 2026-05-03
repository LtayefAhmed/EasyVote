package com.easyvote.backend.dto.chatbot;

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
public class ChatMessageRequest {

    @NotBlank(message = "Le message est obligatoire")
    @Size(max = 500, message = "Le message ne doit pas dépasser 500 caractères")
    private String message;

    private String sessionId;
}
