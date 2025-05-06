package com.example.PORTAIL_RH.feed_service.pub_service.DTO;

import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Setter
@Getter
public class PublicationDTO {
    private Long id;
    private Publication.PublicationType type;
    private Long userId;
    private String userNom;
    private String userPrenom;
    private String userPhoto;
    private Date createdAt;
    private String mediaUrl;
    private String content;
    private String imageUrl;
    private String titre;
    private String description;
    private String idee;
    private String image;
    private String topic;
    private Integer averageRate;
}