package com.example.PORTAIL_RH.feed_service.Reaction_service.Repo;

import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    List<Reaction> findByPublicationId(Long publicationId);
}