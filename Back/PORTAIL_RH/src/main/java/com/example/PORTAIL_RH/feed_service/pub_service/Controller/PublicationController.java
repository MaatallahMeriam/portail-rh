package com.example.PORTAIL_RH.feed_service.pub_service.Controller;

import com.example.PORTAIL_RH.feed_service.pub_service.DTO.PublicationDTO;
import com.example.PORTAIL_RH.feed_service.pub_service.DTO.PublicationRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionRequest;
import com.example.PORTAIL_RH.feed_service.pub_service.Service.PublicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/publications")
public class PublicationController {

    @Autowired
    private PublicationService publicationService;

    @PostMapping
    public ResponseEntity<PublicationDTO> createPublication(@RequestBody PublicationRequest publicationRequest) {
        PublicationDTO createdPublication = publicationService.createPublication(publicationRequest);
        return new ResponseEntity<>(createdPublication, HttpStatus.CREATED);
    }

    @PostMapping(value = "/news/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PublicationDTO> createNewsWithImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam("userId") Long userId) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(null);
            }
            PublicationDTO createdNews = publicationService.createNewsWithImage(image, titre, description, userId);
            return new ResponseEntity<>(createdNews, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping(value = "/idee-boite/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PublicationDTO> createIdeeBoiteWithImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam("idee") String idee,
            @RequestParam("topic") String topic,
            @RequestParam("userId") Long userId) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(null);
            }
            PublicationDTO createdIdee = publicationService.createIdeeBoiteWithImage(image, idee, topic, userId);
            return new ResponseEntity<>(createdIdee, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<PublicationDTO>> getAllPublications() {
        List<PublicationDTO> publications = publicationService.getAllPublications();
        return new ResponseEntity<>(publications, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PublicationDTO>> getPublicationsByUserId(@PathVariable Long userId) {
        List<PublicationDTO> publications = publicationService.getPublicationsByUserId(userId);
        return new ResponseEntity<>(publications, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicationDTO> getPublicationById(@PathVariable Long id) {
        PublicationDTO publication = publicationService.getPublicationById(id);
        return new ResponseEntity<>(publication, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePublication(@PathVariable Long id) {
        publicationService.deletePublication(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{id}/reactions")
    public ResponseEntity<List<ReactionDTO>> getReactionsByPublicationId(@PathVariable Long id) {
        List<ReactionDTO> reactions = publicationService.getReactionsByPublicationId(id);
        return new ResponseEntity<>(reactions, HttpStatus.OK);
    }

    @GetMapping("/news")
    public ResponseEntity<List<PublicationDTO>> getAllNews() {
        List<PublicationDTO> news = publicationService.getAllNews();
        return new ResponseEntity<>(news, HttpStatus.OK);
    }

    @PostMapping("/news")
    public ResponseEntity<PublicationDTO> createNews(@RequestBody PublicationRequest publicationRequest) {
        PublicationDTO createdNews = publicationService.createNews(publicationRequest);
        return new ResponseEntity<>(createdNews, HttpStatus.CREATED);
    }

    @PutMapping(value = "/news/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PublicationDTO> updateNewsWithImage(
            @PathVariable Long id,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "titre", required = false) String titre,
            @RequestParam(value = "description", required = false) String description) {
        try {
            PublicationDTO updatedNews = publicationService.updateNewsWithImage(id, image, titre, description);
            return new ResponseEntity<>(updatedNews, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping(value = "/news/{id}/json", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PublicationDTO> updateNews(
            @PathVariable Long id,
            @RequestBody PublicationRequest publicationRequest) {
        PublicationDTO updatedNews = publicationService.updateNews(id, publicationRequest);
        return new ResponseEntity<>(updatedNews, HttpStatus.OK);
    }

    @PutMapping(value = "/idee-boite/{id}/json", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PublicationDTO> updateIdeeBoiteJson(
            @PathVariable Long id,
            @RequestBody PublicationRequest publicationRequest) {
        PublicationDTO updatedIdee = publicationService.updateIdeeBoite(id, publicationRequest);
        return new ResponseEntity<>(updatedIdee, HttpStatus.OK);
    }

    @DeleteMapping("/news/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        publicationService.deleteNews(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/idee-boite")
    public ResponseEntity<List<PublicationDTO>> getAllIdeeBoite() {
        List<PublicationDTO> idees = publicationService.getAllIdeeBoite();
        return new ResponseEntity<>(idees, HttpStatus.OK);
    }

    @PostMapping("/idee-boite")
    public ResponseEntity<PublicationDTO> createIdeeBoite(@RequestBody PublicationRequest publicationRequest) {
        PublicationDTO createdIdee = publicationService.createIdeeBoite(publicationRequest);
        return new ResponseEntity<>(createdIdee, HttpStatus.CREATED);
    }

    @PutMapping("/idee-boite/{id}")
    public ResponseEntity<PublicationDTO> updateIdeeBoite(@PathVariable Long id, @RequestBody PublicationRequest publicationRequest) {
        PublicationDTO updatedIdee = publicationService.updateIdeeBoite(id, publicationRequest);
        return new ResponseEntity<>(updatedIdee, HttpStatus.OK);
    }

    @DeleteMapping("/idee-boite/{id}")
    public ResponseEntity<Void> deleteIdeeBoite(@PathVariable Long id) {
        publicationService.deleteIdeeBoite(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PublicationDTO>> getAllFeed() {
        List<PublicationDTO> feeds = publicationService.getAllFeed();
        return new ResponseEntity<>(feeds, HttpStatus.OK);
    }

    @PostMapping("/feed")
    public ResponseEntity<PublicationDTO> createFeed(@RequestBody PublicationRequest publicationRequest) {
        PublicationDTO createdFeed = publicationService.createFeed(publicationRequest);
        return new ResponseEntity<>(createdFeed, HttpStatus.CREATED);
    }

    @PutMapping("/feed/{id}")
    public ResponseEntity<PublicationDTO> updateFeed(@PathVariable Long id, @RequestBody PublicationRequest publicationRequest) {
        PublicationDTO updatedFeed = publicationService.updateFeed(id, publicationRequest);
        return new ResponseEntity<>(updatedFeed, HttpStatus.OK);
    }

    @DeleteMapping("/feed/{id}")
    public ResponseEntity<Void> deleteFeed(@PathVariable Long id) {
        publicationService.deleteFeed(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/reactions")
    public ResponseEntity<ReactionDTO> createReaction(@RequestBody ReactionRequest reactionRequest) {
        ReactionDTO createdReaction = publicationService.createReaction(reactionRequest);
        return new ResponseEntity<>(createdReaction, HttpStatus.CREATED);
    }


}