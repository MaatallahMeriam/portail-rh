package com.example.PORTAIL_RH.notification_service.Entity;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user; // The recipient of the notification

    private String message;

    private String type;

    private Long demandeId;

    private boolean isRead;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "triggered_by_user_id")
    private Users triggeredByUser; // The user who triggered the notification
}