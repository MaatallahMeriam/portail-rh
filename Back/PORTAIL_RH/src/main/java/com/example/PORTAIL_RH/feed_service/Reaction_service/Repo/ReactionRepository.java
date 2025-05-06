package com.example.PORTAIL_RH.feed_service.Reaction_service.Repo;

import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    List<Reaction> findByPublicationId(Long publicationId);
    Optional<Reaction> findByUserIdAndPublicationId(Long userId, Long publicationId);
    @Modifying
    @Query("DELETE FROM Reaction r WHERE r.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}