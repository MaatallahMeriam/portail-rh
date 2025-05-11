package com.example.PORTAIL_RH.notification_service.Controller;


import com.example.PORTAIL_RH.notification_service.DTO.PointageNotificationDTO;
import com.example.PORTAIL_RH.notification_service.Service.PointageNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/teletravail/notifications")
public class PointageNotificationController {

    @Autowired
    private PointageNotificationService notificationService;

    @GetMapping("/check")
    public ResponseEntity<PointageNotificationDTO> checkPendingNotification(
            @RequestParam Long userId,
            @RequestParam String date) {
        PointageNotificationDTO notification = notificationService.checkPendingPointageNotification(userId, LocalDate.parse(date));
        if (notification == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(notification);
    }

    @PostMapping("/acknowledge/{notificationId}")
    public ResponseEntity<Void> acknowledgeNotification(@PathVariable Long notificationId) {
        notificationService.acknowledgeNotification(notificationId);
        return ResponseEntity.ok().build();
    }
}