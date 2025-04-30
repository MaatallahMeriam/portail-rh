package com.example.PORTAIL_RH.feed_service.Reaction_service.DTO;

import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Reaction.ReactionType;
import lombok.Data;

@Data
public class ReactionDTO {
    private Long id;
    private Long userId;
    private String userNom; // Limité aux détails de l'utilisateur
    private Long publicationId;
    private ReactionType type;
}