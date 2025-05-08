package com.example.PORTAIL_RH.feed_service.pub_service.Service.IMPL;

import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Reaction;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.FeedPost;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.IdeeBoitePost;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.NewsPost;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;
import com.example.PORTAIL_RH.feed_service.pub_service.DTO.PublicationDTO;
import com.example.PORTAIL_RH.feed_service.pub_service.DTO.PublicationRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionRequest;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.feed_service.pub_service.Repo.PublicationRepository;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Repo.ReactionRepository;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.feed_service.pub_service.Service.PublicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Date;

@Service
public class PublicationServiceImpl implements PublicationService {

    @Autowired
    private PublicationRepository publicationRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private UsersRepository usersRepository;

    private static final String UPLOAD_DIR = "Uploads/news/"; // Adjusted to match WebConfig case
    private static final String UPLOAD_DIR_IDEE = "Uploads/idee/";
    private static final String UPLOAD_DIR_MEDIA = "Uploads/feed/";

    private PublicationDTO mapToDTO(Publication publication) {
        PublicationDTO dto = new PublicationDTO();
        dto.setId(publication.getId());
        dto.setType(publication.getType());
        dto.setUserId(publication.getUser().getId());
        dto.setUserNom(publication.getUser().getNom());
        dto.setUserPrenom(publication.getUser().getPrenom());

        // Map user photo URL
        String userPhotoUrl = publication.getUser().getImage() != null
                ? ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/" + publication.getUser().getImage().replace("\\", "/"))
                .toUriString()
                : null;
        dto.setUserPhoto(userPhotoUrl);

        dto.setCreatedAt(publication.getCreatedAt());

        if (publication instanceof FeedPost feed) {
            String mediaUrl = feed.getMediaUrl() != null
                    ? ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/Uploads/feed/" + feed.getMediaUrl().substring(UPLOAD_DIR_MEDIA.length()).replace("\\", "/"))
                    .toUriString()
                    : null;
            dto.setMediaUrl(mediaUrl);
            dto.setContent(feed.getContent());
            if (feed.getDocument() != null) {
                dto.setDocumentDownloadUrl(ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/publications/feed/" + publication.getId() + "/document")
                        .toUriString());
            }
        } else if (publication instanceof NewsPost news) {
            String imageUrl = news.getImageUrl() != null
                    ? ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/Uploads/news/" + news.getImageUrl().substring(UPLOAD_DIR.length()).replace("\\", "/"))
                    .toUriString()
                    : null;
            dto.setImageUrl(imageUrl);
            dto.setTitre(news.getTitre());
            dto.setDescription(news.getDescription());
        } else if (publication instanceof IdeeBoitePost idee) {
            String imageUrl = idee.getImage() != null
                    ? ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/Uploads/idee/" + idee.getImage().substring(UPLOAD_DIR_IDEE.length()).replace("\\", "/"))
                    .toUriString()
                    : null;
            dto.setImage(imageUrl);
            dto.setIdee(idee.getIdee());
            dto.setTopic(idee.getTopic());
            dto.setAverageRate(idee.getAverageRate());
        }

        return dto;
    }

    private ReactionDTO mapToReactionDTO(Reaction reaction) {
        ReactionDTO dto = new ReactionDTO();
        dto.setId(reaction.getId());
        dto.setUserId(reaction.getUser().getId());
        dto.setUserNom(reaction.getUser().getNom());
        dto.setPublicationId(reaction.getPublication().getId());
        return dto;
    }

    @Override
    public PublicationDTO createNewsWithImage(MultipartFile image, String titre, String description, Long userId) {
        try {
            Users user = usersRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String uniqueFileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, image.getBytes());

            NewsPost news = new NewsPost();
            news.setImageUrl(uniqueFileName); // Store only the filename
            news.setTitre(titre);
            news.setDescription(description);
            news.setUser(user);
            news.setType(Publication.PublicationType.NEWS);
            news.setCreatedAt(new Date());

            Publication savedNews = publicationRepository.save(news);
            user.addPublication(savedNews);
            usersRepository.save(user);

            return mapToDTO(savedNews);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création de la news avec image", e);
        }
    }

    @Override
    public PublicationDTO createIdeeBoiteWithImage(MultipartFile image, String idee, String topic, Long userId) {
        try {
            Users user = usersRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String uniqueFileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR_IDEE + uniqueFileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, image.getBytes());

            IdeeBoitePost ideePost = new IdeeBoitePost();
            ideePost.setImage(uniqueFileName);
            ideePost.setIdee(idee);
            ideePost.setTopic(topic);
            ideePost.setUser(user);
            ideePost.setType(Publication.PublicationType.BOITE_IDEE);
            ideePost.setCreatedAt(new Date());

            Publication savedIdee = publicationRepository.save(ideePost);
            user.addPublication(savedIdee);
            usersRepository.save(user);

            return mapToDTO(savedIdee);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création de l'idée avec image", e);
        }
    }

    @Override
    public PublicationDTO createPublication(PublicationRequest publicationRequest) {
        Users user = usersRepository.findById(Long.valueOf(publicationRequest.getUserId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Publication publication;
        switch (publicationRequest.getType()) {
            case FEED:
                FeedPost feed = new FeedPost();
                feed.setMediaUrl(publicationRequest.getMediaUrl());
                feed.setContent(publicationRequest.getContent());
                publication = feed;
                break;
            case NEWS:
                NewsPost news = new NewsPost();
                news.setImageUrl(publicationRequest.getImageUrl());
                news.setTitre(publicationRequest.getTitre());
                news.setDescription(publicationRequest.getDescription());
                publication = news;
                break;
            case BOITE_IDEE:
                IdeeBoitePost idee = new IdeeBoitePost();
                idee.setIdee(publicationRequest.getIdee());
                idee.setImage(publicationRequest.getImage());
                idee.setTopic(publicationRequest.getTopic());
                publication = idee;
                break;
            default:
                throw new IllegalArgumentException("Invalid publication type");
        }

        publication.setUser(user);
        publication.setType(publicationRequest.getType());
        publication.setCreatedAt(new Date());

        Publication savedPublication = publicationRepository.save(publication);
        user.addPublication(savedPublication);
        usersRepository.save(user);

        return mapToDTO(savedPublication);
    }

    @Override
    public List<PublicationDTO> getAllPublications() {
        return publicationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PublicationDTO> getPublicationsByUserId(Long userId) {
        return publicationRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PublicationDTO getPublicationById(Long id) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publication not found"));
        return mapToDTO(publication);
    }

    @Override
    public void deletePublication(Long id) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publication not found"));
        Users user = publication.getUser();
        user.removePublication(publication);
        usersRepository.save(user);
        publicationRepository.delete(publication);
    }

    @Override
    public List<ReactionDTO> getReactionsByPublicationId(Long publicationId) {
        return reactionRepository.findByPublicationId(publicationId).stream()
                .map(this::mapToReactionDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PublicationDTO> getAllNews() {
        return publicationRepository.findByType(Publication.PublicationType.NEWS).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PublicationDTO createNews(PublicationRequest publicationRequest) {
        publicationRequest.setType(Publication.PublicationType.NEWS);
        return createPublication(publicationRequest);
    }

    @Override
    public PublicationDTO updateNews(Long id, PublicationRequest publicationRequest) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found"));
        if (!(publication instanceof NewsPost)) {
            throw new IllegalArgumentException("Publication is not a NewsPost");
        }
        NewsPost news = (NewsPost) publication;

        if (publicationRequest.getTitre() != null) {
            news.setTitre(publicationRequest.getTitre());
        }
        if (publicationRequest.getDescription() != null) {
            news.setDescription(publicationRequest.getDescription());
        }
        if (publicationRequest.getImageUrl() != null) {
            news.setImageUrl(publicationRequest.getImageUrl());
        }

        Publication updatedPublication = publicationRepository.save(news);
        return mapToDTO(updatedPublication);
    }

    @Override
    public PublicationDTO updateNewsWithImage(Long id, MultipartFile image, String titre, String description) {
        try {
            Publication publication = publicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("News not found"));
            if (!(publication instanceof NewsPost)) {
                throw new IllegalArgumentException("Publication is not a NewsPost");
            }
            NewsPost news = (NewsPost) publication;

            if (titre != null) {
                news.setTitre(titre);
            }
            if (description != null) {
                news.setDescription(description);
            }

            if (image != null && !image.isEmpty()) {
                String uniqueFileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR + uniqueFileName);
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, image.getBytes());
                news.setImageUrl(uniqueFileName);
            }

            Publication updatedPublication = publicationRepository.save(news);
            return mapToDTO(updatedPublication);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la mise à jour de la news avec image", e);
        }
    }

    @Override
    public void deleteNews(Long id) {
        deletePublication(id);
    }

    @Override
    public List<PublicationDTO> getAllIdeeBoite() {
        return publicationRepository.findByType(Publication.PublicationType.BOITE_IDEE).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PublicationDTO createIdeeBoite(PublicationRequest publicationRequest) {
        publicationRequest.setType(Publication.PublicationType.BOITE_IDEE);
        return createPublication(publicationRequest);
    }

    @Override
    public PublicationDTO updateIdeeBoite(Long id, PublicationRequest publicationRequest) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("IdeeBoite not found"));
        if (!(publication instanceof IdeeBoitePost)) {
            throw new IllegalArgumentException("Publication is not an IdeeBoitePost");
        }
        IdeeBoitePost idee = (IdeeBoitePost) publication;

        if (publicationRequest.getIdee() != null) {
            idee.setIdee(publicationRequest.getIdee());
        }
        if (publicationRequest.getImage() != null) {
            idee.setImage(publicationRequest.getImage());
        }
        if (publicationRequest.getTopic() != null) {
            idee.setTopic(publicationRequest.getTopic());
        }

        Publication updatedPublication = publicationRepository.save(idee);
        return mapToDTO(updatedPublication);
    }

    @Override
    public void deleteIdeeBoite(Long id) {
        deletePublication(id);
    }

    @Override
    public List<PublicationDTO> getAllFeed() {
        return publicationRepository.findByType(Publication.PublicationType.FEED).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PublicationDTO createFeed(PublicationRequest publicationRequest) {
        publicationRequest.setType(Publication.PublicationType.FEED);
        return createPublication(publicationRequest);
    }

    @Override
    public PublicationDTO createFeedWithDocument(Long userId, String content, MultipartFile media, MultipartFile document) {
        try {
            Users user = usersRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            FeedPost feed = new FeedPost();
            feed.setContent(content);
            feed.setUser(user);
            feed.setType(Publication.PublicationType.FEED);
            feed.setCreatedAt(new Date());

            if (media != null && !media.isEmpty()) {
                String uniqueFileName = UUID.randomUUID() + "_" + media.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR_MEDIA + uniqueFileName);
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, media.getBytes());
                feed.setMediaUrl(uniqueFileName);
            }

            if (document != null && !document.isEmpty()) {
                feed.setDocument(document.getBytes());
            }

            Publication savedFeed = publicationRepository.save(feed);
            user.addPublication(savedFeed);
            usersRepository.save(user);

            return mapToDTO(savedFeed);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création du FeedPost avec document", e);
        }
    }

    @Override
    public PublicationDTO updateFeed(Long id, PublicationRequest publicationRequest) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feed not found"));
        if (!(publication instanceof FeedPost)) {
            throw new IllegalArgumentException("Publication is not a FeedPost");
        }
        FeedPost feed = (FeedPost) publication;
        feed.setMediaUrl(publicationRequest.getMediaUrl());
        feed.setContent(publicationRequest.getContent());
        Publication updatedPublication = publicationRepository.save(feed);
        return mapToDTO(updatedPublication);
    }

    @Override
    public PublicationDTO updateFeedWithDocument(Long id, String content, MultipartFile media, MultipartFile document) {
        try {
            Publication publication = publicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Feed not found"));
            if (!(publication instanceof FeedPost)) {
                throw new IllegalArgumentException("Publication is not a FeedPost");
            }
            FeedPost feed = (FeedPost) publication;

            if (content != null) {
                feed.setContent(content);
            }

            if (media != null && !media.isEmpty()) {
                String uniqueFileName = UUID.randomUUID() + "_" + media.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR_MEDIA + uniqueFileName);
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, media.getBytes());
                feed.setMediaUrl(uniqueFileName);
            }

            if (document != null && !document.isEmpty()) {
                feed.setDocument(document.getBytes());
            }

            Publication updatedPublication = publicationRepository.save(feed);
            return mapToDTO(updatedPublication);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la mise à jour du FeedPost avec document", e);
        }
    }

    @Override
    public void deleteFeed(Long id) {
        deletePublication(id);
    }

    @Override
    public byte[] downloadFeedDocument(Long publicationId) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new RuntimeException("FeedPost not found"));
        if (!(publication instanceof FeedPost)) {
            throw new IllegalArgumentException("Publication is not a FeedPost");
        }
        FeedPost feed = (FeedPost) publication;
        return feed.getDocument() != null ? feed.getDocument() : new byte[0];
    }

    @Override
    public ReactionDTO createReaction(ReactionRequest reactionRequest) {
        Users user = usersRepository.findById(reactionRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Publication publication = publicationRepository.findById(reactionRequest.getPublicationId())
                .orElseThrow(() -> new RuntimeException("Publication not found"));

        Reaction reaction = new Reaction();
        reaction.setUser(user);
        reaction.setPublication(publication);

        Reaction savedReaction = reactionRepository.save(reaction);
        user.addReaction(savedReaction);
        publication.addReaction(savedReaction);
        usersRepository.save(user);
        publicationRepository.save(publication);

        return mapToReactionDTO(savedReaction);
    }
}