package com.example.PORTAIL_RH.feed_service.Reaction_service.Repo;

import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.IdeaRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IdeaRatingRepository extends JpaRepository<IdeaRating, Long> {
    List<IdeaRating> findByPublicationId(Long publicationId);
}