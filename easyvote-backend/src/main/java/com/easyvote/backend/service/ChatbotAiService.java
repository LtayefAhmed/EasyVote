package com.easyvote.backend.service;

import com.easyvote.backend.entity.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotAiService {

    private final RestTemplate restTemplate;

    @Value("${easyvote.chatbot.ai-enabled:false}")
    private boolean enabled;

    @Value("${easyvote.chatbot.ai-api-key:}")
    private String apiKey;

    @Value("${easyvote.chatbot.ai-model:gemini-2.0-flash}")
    private String model;

    @Value("${easyvote.chatbot.ai-base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    public boolean isEnabled() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }

    public Optional<String> generateResponse(String userMessage, List<ChatMessage> recentHistory) {
        if (!isEnabled()) {
            return Optional.empty();
        }

        try {
            String url = baseUrl + "/models/" + model + ":generateContent?key=" + apiKey;

            String systemPrompt = "Tu es EasyBot, assistant virtuel de la plateforme EasyVote (vote universitaire).\n" +
                    "Réponds en français de manière concise (2-3 phrases max), professionnelle et amicale.\n" +
                    "Tu réponds uniquement aux questions liées aux élections universitaires, au vote, aux candidats.\n" +
                    "Si la question est hors-sujet, redirige poliment vers les sujets que tu peux traiter.\n" +
                    "N'invente JAMAIS d'informations sur des élections ou candidats spécifiques.";

            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();

            Map<String, Object> contentPart = new HashMap<>();
            contentPart.put("role", "user");
            
            List<Map<String, String>> parts = new ArrayList<>();
            Map<String, String> textPart = new HashMap<>();
            textPart.put("text", systemPrompt + "\n\nUser: " + userMessage);
            parts.add(textPart);
            
            contentPart.put("parts", parts);
            contents.add(contentPart);

            requestBody.put("contents", contents);

            Map<String, Object> genConfig = new HashMap<>();
            genConfig.put("temperature", 0.7);
            genConfig.put("maxOutputTokens", 200);
            requestBody.put("generationConfig", genConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            Map response = restTemplate.postForObject(url, requestEntity, Map.class);
            
            if (response != null && response.containsKey("candidates")) {
                List<Map> candidates = (List<Map>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map content = (Map) candidates.get(0).get("content");
                    List<Map> resParts = (List<Map>) content.get("parts");
                    if (!resParts.isEmpty()) {
                        return Optional.of((String) resParts.get(0).get("text"));
                    }
                }
            }
            return Optional.empty();

        } catch (RestClientException e) {
            log.warn("Error calling Gemini API: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
