package com.example.PORTAIL_RH.notification_service.DTO;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReactionNotificationDTO {
    private Long id;
    private Long recipientId;
    private Long actorId;
    private String actorNom;
    private String actorPrenom;
    private String actorPhoto;
    private String message;
    private String type;
    private Long publicationId;
    private LocalDateTime createdAt;
    private boolean isRead;
}