package com.example.PORTAIL_RH.feed_service.Reaction_service.DTO;

import lombok.Data;

@Data
public class CommentRequest {
    private Long userId;
    private Long publicationId;
    private String content;
}