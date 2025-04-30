package com.example.PORTAIL_RH.feed_service.Reaction_service.Service;

import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Reaction;

import java.util.List;

public interface ReactionService {
    Reaction createReaction(ReactionRequest reactionRequest);
    List<Reaction> getReactionsByPublicationId(Long publicationId);
    void deleteReaction(Long id);
}