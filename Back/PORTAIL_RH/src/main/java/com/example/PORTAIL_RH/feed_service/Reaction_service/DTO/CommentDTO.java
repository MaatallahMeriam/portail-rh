package com.example.PORTAIL_RH.feed_service.Reaction_service.DTO;

import lombok.Data;

import java.util.Date;

@Data
public class CommentDTO {
    private Long id;
    private Long userId;
    private String userNom;
    private String userPrenom;
    private String userPhoto; // Added userPhoto field
    private Long publicationId;
    private String content;
    private Date createdAt;
}