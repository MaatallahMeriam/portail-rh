package com.example.PORTAIL_RH.feed_service.Reaction_service.DTO;

import lombok.Data;

@Data
public class ReactionRequest {
    private Long userId;
    private Long publicationId;
}