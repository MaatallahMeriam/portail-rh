package com.example.PORTAIL_RH.feed_service.Reaction_service.Entity;

import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "reactions")
public class Reaction {
    public enum ReactionType {
        LIKE, DISLIKE, LOVE, ANGRY, WOW
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "publication_id", nullable = false)
    private Publication publication;

    @Enumerated(EnumType.STRING)
    private ReactionType type;



}

