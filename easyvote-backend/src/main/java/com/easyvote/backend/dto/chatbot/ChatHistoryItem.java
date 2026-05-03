package com.easyvote.backend.dto.chatbot;

import com.easyvote.backend.entity.enums.ChatRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatHistoryItem {

    private Long id;
    private ChatRole role;
    private String content;
    private LocalDateTime createdAt;
}
