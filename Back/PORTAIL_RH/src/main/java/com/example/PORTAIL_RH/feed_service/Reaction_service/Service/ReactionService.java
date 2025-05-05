package com.example.PORTAIL_RH.feed_service.Reaction_service.Service;

import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.CommentDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.CommentRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionSummaryDTO;

import java.util.List;

public interface ReactionService {
    ReactionDTO createOrUpdateReaction(ReactionRequest reactionRequest);
    List<ReactionDTO> getReactionsByPublicationId(Long publicationId);
    ReactionSummaryDTO getReactionSummaryByPublicationId(Long publicationId);
    void deleteReaction(Long userId, Long publicationId);

    // Comment-related methods
    CommentDTO createComment(CommentRequest commentRequest);
    List<CommentDTO> getCommentsByPublicationId(Long publicationId);
    void deleteComment(Long commentId, Long userId);
}