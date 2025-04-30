package com.example.PORTAIL_RH.notification_service.DTO;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String message;
    private String type;
    private Long demandeId;
    private boolean isRead;
    private LocalDateTime createdAt;
    // Added fields for user details
    private String userName; // Full name of the user who triggered the notification
    private String userImage; // URL to the user's profile photo
}