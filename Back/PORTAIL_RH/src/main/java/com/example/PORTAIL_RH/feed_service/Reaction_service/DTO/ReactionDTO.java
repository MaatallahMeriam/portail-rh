package com.example.PORTAIL_RH.feed_service.Reaction_service.DTO;

import lombok.Data;

@Data
public class ReactionDTO {
    private Long id;
    private Long userId;
    private String userNom;
    private String userPrenom;
    private Long publicationId;
}