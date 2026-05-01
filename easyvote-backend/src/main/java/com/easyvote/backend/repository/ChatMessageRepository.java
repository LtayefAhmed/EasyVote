package com.easyvote.backend.repository;

import com.easyvote.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByUserIdAndSessionIdOrderByCreatedAtAsc(Long userId, String sessionId);

    List<ChatMessage> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}
