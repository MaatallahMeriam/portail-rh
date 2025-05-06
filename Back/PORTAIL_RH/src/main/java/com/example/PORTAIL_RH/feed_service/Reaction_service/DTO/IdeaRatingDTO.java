package com.example.PORTAIL_RH.feed_service.Reaction_service.DTO;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class IdeaRatingDTO {
    private Long id;
    private Long userId;
    private String userNom;
    private String userPrenom;
    private Long publicationId;
    private Integer rate;
}