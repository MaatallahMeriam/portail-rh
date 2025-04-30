package com.example.PORTAIL_RH.feed_service.pub_service.Repo;

import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication.PublicationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PublicationRepository extends JpaRepository<Publication, Long> {
    List<Publication> findByUserId(Long userId);
    List<Publication> findByType(PublicationType type);
}