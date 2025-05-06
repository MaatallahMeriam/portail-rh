package com.example.PORTAIL_RH.feed_service.Reaction_service.DTO;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class IdeaRatingRequest {
    private Long userId;
    private Long publicationId;
    private Integer rate;
}