package com.example.PORTAIL_RH.notification_service.Controller;

import com.example.PORTAIL_RH.notification_service.DTO.NotificationDTO;
import com.example.PORTAIL_RH.notification_service.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    // @PreAuthorize("hasAnyRole('RH', 'MANAGER')") // Commenté temporairement
    public List<NotificationDTO> getNotifications(
            @RequestParam Long userId,
            @RequestParam(required = false) Boolean isRead) {
        if (isRead != null) {
            return notificationService.getNotificationsByUserId(userId, isRead);
        } else {
            return notificationService.getNotificationsByUserId(userId);
        }
    }

    @PatchMapping("/{id}/read")
    // @PreAuthorize("hasAnyRole('RH', 'MANAGER')") // Commenté temporairement
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        NotificationDTO notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(notification);
    }

    @PatchMapping("/mark-all-read")
    // @PreAuthorize("hasAnyRole('RH', 'MANAGER')") // Commenté temporairement
    public ResponseEntity<Void> markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}