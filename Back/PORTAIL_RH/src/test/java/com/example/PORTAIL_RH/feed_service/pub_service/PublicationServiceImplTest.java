package com.example.PORTAIL_RH.feed_service.pub_service;

import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Reaction;
import com.example.PORTAIL_RH.feed_service.pub_service.DTO.PublicationDTO;
import com.example.PORTAIL_RH.feed_service.pub_service.DTO.PublicationRequest;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.FeedPost;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.IdeeBoitePost;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.NewsPost;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication;
import com.example.PORTAIL_RH.feed_service.pub_service.Repo.PublicationRepository;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionDTO;
import com.example.PORTAIL_RH.feed_service.Reaction_service.DTO.ReactionRequest;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Repo.ReactionRepository;
import com.example.PORTAIL_RH.feed_service.pub_service.Service.IMPL.PublicationServiceImpl;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import jakarta.servlet.http.HttpServletRequest; // Updated import
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Date;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicationServiceImplTest {

    @Mock
    private PublicationRepository publicationRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private ReactionRepository reactionRepository;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private PublicationServiceImpl publicationService;

    private Users user;
    private NewsPost newsPost;
    private FeedPost feedPost;
    private IdeeBoitePost ideeBoitePost;
    private Reaction reaction;
    private MultipartFile imageFile;
    private MultipartFile documentFile;

    @BeforeEach
    void setUp() throws IOException {
        // Setup user
        user = new Users();
        user.setId(1L);
        user.setNom("Doe");
        user.setPrenom("John");
        user.setImage("user_images/john_doe.jpg");

        // Setup NewsPost
        newsPost = new NewsPost();
        newsPost.setId(1L);
        newsPost.setType(Publication.PublicationType.NEWS);
        newsPost.setUser(user);
        newsPost.setTitre("News Title");
        newsPost.setDescription("News Description");
        newsPost.setImageUrl("news_image.jpg");
        newsPost.setCreatedAt(new Date());

        // Setup FeedPost
        feedPost = new FeedPost();
        feedPost.setId(2L);
        feedPost.setType(Publication.PublicationType.FEED);
        feedPost.setUser(user);
        feedPost.setContent("Feed Content");
        feedPost.setMediaUrl("feed_media.jpg");
        feedPost.setDocument(new byte[]{1, 2, 3});
        feedPost.setCreatedAt(new Date());

        // Setup IdeeBoitePost
        ideeBoitePost = new IdeeBoitePost();
        ideeBoitePost.setId(3L);
        ideeBoitePost.setType(Publication.PublicationType.BOITE_IDEE);
        ideeBoitePost.setUser(user);
        ideeBoitePost.setIdee("Great Idea");
        ideeBoitePost.setTopic("Innovation");
        ideeBoitePost.setImage("idee_image.jpg");
        ideeBoitePost.setAverageRate(4);
        ideeBoitePost.setCreatedAt(new Date());

        // Setup Reaction
        reaction = new Reaction();
        reaction.setId(1L);
        reaction.setUser(user);
        reaction.setPublication(newsPost);

        // Setup MultipartFile mocks
        imageFile = new MockMultipartFile("image", "test.jpg", "image/jpeg", "test image".getBytes());
        documentFile = new MockMultipartFile("document", "test.pdf", "application/pdf", "test document".getBytes());

        // Setup ServletRequestAttributes
        ServletRequestAttributes attributes = new ServletRequestAttributes(request);
        RequestContextHolder.setRequestAttributes(attributes);
    }

    @AfterEach
    void tearDown() {
        // Clear all mocks and request attributes
        reset(publicationRepository, usersRepository, reactionRepository, request);
        RequestContextHolder.resetRequestAttributes();
    }

    private void setupFileMocks() {
        try (var mockedFiles = mockStatic(Files.class)) {
            mockedFiles.when(() -> Files.createDirectories(any(Path.class))).thenReturn(mock(Path.class));
            mockedFiles.when(() -> Files.write(any(Path.class), any(byte[].class))).thenReturn(mock(Path.class));
        }
    }

    private void setupUriBuilderMock() {
        try (var mockedStatic = mockStatic(ServletUriComponentsBuilder.class)) {
            ServletUriComponentsBuilder uriBuilder = mock(ServletUriComponentsBuilder.class);
            lenient().when(ServletUriComponentsBuilder.fromCurrentContextPath()).thenReturn(uriBuilder);
            lenient().when(uriBuilder.path(anyString())).thenReturn(uriBuilder);
            lenient().when(uriBuilder.toUriString()).thenReturn("http://localhost/Uploads/news/test.jpg");
        }
    }

    @Test
    void testCreateNewsWithImage_Success() throws IOException {
        // Arrange
        setupFileMocks();
        setupUriBuilderMock();
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(publicationRepository.save(any(NewsPost.class))).thenReturn(newsPost);
        when(usersRepository.save(any(Users.class))).thenReturn(user);

        // Act
        PublicationDTO result = publicationService.createNewsWithImage(imageFile, "News Title", "News Description", 1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getType()).isEqualTo(Publication.PublicationType.NEWS);
        assertThat(result.getTitre()).isEqualTo("News Title");
        assertThat(result.getDescription()).isEqualTo("News Description");
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getUserNom()).isEqualTo("Doe");
        assertThat(result.getUserPrenom()).isEqualTo("John");
        verify(publicationRepository, times(1)).save(any(NewsPost.class));
        verify(usersRepository, times(1)).save(user);
    }

    @Test
    void testCreateNewsWithImage_UserNotFound() {
        // Arrange
        setupFileMocks();
        setupUriBuilderMock();
        when(usersRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> publicationService.createNewsWithImage(imageFile, "News Title", "News Description", 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Erreur lors de la création de la news avec image")
                .hasCauseInstanceOf(RuntimeException.class)
                .hasRootCauseMessage("User not found");
        verify(publicationRepository, never()).save(any());
    }

    @Test
    void testCreateIdeeBoiteWithImage_Success() throws IOException {
        // Arrange
        setupFileMocks();
        setupUriBuilderMock();
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(publicationRepository.save(any(IdeeBoitePost.class))).thenReturn(ideeBoitePost);
        when(usersRepository.save(any(Users.class))).thenReturn(user);

        // Act
        PublicationDTO result = publicationService.createIdeeBoiteWithImage(imageFile, "Great Idea", "Innovation", 1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(3L);
        assertThat(result.getType()).isEqualTo(Publication.PublicationType.BOITE_IDEE);
        assertThat(result.getIdee()).isEqualTo("Great Idea");
        assertThat(result.getTopic()).isEqualTo("Innovation");
        assertThat(result.getAverageRate()).isEqualTo(4);
        verify(publicationRepository, times(1)).save(any(IdeeBoitePost.class));
        verify(usersRepository, times(1)).save(user);
    }

    @Test
    void testCreateFeedWithDocument_Success() throws IOException {
        // Arrange
        setupFileMocks();
        setupUriBuilderMock();
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(publicationRepository.save(any(FeedPost.class))).thenReturn(feedPost);
        when(usersRepository.save(any(Users.class))).thenReturn(user);

        // Act
        PublicationDTO result = publicationService.createFeedWithDocument(1L, "Feed Content", imageFile, documentFile);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getType()).isEqualTo(Publication.PublicationType.FEED);
        assertThat(result.getContent()).isEqualTo("Feed Content");
        assertThat(result.getDocumentDownloadUrl()).contains("/api/publications/feed/2/document");
        verify(publicationRepository, times(1)).save(any(FeedPost.class));
        verify(usersRepository, times(1)).save(user);
    }

    @Test
    void testGetAllPublications_Success() {
        // Arrange
        setupUriBuilderMock();
        when(publicationRepository.findAll()).thenReturn(Arrays.asList(newsPost, feedPost, ideeBoitePost));

        // Act
        var result = publicationService.getAllPublications();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getType()).isEqualTo(Publication.PublicationType.NEWS);
        assertThat(result.get(1).getType()).isEqualTo(Publication.PublicationType.FEED);
        assertThat(result.get(2).getType()).isEqualTo(Publication.PublicationType.BOITE_IDEE);
        verify(publicationRepository, times(1)).findAll();
    }

    @Test
    void testGetPublicationsByUserId_Success() {
        // Arrange
        setupUriBuilderMock();
        when(publicationRepository.findByUserId(1L)).thenReturn(Arrays.asList(newsPost, feedPost));

        // Act
        var result = publicationService.getPublicationsByUserId(1L);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getUserId()).isEqualTo(1L);
        assertThat(result.get(1).getUserId()).isEqualTo(1L);
        verify(publicationRepository, times(1)).findByUserId(1L);
    }

    @Test
    void testGetPublicationById_Success() {
        // Arrange
        setupUriBuilderMock();
        when(publicationRepository.findById(1L)).thenReturn(Optional.of(newsPost));

        // Act
        PublicationDTO result = publicationService.getPublicationById(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getType()).isEqualTo(Publication.PublicationType.NEWS);
        verify(publicationRepository, times(1)).findById(1L);
    }

    @Test
    void testGetPublicationById_NotFound() {
        // Arrange
        setupUriBuilderMock();
        when(publicationRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> publicationService.getPublicationById(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Publication not found");
        verify(publicationRepository, times(1)).findById(1L);
    }

    @Test
    void testDeletePublication_Success() {
        // Arrange
        when(publicationRepository.findById(1L)).thenReturn(Optional.of(newsPost));
        when(usersRepository.save(any(Users.class))).thenReturn(user);
        doNothing().when(publicationRepository).delete(newsPost);

        // Act
        publicationService.deletePublication(1L);

        // Assert
        verify(publicationRepository, times(1)).findById(1L);
        verify(usersRepository, times(1)).save(user);
        verify(publicationRepository, times(1)).delete(newsPost);
    }

    @Test
    void testGetReactionsByPublicationId_Success() {
        // Arrange
        when(reactionRepository.findByPublicationId(1L)).thenReturn(Arrays.asList(reaction));

        // Act
        var result = publicationService.getReactionsByPublicationId(1L);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPublicationId()).isEqualTo(1L);
        assertThat(result.get(0).getUserId()).isEqualTo(1L);
        verify(reactionRepository, times(1)).findByPublicationId(1L);
    }

    @Test
    void testCreateReaction_Success() {
        // Arrange
        ReactionRequest request = new ReactionRequest();
        request.setUserId(1L);
        request.setPublicationId(1L);

        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(publicationRepository.findById(1L)).thenReturn(Optional.of(newsPost));
        when(reactionRepository.save(any(Reaction.class))).thenReturn(reaction);
        when(usersRepository.save(any(Users.class))).thenReturn(user);
        when(publicationRepository.save(any(Publication.class))).thenReturn(newsPost);

        // Act
        ReactionDTO result = publicationService.createReaction(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getPublicationId()).isEqualTo(1L);
        verify(reactionRepository, times(1)).save(any(Reaction.class));
        verify(usersRepository, times(1)).save(user);
        verify(publicationRepository, times(1)).save(newsPost);
    }

    @Test
    void testUpdateNewsWithImage_Success() throws IOException {
        // Arrange
        setupFileMocks();
        setupUriBuilderMock();
        when(publicationRepository.findById(1L)).thenReturn(Optional.of(newsPost));
        when(publicationRepository.save(any(NewsPost.class))).thenReturn(newsPost);

        // Act
        PublicationDTO result = publicationService.updateNewsWithImage(1L, imageFile, "Updated Title", "Updated Description");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTitre()).isEqualTo("Updated Title");
        assertThat(result.getDescription()).isEqualTo("Updated Description");
        verify(publicationRepository, times(1)).save(any(NewsPost.class));
    }

    @Test
    void testUpdateFeedWithDocument_Success() throws IOException {
        // Arrange
        setupFileMocks();
        setupUriBuilderMock();
        when(publicationRepository.findById(2L)).thenReturn(Optional.of(feedPost));
        when(publicationRepository.save(any(FeedPost.class))).thenReturn(feedPost);

        // Act
        PublicationDTO result = publicationService.updateFeedWithDocument(2L, "Updated Content", imageFile, documentFile);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEqualTo("Updated Content");
        verify(publicationRepository, times(1)).save(any(FeedPost.class));
    }

    @Test
    void testDownloadFeedDocument_Success() {
        // Arrange
        when(publicationRepository.findById(2L)).thenReturn(Optional.of(feedPost));

        // Act
        byte[] result = publicationService.downloadFeedDocument(2L);

        // Assert
        assertThat(result).isEqualTo(new byte[]{1, 2, 3});
        verify(publicationRepository, times(1)).findById(2L);
    }

    @Test
    void testGetAllNews_Success() {
        // Arrange
        setupUriBuilderMock();
        when(publicationRepository.findByType(Publication.PublicationType.NEWS)).thenReturn(Arrays.asList(newsPost));

        // Act
        var result = publicationService.getAllNews();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo(Publication.PublicationType.NEWS);
        verify(publicationRepository, times(1)).findByType(Publication.PublicationType.NEWS);
    }

    @Test
    void testGetAllIdeeBoite_Success() {
        // Arrange
        setupUriBuilderMock();
        when(publicationRepository.findByType(Publication.PublicationType.BOITE_IDEE)).thenReturn(Arrays.asList(ideeBoitePost));

        // Act
        var result = publicationService.getAllIdeeBoite();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo(Publication.PublicationType.BOITE_IDEE);
        verify(publicationRepository, times(1)).findByType(Publication.PublicationType.BOITE_IDEE);
    }

    @Test
    void testGetAllFeed_Success() {
        // Arrange
        setupUriBuilderMock();
        when(publicationRepository.findByType(Publication.PublicationType.FEED)).thenReturn(Arrays.asList(feedPost));

        // Act
        var result = publicationService.getAllFeed();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo(Publication.PublicationType.FEED);
        verify(publicationRepository, times(1)).findByType(Publication.PublicationType.FEED);
    }

    @Test
    void testCreatePublication_Feed_Success() {
        // Arrange
        setupUriBuilderMock();
        PublicationRequest request = new PublicationRequest();
        request.setType(Publication.PublicationType.FEED);
        request.setUserId("1");
        request.setContent("Feed Content");
        request.setMediaUrl("feed_media.jpg");

        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(publicationRepository.save(any(FeedPost.class))).thenReturn(feedPost);
        when(usersRepository.save(any(Users.class))).thenReturn(user);

        // Act
        PublicationDTO result = publicationService.createPublication(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getType()).isEqualTo(Publication.PublicationType.FEED);
        assertThat(result.getContent()).isEqualTo("Feed Content");
        verify(publicationRepository, times(1)).save(any(FeedPost.class));
        verify(usersRepository, times(1)).save(user);
    }

    @Test
    void testUpdateNews_Success() {
        // Arrange
        setupUriBuilderMock();
        PublicationRequest request = new PublicationRequest();
        request.setTitre("Updated Title");
        request.setDescription("Updated Description");

        when(publicationRepository.findById(1L)).thenReturn(Optional.of(newsPost));
        when(publicationRepository.save(any(NewsPost.class))).thenReturn(newsPost);

        // Act
        var result = publicationService.updateNews(1L, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTitre()).isEqualTo("Updated Title");
        assertThat(result.getDescription()).isEqualTo("Updated Description");
        verify(publicationRepository, times(1)).save(any(NewsPost.class));
    }

    @Test
    void testUpdateFeed_Success() {
        // Arrange
        setupUriBuilderMock();
        PublicationRequest request = new PublicationRequest();
        request.setContent("Updated Content");
        request.setMediaUrl("updated_media.jpg");

        when(publicationRepository.findById(2L)).thenReturn(Optional.of(feedPost));
        when(publicationRepository.save(any(FeedPost.class))).thenReturn(feedPost);

        // Act
        var result = publicationService.updateFeed(2L, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEqualTo("Updated Content");
        verify(publicationRepository, times(1)).save(any(FeedPost.class));
    }
}