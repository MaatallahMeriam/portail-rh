package com.example.PORTAIL_RH.feed_service.Reaction_service.Service;

import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.CommentDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.CommentRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionSummaryDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.IdeaRatingDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.IdeaRatingRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.CommentUpdateRequest;

import java.util.List;

public interface ReactionService {
    ReactionDTO createOrUpdateReaction(ReactionRequest reactionRequest);
    List<ReactionDTO> getReactionsByPublicationId(Long publicationId);
    ReactionSummaryDTO getReactionSummaryByPublicationId(Long publicationId);
    void deleteReaction(Long userId, Long publicationId);
    CommentDTO createComment(CommentRequest commentRequest);
    CommentDTO updateComment(Long commentId, CommentUpdateRequest updateRequest);
    List<CommentDTO> getCommentsByPublicationId(Long publicationId);
    void deleteComment(Long commentId, Long userId);
    IdeaRatingDTO createIdeaRating(IdeaRatingRequest ratingRequest);
    List<IdeaRatingDTO> getIdeaRatingsByPublicationId(Long publicationId);
    void deleteIdeaRating(Long userId, Long publicationId);
}