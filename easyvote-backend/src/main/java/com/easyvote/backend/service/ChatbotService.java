package com.easyvote.backend.service;

import com.easyvote.backend.dto.chatbot.ChatHistoryItem;
import com.easyvote.backend.dto.chatbot.ChatMessageRequest;
import com.easyvote.backend.dto.chatbot.ChatMessageResponse;
import com.easyvote.backend.dto.chatbot.ChatSessionResponse;
import com.easyvote.backend.entity.ChatMessage;
import com.easyvote.backend.entity.User;
import com.easyvote.backend.entity.enums.ChatRole;
import com.easyvote.backend.exception.ResourceNotFoundException;
import com.easyvote.backend.repository.ChatMessageRepository;
import com.easyvote.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChatbotService {

    private final ChatbotRulesService chatbotRulesService;
    private final ChatbotAiService chatbotAiService;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public ChatMessageResponse processMessage(Long userId, ChatMessageRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.isBlank()) {
            sessionId = "session-" + UUID.randomUUID().toString();
        }

        // Save User Message
        ChatMessage userMsg = ChatMessage.builder()
                .user(user)
                .role(ChatRole.USER)
                .content(request.getMessage())
                .sessionId(sessionId)
                .build();
        chatMessageRepository.save(userMsg);

        // Determine Bot Response
        Optional<String> ruleResponse = chatbotRulesService.tryMatchRule(request.getMessage(), userId);
        String botResponse;
        String source;

        if (ruleResponse.isPresent()) {
            botResponse = ruleResponse.get();
            source = "RULES";
        } else if (chatbotAiService.isEnabled()) {
            List<ChatMessage> recentHistory = chatMessageRepository.findByUserIdAndSessionIdOrderByCreatedAtAsc(userId, sessionId);
            Optional<String> aiResponse = chatbotAiService.generateResponse(request.getMessage(), recentHistory);
            if (aiResponse.isPresent()) {
                botResponse = aiResponse.get();
                source = "AI";
            } else {
                botResponse = getDefaultFallback();
                source = "RULES";
            }
        } else {
            botResponse = getDefaultFallback();
            source = "RULES";
        }

        // Save Bot Message
        ChatMessage botMsg = ChatMessage.builder()
                .user(user)
                .role(ChatRole.ASSISTANT)
                .content(botResponse)
                .sessionId(sessionId)
                .build();
        chatMessageRepository.save(botMsg);

        return ChatMessageResponse.builder()
                .sessionId(sessionId)
                .userMessage(request.getMessage())
                .botResponse(botResponse)
                .source(source)
                .timestamp(botMsg.getCreatedAt())
                .suggestedQuestions(chatbotRulesService.getSuggestedQuestions(request.getMessage()))
                .build();
    }

    private String getDefaultFallback() {
        return "Je ne suis pas sûr de comprendre votre question 🤔. Voici les sujets sur lesquels je peux vous aider :\n• Élections en cours\n• Comment voter\n• Liste des candidats\n• Résultats et statistiques\n• Anonymat du vote\n• Devenir candidat\n\nReformulez votre question ou posez l'une de ces questions !";
    }

    @Transactional(readOnly = true)
    public ChatSessionResponse getSession(Long userId, String sessionId) {
        List<ChatMessage> messages = chatMessageRepository.findByUserIdAndSessionIdOrderByCreatedAtAsc(userId, sessionId);
        List<ChatHistoryItem> history = messages.stream()
                .map(this::mapToHistoryItem)
                .collect(Collectors.toList());

        return ChatSessionResponse.builder()
                .sessionId(sessionId)
                .messages(history)
                .startedAt(messages.isEmpty() ? null : messages.get(0).getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ChatHistoryItem> getRecentMessages(Long userId) {
        List<ChatMessage> messages = chatMessageRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId);
        Collections.reverse(messages); // Ordre chronologique
        return messages.stream()
                .map(this::mapToHistoryItem)
                .collect(Collectors.toList());
    }

    private ChatHistoryItem mapToHistoryItem(ChatMessage msg) {
        return ChatHistoryItem.builder()
                .id(msg.getId())
                .role(msg.getRole())
                .content(msg.getContent())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}
