package com.easyvote.backend.service;

import com.easyvote.backend.entity.Notification;
import com.easyvote.backend.entity.User;
import com.easyvote.backend.entity.enums.NotificationType;
import com.easyvote.backend.exception.ForbiddenException;
import com.easyvote.backend.repository.NotificationRepository;
import com.easyvote.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void notify(Long userId, NotificationType type, String title, String content, String link) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.warn("Cannot notify user {}, user not found", userId);
            return;
        }

        Notification notification = Notification.builder()
                .user(userOpt.get())
                .type(type)
                .title(title)
                .content(content)
                .link(link)
                .read(false)
                .build();
        
        notificationRepository.save(notification);
        log.info("Notification created for user {}", userId);
    }

    public void notifyAll(NotificationType type, String title, String content, String link) {
        List<User> users = userRepository.findByIsVerifiedTrue();
        int count = 0;
        for (User user : users) {
            Notification notification = Notification.builder()
                    .user(user)
                    .type(type)
                    .title(title)
                    .content(content)
                    .link(link)
                    .read(false)
                    .build();
            notificationRepository.save(notification);
            count++;
        }
        log.info("Notification broadcast sent to {} users", count);
    }

    @Transactional(readOnly = true)
    public List<Notification> getMyNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification non trouvée"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Cette notification ne vous appartient pas");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        for (Notification n : unread) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }
}
