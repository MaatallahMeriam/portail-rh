package com.example.PORTAIL_RH.feed_service.Reaction_service.DTO;

import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Reaction.ReactionType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReactionRequest {
    private Long userId; // ID de l'utilisateur qui réagit
    private Long publicationId; // ID de la publication
    private ReactionType type; // Type de réaction (LIKE, DISLIKE, etc.)
}