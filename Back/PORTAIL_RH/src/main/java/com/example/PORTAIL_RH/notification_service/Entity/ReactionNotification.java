package com.example.PORTAIL_RH.notification_service.Entity;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "reaction_notifications")
public class ReactionNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private Users recipient;

    @Column(name = "actor_id", nullable = false)
    private Long actorId;

    @Column(name = "actor_nom", nullable = false)
    private String actorNom;

    @Column(name = "actor_prenom", nullable = false)
    private String actorPrenom;

    @Column(name = "actor_photo")
    private String actorPhoto;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String type; // e.g., "LIKE", "COMMENT"

    @Column(name = "publication_id", nullable = false)
    private Long publicationId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;
}