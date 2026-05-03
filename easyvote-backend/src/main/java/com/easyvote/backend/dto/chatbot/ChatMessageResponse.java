package com.easyvote.backend.dto.chatbot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {

    private String sessionId;
    private String userMessage;
    private String botResponse;
    private String source;
    private LocalDateTime timestamp;
    private List<String> suggestedQuestions;
}
