package com.easyvote.backend.controller;

import com.easyvote.backend.dto.chatbot.ChatMessageRequest;
import com.easyvote.backend.dto.chatbot.ChatMessageResponse;
import com.easyvote.backend.dto.chatbot.ChatSessionResponse;
import com.easyvote.backend.dto.chatbot.ChatHistoryItem;
import com.easyvote.backend.dto.common.ApiResponse;
import com.easyvote.backend.security.UserPrincipal;
import com.easyvote.backend.service.ChatbotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal up) return up.getUserId();
        return null;
    }

    @PostMapping("/message")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @Valid @RequestBody ChatMessageRequest request) {
        Long userId = getCurrentUserId();
        ChatMessageResponse response = chatbotService.processMessage(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/sessions/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ChatSessionResponse>> getSession(
            @PathVariable String sessionId) {
        Long userId = getCurrentUserId();
        ChatSessionResponse response = chatbotService.getSession(userId, sessionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ChatHistoryItem>>> getHistory() {
        Long userId = getCurrentUserId();
        List<ChatHistoryItem> response = chatbotService.getRecentMessages(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
