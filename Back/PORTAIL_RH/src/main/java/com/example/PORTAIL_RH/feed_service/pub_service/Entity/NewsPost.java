package com.example.PORTAIL_RH.feed_service.pub_service.Entity;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "news_posts")
@PrimaryKeyJoinColumn(name = "publication_id")
public class NewsPost extends Publication {

    private String imageUrl;
    private String titre;
    private String description;

}
