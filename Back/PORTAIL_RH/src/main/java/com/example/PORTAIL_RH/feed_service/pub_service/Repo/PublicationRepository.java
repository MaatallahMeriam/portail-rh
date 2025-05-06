package com.example.PORTAIL_RH.feed_service.pub_service.Repo;

import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication.PublicationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PublicationRepository extends JpaRepository<Publication, Long> {
    List<Publication> findByUserId(Long userId);
    List<Publication> findByType(PublicationType type);
    @Modifying
    @Query("DELETE FROM Publication p WHERE p.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}