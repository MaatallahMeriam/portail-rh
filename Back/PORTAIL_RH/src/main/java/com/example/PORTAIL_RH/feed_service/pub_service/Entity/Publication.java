package com.example.PORTAIL_RH.feed_service.pub_service.Entity;

import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Comment;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.IdeaRating;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Reaction;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "publications")
@Inheritance(strategy = InheritanceType.JOINED)
public class Publication {


    public enum PublicationType {
        FEED, NEWS, BOITE_IDEE
    }

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PublicationType type;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt = new Date();

    @OneToMany(mappedBy = "publication", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reaction> reactions = new ArrayList<>();

    @OneToMany(mappedBy = "publication", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "publication", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IdeaRating> ratings = new ArrayList<>();

    // Synchronisation avec Reaction
    public void addReaction(Reaction reaction) {
        reactions.add(reaction);
        reaction.setPublication(this);
    }

    public void removeReaction(Reaction reaction) {
        reactions.remove(reaction);
        reaction.setPublication(null);
    }

    // Synchronisation avec Comment
    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setPublication(this);
    }

    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setPublication(null);
    }

    // Synchronisation avec IdeaRating
    public void addIdeaRating(IdeaRating rating) {
        ratings.add(rating);
        rating.setPublication(this);
    }

    public void removeIdeaRating(IdeaRating rating) {
        ratings.remove(rating);
        rating.setPublication(null);
    }
}