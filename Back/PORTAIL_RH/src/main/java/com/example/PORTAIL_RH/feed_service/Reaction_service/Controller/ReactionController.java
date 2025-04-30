package com.example.PORTAIL_RH.feed_service.Reaction_service.Controller;

import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Reaction;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Service.ReactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reactions")
public class ReactionController {

    @Autowired
    private ReactionService reactionService;

    @PostMapping
    public Reaction createReaction(@RequestBody ReactionRequest reactionRequest) {
        return reactionService.createReaction(reactionRequest);
    }

    @GetMapping("/publication/{publicationId}")
    public List<Reaction> getReactionsByPublicationId(@PathVariable Long publicationId) {
        return reactionService.getReactionsByPublicationId(publicationId);
    }

    @DeleteMapping("/{id}")
    public void deleteReaction(@PathVariable Long id) {
        reactionService.deleteReaction(id);
    }
}