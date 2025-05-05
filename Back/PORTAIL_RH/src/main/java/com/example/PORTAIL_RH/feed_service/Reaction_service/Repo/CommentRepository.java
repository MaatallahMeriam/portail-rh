package com.example.PORTAIL_RH.feed_service.Reaction_service.Repo;

import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPublicationId(Long publicationId);
}