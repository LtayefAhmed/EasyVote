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
public class ChatSessionResponse {

    private String sessionId;
    private List<ChatHistoryItem> messages;
    private LocalDateTime startedAt;
}
