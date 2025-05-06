package com.example.PORTAIL_RH.feed_service.Reaction_service.Service.IMPL;

import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.CommentDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.CommentRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionSummaryDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.IdeaRatingDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.IdeaRatingRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Comment;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Reaction;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.IdeaRating;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.IdeeBoitePost;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Repo.CommentRepository;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Repo.ReactionRepository;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Repo.IdeaRatingRepository;
import com.example.PORTAIL_RH.feed_service.pub_service.Repo.PublicationRepository;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Service.ReactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReactionServiceImpl implements ReactionService {

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private IdeaRatingRepository ideaRatingRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PublicationRepository publicationRepository;

    private ReactionDTO mapToDTO(Reaction reaction) {
        ReactionDTO dto = new ReactionDTO();
        dto.setId(reaction.getId());
        dto.setUserId(reaction.getUser().getId());
        dto.setUserNom(reaction.getUser().getNom());
        dto.setUserPrenom(reaction.getUser().getPrenom());
        return dto;
    }

    private CommentDTO mapToCommentDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setUserId(comment.getUser().getId());
        dto.setUserNom(comment.getUser().getNom());
        dto.setUserPrenom(comment.getUser().getPrenom());
        String imageUrl = comment.getUser().getImage() != null
                ? ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/" + comment.getUser().getImage().replace("\\", "/"))
                .toUriString()
                : null;
        dto.setUserPhoto(imageUrl);
        dto.setPublicationId(comment.getPublication().getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }

    private IdeaRatingDTO mapToIdeaRatingDTO(IdeaRating rating) {
        IdeaRatingDTO dto = new IdeaRatingDTO();
        dto.setId(rating.getId());
        dto.setUserId(rating.getUser().getId());
        dto.setUserNom(rating.getUser().getNom());
        dto.setUserPrenom(rating.getUser().getPrenom());
        dto.setPublicationId(rating.getPublication().getId());
        dto.setRate(rating.getRate());
        return dto;
    }

    @Override
    @Transactional
    public ReactionDTO createOrUpdateReaction(ReactionRequest reactionRequest) {
        if (reactionRequest.getUserId() == null || reactionRequest.getPublicationId() == null) {
            throw new IllegalArgumentException("User ID and Publication ID cannot be null");
        }

        Users user = usersRepository.findById(reactionRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + reactionRequest.getUserId()));
        Publication publication = publicationRepository.findById(reactionRequest.getPublicationId())
                .orElseThrow(() -> new RuntimeException("Publication not found with ID: " + reactionRequest.getPublicationId()));

        Optional<Reaction> existingReaction = reactionRepository.findByUserIdAndPublicationId(
                reactionRequest.getUserId(), reactionRequest.getPublicationId());

        Reaction reaction;
        if (existingReaction.isPresent()) {
            reaction = existingReaction.get();
        } else {
            reaction = new Reaction();
            reaction.setUser(user);
            reaction.setPublication(publication);
            user.addReaction(reaction);
            publication.addReaction(reaction);
        }

        Reaction savedReaction = reactionRepository.save(reaction);
        usersRepository.save(user);
        publicationRepository.save(publication);

        return mapToDTO(savedReaction);
    }

    @Override
    public List<ReactionDTO> getReactionsByPublicationId(Long publicationId) {
        if (publicationId == null) {
            throw new IllegalArgumentException("Publication ID cannot be null");
        }
        return reactionRepository.findByPublicationId(publicationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ReactionSummaryDTO getReactionSummaryByPublicationId(Long publicationId) {
        if (publicationId == null) {
            throw new IllegalArgumentException("Publication ID cannot be null");
        }
        List<Reaction> reactions = reactionRepository.findByPublicationId(publicationId);

        long totalLikes = reactions.size();

        ReactionSummaryDTO summary = new ReactionSummaryDTO();
        summary.setPublicationId(publicationId);
        summary.setTotalLikes(totalLikes);

        return summary;
    }

    @Override
    @Transactional
    public void deleteReaction(Long userId, Long publicationId) {
        if (userId == null || publicationId == null) {
            throw new IllegalArgumentException("User ID and Publication ID cannot be null");
        }

        Optional<Reaction> reactionOptional = reactionRepository.findByUserIdAndPublicationId(userId, publicationId);
        Reaction reaction = reactionOptional.orElseThrow(() -> new RuntimeException(
                "Reaction not found for user ID: " + userId + " and publication ID: " + publicationId));

        Users user = reaction.getUser();
        Publication publication = reaction.getPublication();

        user.removeReaction(reaction);
        publication.removeReaction(reaction);

        usersRepository.save(user);
        publicationRepository.save(publication);
        reactionRepository.delete(reaction);
    }

    @Override
    @Transactional
    public CommentDTO createComment(CommentRequest commentRequest) {
        if (commentRequest.getUserId() == null || commentRequest.getPublicationId() == null || commentRequest.getContent() == null || commentRequest.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("User ID, Publication ID, and Content cannot be null or empty");
        }

        Users user = usersRepository.findById(commentRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + commentRequest.getUserId()));
        Publication publication = publicationRepository.findById(commentRequest.getPublicationId())
                .orElseThrow(() -> new RuntimeException("Publication not found with ID: " + commentRequest.getPublicationId()));

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPublication(publication);
        comment.setContent(commentRequest.getContent());

        Comment savedComment = commentRepository.save(comment);
        return mapToCommentDTO(savedComment);
    }

    @Override
    public List<CommentDTO> getCommentsByPublicationId(Long publicationId) {
        if (publicationId == null) {
            throw new IllegalArgumentException("Publication ID cannot be null");
        }
        return commentRepository.findByPublicationId(publicationId).stream()
                .map(this::mapToCommentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        if (commentId == null || userId == null) {
            throw new IllegalArgumentException("Comment ID and User ID cannot be null");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with ID: " + commentId));

        if (!comment.getUser().getId().equals(userId)) {
            throw new SecurityException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    @Override
    @Transactional
    public IdeaRatingDTO createIdeaRating(IdeaRatingRequest ratingRequest) {
        if (ratingRequest.getUserId() == null || ratingRequest.getPublicationId() == null || ratingRequest.getRate() == null) {
            throw new IllegalArgumentException("User ID, Publication ID, and Rate cannot be null");
        }
        if (ratingRequest.getRate() < 1 || ratingRequest.getRate() > 5) {
            throw new IllegalArgumentException("Rate must be between 1 and 5");
        }

        Users user = usersRepository.findById(ratingRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + ratingRequest.getUserId()));
        Publication publication = publicationRepository.findById(ratingRequest.getPublicationId())
                .orElseThrow(() -> new RuntimeException("Publication not found with ID: " + ratingRequest.getPublicationId()));

        if (!(publication instanceof IdeeBoitePost)) {
            throw new IllegalArgumentException("Ratings can only be applied to IdeeBoitePost");
        }

        Optional<IdeaRating> existingRating = ideaRatingRepository.findByUserIdAndPublicationId(
                ratingRequest.getUserId(), ratingRequest.getPublicationId());

        IdeaRating rating;
        if (existingRating.isPresent()) {
            rating = existingRating.get();
            rating.setRate(ratingRequest.getRate());
        } else {
            rating = new IdeaRating();
            rating.setUser(user);
            rating.setPublication(publication);
            rating.setRate(ratingRequest.getRate());
            user.addIdeaRating(rating);
            publication.addIdeaRating(rating);
        }

        IdeaRating savedRating = ideaRatingRepository.save(rating);
        usersRepository.save(user);

        IdeeBoitePost ideePost = (IdeeBoitePost) publication;
        ideePost.recalculateAverageRate();
        publicationRepository.save(ideePost);

        return mapToIdeaRatingDTO(savedRating);
    }

    @Override
    public List<IdeaRatingDTO> getIdeaRatingsByPublicationId(Long publicationId) {
        if (publicationId == null) {
            throw new IllegalArgumentException("Publication ID cannot be null");
        }
        return ideaRatingRepository.findByPublicationId(publicationId).stream()
                .map(this::mapToIdeaRatingDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteIdeaRating(Long userId, Long publicationId) {
        if (userId == null || publicationId == null) {
            throw new IllegalArgumentException("User ID and Publication ID cannot be null");
        }

        Optional<IdeaRating> ratingOptional = ideaRatingRepository.findByUserIdAndPublicationId(userId, publicationId);
        IdeaRating rating = ratingOptional.orElseThrow(() -> new RuntimeException(
                "Rating not found for user ID: " + userId + " and publication ID: " + publicationId));

        Users user = rating.getUser();
        Publication publication = rating.getPublication();

        user.removeIdeaRating(rating);
        publication.removeIdeaRating(rating);

        usersRepository.save(user);
        ideaRatingRepository.delete(rating);

        if (publication instanceof IdeeBoitePost) {
            IdeeBoitePost ideePost = (IdeeBoitePost) publication;
            ideePost.recalculateAverageRate();
            publicationRepository.save(ideePost);
        }
    }
}