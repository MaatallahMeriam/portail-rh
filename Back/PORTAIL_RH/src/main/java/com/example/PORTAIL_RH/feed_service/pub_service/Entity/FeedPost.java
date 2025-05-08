package com.example.PORTAIL_RH.feed_service.pub_service.Entity;

import jakarta.persistence.*;
import lombok.*;

@Setter
@Getter
@Entity
@Table(name = "feed_posts")
@PrimaryKeyJoinColumn(name = "publication_id")
public class FeedPost extends Publication {

    private String mediaUrl;
    private String content;

    @Lob
    private byte[] document;

}