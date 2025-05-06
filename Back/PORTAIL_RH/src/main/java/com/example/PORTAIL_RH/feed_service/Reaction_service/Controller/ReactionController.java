package com.example.PORTAIL_RH.feed_service.Reaction_service.Controller;

import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.CommentDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.CommentRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionSummaryDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.IdeaRatingDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.IdeaRatingRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Service.ReactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reactions")
public class ReactionController {

    @Autowired
    private ReactionService reactionService;

    @PostMapping("/like")
    public ResponseEntity<ReactionDTO> createOrUpdateReaction(@RequestBody ReactionRequest reactionRequest) {
        try {
            ReactionDTO reactionDTO = reactionService.createOrUpdateReaction(reactionRequest);
            return new ResponseEntity<>(reactionDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/publication/{publicationId}/likes")
    public ResponseEntity<List<ReactionDTO>> getReactionsByPublicationId(@PathVariable Long publicationId) {
        List<ReactionDTO> reactions = reactionService.getReactionsByPublicationId(publicationId);
        return new ResponseEntity<>(reactions, HttpStatus.OK);
    }

    @GetMapping("/publication/{publicationId}/summary")
    public ResponseEntity<ReactionSummaryDTO> getReactionSummaryByPublicationId(@PathVariable Long publicationId) {
        ReactionSummaryDTO summary = reactionService.getReactionSummaryByPublicationId(publicationId);
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    @DeleteMapping("/user/{userId}/publication/{publicationId}/like")
    public ResponseEntity<Void> deleteReaction(
            @PathVariable Long userId,
            @PathVariable Long publicationId) {
        try {
            reactionService.deleteReaction(userId, publicationId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/comment")
    public ResponseEntity<CommentDTO> createComment(@RequestBody CommentRequest commentRequest) {
        try {
            CommentDTO commentDTO = reactionService.createComment(commentRequest);
            return new ResponseEntity<>(commentDTO, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/publication/{publicationId}/comments")
    public ResponseEntity<List<CommentDTO>> getCommentsByPublicationId(@PathVariable Long publicationId) {
        List<CommentDTO> comments = reactionService.getCommentsByPublicationId(publicationId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    @DeleteMapping("/comment/{commentId}/user/{userId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @PathVariable Long userId) {
        try {
            reactionService.deleteComment(commentId, userId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }

    @PostMapping("/ratings")
    public ResponseEntity<IdeaRatingDTO> createIdeaRating(@RequestBody IdeaRatingRequest ratingRequest) {
        try {
            IdeaRatingDTO ratingDTO = reactionService.createIdeaRating(ratingRequest);
            return new ResponseEntity<>(ratingDTO, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/publication/{publicationId}/ratings")
    public ResponseEntity<List<IdeaRatingDTO>> getIdeaRatingsByPublicationId(@PathVariable Long publicationId) {
        List<IdeaRatingDTO> ratings = reactionService.getIdeaRatingsByPublicationId(publicationId);
        return new ResponseEntity<>(ratings, HttpStatus.OK);
    }
}