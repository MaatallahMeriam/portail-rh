package com.example.PORTAIL_RH.feed_service.Reaction_service.Service.IMPL;

import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Reaction;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Repo.ReactionRepository;
import com.example.PORTAIL_RH.feed_service.pub_service.Repo.PublicationRepository;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Service.ReactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReactionServiceImpl implements ReactionService {

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PublicationRepository publicationRepository;

    @Override
    public Reaction createReaction(ReactionRequest reactionRequest) {
        // Récupérer l'utilisateur
        Users user = usersRepository.findById(reactionRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Récupérer la publication
        Publication publication = publicationRepository.findById(reactionRequest.getPublicationId())
                .orElseThrow(() -> new RuntimeException("Publication not found"));

        // Créer la réaction
        Reaction reaction = new Reaction();
        reaction.setUser(user);
        reaction.setPublication(publication);
        reaction.setType(reactionRequest.getType());

        return reactionRepository.save(reaction);
    }

    @Override
    public List<Reaction> getReactionsByPublicationId(Long publicationId) {
        return reactionRepository.findByPublicationId(publicationId);
    }

    @Override
    public void deleteReaction(Long id) {
        reactionRepository.deleteById(id);
    }
}