package com.example.PORTAIL_RH.notification_service.Controller;

import com.example.PORTAIL_RH.notification_service.DTO.ReactionNotificationDTO;
import com.example.PORTAIL_RH.notification_service.Entity.ReactionNotification;
import com.example.PORTAIL_RH.notification_service.Repo.ReactionNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reaction-notifications")
public class ReactionNotificationController {

    @Autowired
    private ReactionNotificationRepository reactionNotificationRepository;

    private ReactionNotificationDTO mapToDTO(ReactionNotification notification) {
        ReactionNotificationDTO dto = new ReactionNotificationDTO();
        dto.setId(notification.getId());
        dto.setRecipientId(notification.getRecipient().getId());
        dto.setActorId(notification.getActorId());
        dto.setActorNom(notification.getActorNom());
        dto.setActorPrenom(notification.getActorPrenom());
        dto.setActorPhoto(notification.getActorPhoto());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setPublicationId(notification.getPublicationId());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setRead(notification.isRead());
        return dto;
    }

    @GetMapping("/{recipientId}")
    public ResponseEntity<List<ReactionNotificationDTO>> getReactionNotifications(@PathVariable Long recipientId) {
        List<ReactionNotification> notifications = reactionNotificationRepository.findByRecipientId(recipientId);
        List<ReactionNotificationDTO> dtos = notifications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markReactionNotificationAsRead(@PathVariable Long notificationId) {
        ReactionNotification notification = reactionNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));
        notification.setRead(true);
        reactionNotificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{recipientId}/read-all")
    public ResponseEntity<Void> markAllReactionNotificationsAsRead(@PathVariable Long recipientId) {
        List<ReactionNotification> notifications = reactionNotificationRepository.findByRecipientId(recipientId);
        notifications.forEach(notification -> notification.setRead(true));
        reactionNotificationRepository.saveAll(notifications);
        return ResponseEntity.ok().build();
    }
}