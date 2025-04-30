package com.example.PORTAIL_RH.feed_service.pub_service.Entity;
import jakarta.persistence.*;
import lombok.*;


@Setter
@Getter
@Entity
@Table(name = "idee_boite_posts")
@PrimaryKeyJoinColumn(name = "publication_id")
public class IdeeBoitePost extends Publication {

    private String idee;
}

