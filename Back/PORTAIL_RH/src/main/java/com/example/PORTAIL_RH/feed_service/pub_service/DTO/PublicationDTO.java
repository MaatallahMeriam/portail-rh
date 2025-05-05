package com.example.PORTAIL_RH.feed_service.pub_service.DTO;

import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication.PublicationType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

@Data
public class PublicationDTO {
    private Long id;
    private PublicationType type;
    private Long userId;
    private String userNom;
    private String userPrenom;
    private String userPhoto;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "UTC")
    private Date createdAt;

    // Spécifique à FeedPost
    private String mediaUrl;
    private String content;

    // Spécifique à NewsPost
    private String imageUrl;
    private String titre;
    private String description;

    // Spécifique à IdeeBoitePost
    private String idee;
    private String image;
    private String topic;
    private Double averageRating; // Average rating for IdeeBoitePost
}