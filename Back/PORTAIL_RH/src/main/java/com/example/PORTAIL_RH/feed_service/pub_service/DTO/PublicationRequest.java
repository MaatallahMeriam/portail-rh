package com.example.PORTAIL_RH.feed_service.pub_service.DTO;

import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication.PublicationType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PublicationRequest {

    private PublicationType type;
    private String userId;

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
}