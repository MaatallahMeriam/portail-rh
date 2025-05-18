package com.example.PORTAIL_RH.feed_service.pub_service.Entity;

import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.IdeaRating;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
@Setter
@Getter
@Entity
@Table(name = "idee_boite_posts")
@PrimaryKeyJoinColumn(name = "publication_id")
public class IdeeBoitePost extends Publication {

    @Column(name = "idee", nullable = false, length = 1000) // Increased length to 1000
    private String idee;

    @Column(name = "image")
    private String image;

    @Column(name = "topic", nullable = false, length = 500) // Increased length to 500
    private String topic;

    @Column(name = "average_rate", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer averageRate = 0;

    public void recalculateAverageRate() {
        List<IdeaRating> ratings = getRatings();
        if (ratings == null || ratings.isEmpty()) {
            this.averageRate = 0;
            return;
        }

        double sum = ratings.stream()
                .mapToInt(IdeaRating::getRate)
                .sum();
        double average = sum / ratings.size();
        this.averageRate = (int) Math.round(average);
    }
}