package com.example.PORTAIL_RH.notification_service.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationWebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public void sendReactionNotification(Long recipientId, Object notification) {
        try {
            String message = objectMapper.writeValueAsString(notification);
            messagingTemplate.convertAndSend("/topic/reaction-notifications/" + recipientId, message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send WebSocket notification", e);
        }
    }
}