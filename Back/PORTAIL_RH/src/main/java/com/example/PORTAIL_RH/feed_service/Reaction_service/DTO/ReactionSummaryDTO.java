package com.example.PORTAIL_RH.feed_service.Reaction_service.DTO;

import lombok.Data;

@Data
public class ReactionSummaryDTO {
    private Long publicationId;
    private Long totalLikes; // Total number of likes
}