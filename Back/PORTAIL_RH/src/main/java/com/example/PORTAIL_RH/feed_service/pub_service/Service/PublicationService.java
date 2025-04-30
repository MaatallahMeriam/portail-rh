package com.example.PORTAIL_RH.feed_service.pub_service.Service;

import com.example.PORTAIL_RH.feed_service.pub_service.DTO.PublicationDTO;
import com.example.PORTAIL_RH.feed_service.pub_service.DTO.PublicationRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PublicationService {
    // CRUD général des publications
    PublicationDTO createPublication(PublicationRequest publicationRequest);
    List<PublicationDTO> getAllPublications();
    List<PublicationDTO> getPublicationsByUserId(Long userId);
    PublicationDTO getPublicationById(Long id);
    void deletePublication(Long id);

    // Liste des réactions sur une publication
    List<ReactionDTO> getReactionsByPublicationId(Long publicationId);
    PublicationDTO updateNewsWithImage(Long id, MultipartFile image, String titre, String description);
    // CRUD spécifique par type
    List<PublicationDTO> getAllNews();
    PublicationDTO createNews(PublicationRequest publicationRequest);
    PublicationDTO updateNews(Long id, PublicationRequest publicationRequest);
    void deleteNews(Long id);
    PublicationDTO createNewsWithImage(MultipartFile image, String titre, String description, Long userId);

    List<PublicationDTO> getAllIdeeBoite();
    PublicationDTO createIdeeBoite(PublicationRequest publicationRequest);
    PublicationDTO updateIdeeBoite(Long id, PublicationRequest publicationRequest);
    void deleteIdeeBoite(Long id);

    List<PublicationDTO> getAllFeed();
    PublicationDTO createFeed(PublicationRequest publicationRequest);
    PublicationDTO updateFeed(Long id, PublicationRequest publicationRequest);
    void deleteFeed(Long id);

    // Gestion des réactions
    ReactionDTO createReaction(ReactionRequest reactionRequest);
    void deleteReaction(Long id);
}