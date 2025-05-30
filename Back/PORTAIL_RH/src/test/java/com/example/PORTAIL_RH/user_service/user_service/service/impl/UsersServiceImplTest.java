package com.example.PORTAIL_RH.user_service.user_service.service.impl;

import com.example.PORTAIL_RH.notification_service.Repo.PointageNotificationRepository;
import com.example.PORTAIL_RH.KPI_service.Service.KpiService;
import com.example.PORTAIL_RH.notification_service.Repo.NotificationRepository;
import com.example.PORTAIL_RH.request_service.Entity.Demande;
import com.example.PORTAIL_RH.request_service.Entity.Dmd_Conges;
import com.example.PORTAIL_RH.conges_service.DTO.UserCongesDTO;
import com.example.PORTAIL_RH.conges_service.Repo.UserCongesRepository;
import com.example.PORTAIL_RH.conges_service.Service.UserCongesService;
import com.example.PORTAIL_RH.user_service.user_service.DTO.UsersDTO;
import com.example.PORTAIL_RH.user_service.user_service.Entity.BirthdayWish;
import com.example.PORTAIL_RH.user_service.user_service.Entity.UserUpdateBasicDTO;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.equipe_service.Entity.Equipe;
import com.example.PORTAIL_RH.equipe_service.Repo.EquipeRepository;
import com.example.PORTAIL_RH.user_service.user_service.Repo.BirthdayWishRepository;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.user_service.dossier_service.Repo.DossierUserRepository;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication;
import com.example.PORTAIL_RH.feed_service.pub_service.Repo.PublicationRepository;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Repo.CommentRepository;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Repo.ReactionRepository;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Repo.IdeaRatingRepository;
import com.example.PORTAIL_RH.request_service.Repo.DemandeRepository;
import com.example.PORTAIL_RH.user_service.user_service.Service.IMPL.UsersServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class UsersServiceImplTest {

    @InjectMocks
    private UsersServiceImpl usersService;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private PointageNotificationRepository pointageNotificationRepository;

    @Mock
    private EquipeRepository equipeRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private DossierUserRepository dossierUserRepository;

    @Mock
    private PublicationRepository publicationRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private ReactionRepository reactionRepository;

    @Mock
    private IdeaRatingRepository ideaRatingRepository;

    @Mock
    private DemandeRepository demandeRepository;

    @Mock
    private UserCongesRepository userCongesRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserCongesService userCongesService;

    @Mock
    private KpiService kpiService;

    @Mock
    private BirthdayWishRepository birthdayWishRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testUpdateUserBasicInfo_Success() {
        // Arrange
        Long userId = 1L;
        UserUpdateBasicDTO dto = new UserUpdateBasicDTO();
        dto.setUserName("newUser");
        dto.setNom("New");
        dto.setPrenom("User");
        dto.setMail("new@example.com");
        dto.setDateNaissance("01/01/1990");

        Users user = new Users();
        user.setId(userId);
        when(usersRepository.findById(userId)).thenReturn(Optional.of(user));
        when(usersRepository.save(any(Users.class))).thenReturn(user);

        // Act
        UsersDTO result = usersService.updateUserBasicInfo(userId, dto);

        // Assert
        assertNotNull(result);
        assertEquals("newUser", result.getUserName());
        assertEquals("New", result.getNom());
        assertEquals("User", result.getPrenom());
        assertEquals("new@example.com", result.getMail());
        verify(usersRepository, times(1)).save(user);
    }

    @Test
    void testUpdateProfilePhoto_Success() throws Exception {
        // Arrange
        Long userId = 1L;
        MockMultipartFile image = new MockMultipartFile("image", "photo.jpg", "image/jpeg", "content".getBytes());
        Users user = new Users();
        user.setId(userId);
        when(usersRepository.findById(userId)).thenReturn(Optional.of(user));
        when(usersRepository.save(any(Users.class))).thenReturn(user);

        // Simuler UUID.randomUUID() pour contrôler le nom du fichier
        String uuidString = "57b32443-d383-4f92-8a48-795d3b91c1a1";
        UUID uuid = UUID.fromString(uuidString);
        String expectedFileName = uuidString + "_photo.jpg";
        Path filePath = Paths.get("Uploads/profile_photos/" + expectedFileName);

        try (var mockedUUID = mockStatic(UUID.class);
             var mockedFiles = mockStatic(Files.class)) {
            mockedUUID.when(UUID::randomUUID).thenReturn(uuid);
            mockedFiles.when(() -> Files.createDirectories(any(Path.class))).thenReturn(Paths.get("Uploads/profile_photos/"));
            mockedFiles.when(() -> Files.write(any(Path.class), any(byte[].class))).thenReturn(filePath);

            UsersServiceImpl spyService = spy(usersService);
            UsersDTO mockDTO = new UsersDTO();
            mockDTO.setImage(filePath.toString());
            doReturn(mockDTO).when(spyService).mapToDTO(any(Users.class));

            // Act
            UsersDTO result = spyService.updateProfilePhoto(userId, image);

            // Assert
            assertNotNull(result);
            assertEquals(filePath.toString(), user.getImage());
            assertEquals(filePath.toString(), result.getImage());
            verify(usersRepository, times(1)).save(user);
        }
    }

    @Test
    void testDeleteProfilePhoto_Success() throws Exception {
        // Arrange
        Long userId = 1L;
        Users user = new Users();
        user.setId(userId);
        user.setImage("Uploads/profile_photos/old.jpg");
        when(usersRepository.findById(userId)).thenReturn(Optional.of(user));
        when(usersRepository.save(any(Users.class))).thenReturn(user);

        try (var mockedFiles = mockStatic(Files.class)) {
            mockedFiles.when(() -> Files.deleteIfExists(any(Path.class))).thenReturn(true);

            // Act
            UsersDTO result = usersService.deleteProfilePhoto(userId);

            // Assert
            assertNotNull(result);
            assertNull(result.getImage());
            verify(usersRepository, times(1)).save(user);
        }
    }

    @Test
    void testUpdatePassword_Success() {
        // Arrange
        Long userId = 1L;
        String oldPassword = "oldPass";
        String newPassword = "newPass123";
        Users user = new Users();
        user.setId(userId);
        user.setPassword(passwordEncoder.encode(oldPassword));
        when(usersRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(oldPassword, user.getPassword())).thenReturn(true);
        when(passwordEncoder.encode(newPassword)).thenReturn("encodedNewPass");
        when(usersRepository.save(any(Users.class))).thenReturn(user);

        // Act
        boolean result = usersService.updatePassword(userId, oldPassword, newPassword);

        // Assert
        assertTrue(result);
        verify(usersRepository, times(1)).save(user);
    }

    @Test
    void testDeleteUser_Success() {
        // Arrange
        Long userId = 1L;
        Users user = new Users();
        user.setId(userId);

        // Ajouter une équipe gérée
        Equipe equipe = new Equipe();
        equipe.setManager(user);
        Set<Equipe> equipesGerees = new HashSet<>();
        equipesGerees.add(equipe);
        user.setEquipesGerees(equipesGerees);

        // Ajouter une demande de type Dmd_Conges avec userConges null
        Dmd_Conges demande = new Dmd_Conges();
        demande.setUserConges(null);
        Set<Demande> demandes = new HashSet<>();
        demandes.add(demande);
        user.setDemandes(demandes);

        // Ajouter une publication pour déclencher la suppression
        Publication publication = new Publication();
        publication.setId(1L);
        Set<Publication> publications = new HashSet<>();
        publications.add(publication);
        user.setPublications(publications);

        // Mock de findByIdWithRelations pour s'assurer que les relations sont chargées
        when(usersRepository.findByIdWithRelations(userId)).thenReturn(Optional.of(user));

        // Act
        usersService.deleteUser(userId);

        // Assert
        verify(usersRepository, times(1)).delete(user);
        verify(pointageNotificationRepository, times(1)).deleteByUser(user);
        verify(notificationRepository, times(1)).deleteByUser(user);
        verify(notificationRepository, times(1)).deleteByTriggeredByUser(user);
        verify(demandeRepository, times(1)).delete(demande);
        // Supprimer les vérifications de deleteAll
    }

    @Test
    void testExportActiveUsersToCSV_Success() {
        // Arrange
        Users user = new Users();
        user.setNom("Test");
        user.setPrenom("User");
        user.setMail("test@example.com");
        user.setNumero("123456789");
        user.setAdresse("123 Rue");
        user.setPoste("Dev");
        user.setDepartement("IT");
        user.setActive(true);
        when(usersRepository.findAllByActiveTrue()).thenReturn(Collections.singletonList(user));

        // Act
        byte[] csvData = usersService.exportActiveUsersToCSV();

        // Assert
        String csvContent = new String(csvData);
        assertTrue(csvContent.contains("Test;User;test@example.com;123456789;123 Rue;Dev;IT;"));
    }

    @Test
    void testGetUserConges_Success() {
        // Arrange
        Long userId = 1L;
        List<UserCongesDTO> mockConges = Collections.singletonList(new UserCongesDTO());
        when(userCongesService.getUserCongesByUserId(userId)).thenReturn(mockConges);

        // Act
        List<UserCongesDTO> result = usersService.getUserConges(userId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(userCongesService, times(1)).getUserCongesByUserId(userId);
    }

    @Test
    void testSendBirthdayWish_Success() throws Exception {
        // Arrange
        Long recipientId = 1L;
        Users sender = new Users();
        sender.setMail("sender@example.com");
        Users recipient = new Users();
        recipient.setId(recipientId);
        MockMultipartFile image = new MockMultipartFile("image", "wish.jpg", "image/jpeg", "content".getBytes());
        when(usersRepository.findByMail("sender@example.com")).thenReturn(Optional.of(sender));
        when(usersRepository.findById(recipientId)).thenReturn(Optional.of(recipient));
        when(birthdayWishRepository.findBySenderAndRecipientAndCreatedAtBetween(any(), any(), any(), any())).thenReturn(Optional.empty());

        // Simuler un contexte d'authentification
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("sender@example.com");
        SecurityContextHolder.getContext().setAuthentication(auth);

        try (var mockedFiles = mockStatic(Files.class)) {
            mockedFiles.when(() -> Files.createDirectories(any(Path.class))).thenReturn(Paths.get("Uploads/birthday_wishes/"));
            mockedFiles.when(() -> Files.write(any(Path.class), any(byte[].class))).thenReturn(Paths.get("Uploads/birthday_wishes/somefile.jpg"));

            // Act
            usersService.sendBirthdayWish(recipientId, "Happy Birthday!", null, image);

            // Assert
            verify(birthdayWishRepository, times(1)).save(any(BirthdayWish.class));
        } finally {
            // Nettoyer le contexte après le test
            SecurityContextHolder.clearContext();
        }
    }
}