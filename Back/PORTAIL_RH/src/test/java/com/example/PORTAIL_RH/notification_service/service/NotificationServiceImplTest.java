package com.example.PORTAIL_RH.notification_service.service;

import com.example.PORTAIL_RH.notification_service.DTO.NotificationDTO;
import com.example.PORTAIL_RH.notification_service.DTO.PointageNotificationDTO;
import com.example.PORTAIL_RH.notification_service.Entity.Notification;
import com.example.PORTAIL_RH.notification_service.Entity.PointageNotification;
import com.example.PORTAIL_RH.notification_service.Service.IMPL.NotificationServiceImpl;
import com.example.PORTAIL_RH.notification_service.Service.IMPL.PointageNotificationServiceImpl;
import com.example.PORTAIL_RH.request_service.Entity.Demande;
import com.example.PORTAIL_RH.teletravail_service.entity.UserTeletravail;
import com.example.PORTAIL_RH.equipe_service.Entity.Equipe;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.notification_service.Repo.NotificationRepository;
import com.example.PORTAIL_RH.notification_service.Repo.PointageNotificationRepository;
import com.example.PORTAIL_RH.teletravail_service.repo.UserTeletravailRepository;
import com.example.PORTAIL_RH.teletravail_service.repo.TeletravailPointageRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private PointageNotificationRepository pointageNotificationRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private UserTeletravailRepository userTeletravailRepository;

    @Mock
    private TeletravailPointageRepository pointageRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @InjectMocks
    private PointageNotificationServiceImpl pointageNotificationService;

    private Users user;
    private Users manager;
    private Users rh;
    private Demande demande;
    private Equipe equipe;
    private Notification notification;
    private PointageNotification pointageNotification;
    private UserTeletravail userTeletravail;

    @BeforeEach
    void setUp() {
        user = new Users();
        user.setId(1L);
        user.setNom("Doe");
        user.setPrenom("John");
        user.setImage("user_images/john_doe.jpg");
        user.setRole(Users.Role.COLLAB);

        manager = new Users();
        manager.setId(2L);
        manager.setNom("Smith");
        manager.setPrenom("Jane");
        manager.setImage("user_images/jane_smith.jpg");
        manager.setRole(Users.Role.MANAGER);

        rh = new Users();
        rh.setId(3L);
        rh.setNom("Brown");
        rh.setPrenom("Bob");
        rh.setImage("user_images/bob_brown.jpg");
        rh.setRole(Users.Role.RH);

        equipe = new Equipe();
        equipe.setId(1L);
        equipe.setNom("Team A");
        equipe.setManager(manager);

        user.setEquipe(equipe);

        demande = new Demande();
        demande.setId(1L);
        demande.setUser(user);
        demande.setType(Demande.DemandeType.CONGES);

        notification = new Notification();
        notification.setId(1L);
        notification.setUser(manager);
        notification.setMessage("Membre John Doe a soumis une demande de congé");
        notification.setType("CONGES");
        notification.setDemandeId(1L);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setTriggeredByUser(user);

        pointageNotification = new PointageNotification();
        pointageNotification.setId(1L);
        pointageNotification.setUser(user);
        pointageNotification.setPointageDate(LocalDate.now());
        pointageNotification.setIsAcknowledged(false);

        userTeletravail = new UserTeletravail();
        userTeletravail.setId(1L);
        userTeletravail.setUser(user);
        userTeletravail.setJoursChoisis(Collections.singletonList(LocalDate.now().toString()));

        when(request.getScheme()).thenReturn("http");
        when(request.getServerName()).thenReturn("localhost");
        when(request.getServerPort()).thenReturn(80);
        when(request.getContextPath()).thenReturn("");
        ServletRequestAttributes attributes = new ServletRequestAttributes(request);
        RequestContextHolder.setRequestAttributes(attributes);
    }

    @AfterEach
    void tearDown() {
        reset(notificationRepository, pointageNotificationRepository, usersRepository,
                userTeletravailRepository, pointageRepository, messagingTemplate, request);
        RequestContextHolder.resetRequestAttributes();
    }

    private void setupUriBuilderMock() {
        try (MockedStatic<ServletUriComponentsBuilder> uriBuilderMock = mockStatic(ServletUriComponentsBuilder.class)) {
            ServletUriComponentsBuilder uriBuilder = mock(ServletUriComponentsBuilder.class);
            uriBuilderMock.when(ServletUriComponentsBuilder::fromCurrentContextPath).thenReturn(uriBuilder);
            when(uriBuilder.path(anyString())).thenAnswer(invocation -> {
                String path = invocation.getArgument(0);
                when(uriBuilder.toUriString()).thenReturn("http://localhost" + path);
                return uriBuilder;
            });
        }
    }

    @Test
    void testCreateNotificationForUser_WithTriggeredByUser_Success() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));

        notificationService.createNotificationForUser(manager, "Test message", "TEST", 1L, user);

        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(messagingTemplate, times(1)).convertAndSendToUser(
                eq(String.valueOf(manager.getId())),
                eq("/notifications"),
                any(NotificationDTO.class)
        );
    }

    @Test
    void testCreateNotificationForUser_WithoutTriggeredByUser_Success() {
        Notification noTriggerNotification = new Notification();
        noTriggerNotification.setId(1L);
        noTriggerNotification.setUser(manager);
        noTriggerNotification.setMessage("Test message");
        noTriggerNotification.setType("TEST");
        noTriggerNotification.setDemandeId(1L);
        noTriggerNotification.setRead(false);
        noTriggerNotification.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.save(any(Notification.class))).thenReturn(noTriggerNotification);

        notificationService.createNotificationForUser(manager, "Test message", "TEST", 1L);

        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(messagingTemplate, times(1)).convertAndSendToUser(
                eq(String.valueOf(manager.getId())),
                eq("/notifications"),
                any(NotificationDTO.class)
        );
    }

    @Test
    void testCreateNotificationForRole_Conges_Success() {
        demande.setType(Demande.DemandeType.CONGES);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        notificationService.createNotificationForRole(demande);

        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(messagingTemplate, times(1)).convertAndSendToUser(
                eq(String.valueOf(manager.getId())),
                eq("/notifications"),
                any(NotificationDTO.class)
        );
    }

    @Test
    void testCreateNotificationForRole_Logistique_Success() {
        demande.setType(Demande.DemandeType.LOGISTIQUE);
        when(usersRepository.findByRole(Users.Role.RH)).thenReturn(Arrays.asList(rh));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        notificationService.createNotificationForRole(demande);

        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(messagingTemplate, times(1)).convertAndSendToUser(
                eq(String.valueOf(rh.getId())),
                eq("/notifications"),
                any(NotificationDTO.class)
        );
    }

    @Test
    void testCreateNotificationForRole_NoEquipe_ThrowsException() {
        demande.setType(Demande.DemandeType.CONGES);
        user.setEquipe(null);

        assertThatThrownBy(() -> notificationService.createNotificationForRole(demande))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("L'utilisateur n'appartient à aucune équipe");
    }

    @Test
    void testCreateNotificationForRole_NoManager_ThrowsException() {
        demande.setType(Demande.DemandeType.CONGES);
        equipe.setManager(null);

        assertThatThrownBy(() -> notificationService.createNotificationForRole(demande))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Aucun manager assigné à l'équipe de l'utilisateur");
    }

    @Test
    void testNotifyRequesterStatusChange_WithTriggeredByUser_Success() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        notificationService.notifyRequesterStatusChange(demande, "APPROVED", manager);

        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(messagingTemplate, times(1)).convertAndSendToUser(
                eq(String.valueOf(user.getId())),
                eq("/notifications"),
                any(NotificationDTO.class)
        );
    }

    @Test
    void testNotifyRequesterStatusChange_WithoutTriggeredByUser_Success() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        notificationService.notifyRequesterStatusChange(demande, "APPROVED", null);

        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(messagingTemplate, times(1)).convertAndSendToUser(
                eq(String.valueOf(user.getId())),
                eq("/notifications"),
                any(NotificationDTO.class)
        );
    }

    @Test
    void testCreateNotificationForRoleUsers_Success() {
        when(usersRepository.findByRole(Users.Role.RH)).thenReturn(Arrays.asList(rh));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        notificationService.createNotificationForRoleUsers(Users.Role.RH, "Test message", "TEST", 1L);

        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(messagingTemplate, times(1)).convertAndSendToUser(
                eq(String.valueOf(rh.getId())),
                eq("/notifications"),
                any(NotificationDTO.class)
        );
    }

    @Test
    void testGetNotificationsByUserId_WithIsRead_Success() {
        when(notificationRepository.findByUserIdAndIsRead(eq(2L), eq(false), any(Sort.class)))
                .thenReturn(Arrays.asList(notification));

        List<NotificationDTO> result = notificationService.getNotificationsByUserId(2L, false);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getUserImage()).isEqualTo("http://localhost/user_images/john_doe.jpg");
        assertThat(result.get(0).getUserName()).isEqualTo("John Doe");
    }

    @Test
    void testGetNotificationsByUserId_All_Success() {
        when(notificationRepository.findByUserId(eq(2L), any(Sort.class)))
                .thenReturn(Arrays.asList(notification));

        List<NotificationDTO> result = notificationService.getNotificationsByUserId(2L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getUserImage()).isEqualTo("http://localhost/user_images/john_doe.jpg");
        assertThat(result.get(0).getUserName()).isEqualTo("John Doe");
    }

    @Test
    void testMarkAsRead_Success() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationDTO result = notificationService.markAsRead(1L);

        assertThat(result).isNotNull();
        assertThat(result.isRead()).isTrue();
        assertThat(result.getUserImage()).isEqualTo("http://localhost/user_images/john_doe.jpg");
        assertThat(result.getUserName()).isEqualTo("John Doe");
        verify(notificationRepository, times(1)).save(notification);
    }

    @Test
    void testMarkAsRead_NotFound_ThrowsException() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Notification non trouvée");
    }

    @Test
    void testMarkAllAsRead_Success() {
        when(notificationRepository.findByUserIdAndIsRead(eq(2L), eq(false)))
                .thenReturn(Arrays.asList(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        Notification updatedNotification = new Notification();
        updatedNotification.setId(1L);
        updatedNotification.setUser(manager);
        updatedNotification.setMessage("Membre John Doe a soumis une demande de congé");
        updatedNotification.setType("CONGES");
        updatedNotification.setDemandeId(1L);
        updatedNotification.setRead(true);
        updatedNotification.setCreatedAt(LocalDateTime.now());
        updatedNotification.setTriggeredByUser(user);
        when(notificationRepository.findByUserId(eq(2L), any(Sort.class)))
                .thenReturn(Arrays.asList(updatedNotification));

        notificationService.markAllAsRead(2L);

        verify(notificationRepository, times(1)).save(notification);
        List<NotificationDTO> result = notificationService.getNotificationsByUserId(2L);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).isRead()).isTrue();
        assertThat(result.get(0).getUserImage()).isEqualTo("http://localhost/user_images/john_doe.jpg");
        assertThat(result.get(0).getUserName()).isEqualTo("John Doe");
    }

    @Test
    void testMarkAllAsRead_NoUnreadNotifications_Success() {
        when(notificationRepository.findByUserIdAndIsRead(eq(2L), eq(false)))
                .thenReturn(Collections.emptyList());
        when(notificationRepository.findByUserId(eq(2L), any(Sort.class)))
                .thenReturn(Collections.emptyList());

        notificationService.markAllAsRead(2L);

        verify(notificationRepository, never()).save(any(Notification.class));
        List<NotificationDTO> result = notificationService.getNotificationsByUserId(2L);
        assertThat(result).isEmpty();
    }

    @Test
    void testCheckPendingPointageNotification_NoTeletravail_ReturnsNull() {
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userTeletravailRepository.findByUserIdAndJoursChoisisContaining(eq(1L), eq(LocalDate.now().toString())))
                .thenReturn(Optional.empty());

        PointageNotificationDTO result = pointageNotificationService.checkPendingPointageNotification(1L, LocalDate.now());

        assertThat(result).isNull();
    }

    @Test
    void testCheckPendingPointageNotification_ExistingPointage_ReturnsNull() {
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userTeletravailRepository.findByUserIdAndJoursChoisisContaining(eq(1L), eq(LocalDate.now().toString())))
                .thenReturn(Optional.of(userTeletravail));
        when(pointageRepository.existsByUserAndPointageDate(user, LocalDate.now())).thenReturn(true);

        PointageNotificationDTO result = pointageNotificationService.checkPendingPointageNotification(1L, LocalDate.now());

        assertThat(result).isNull();
    }

    @Test
    void testCheckPendingPointageNotification_NewNotification_Success() {
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userTeletravailRepository.findByUserIdAndJoursChoisisContaining(eq(1L), eq(LocalDate.now().toString())))
                .thenReturn(Optional.of(userTeletravail));
        when(pointageRepository.existsByUserAndPointageDate(user, LocalDate.now())).thenReturn(false);
        when(pointageNotificationRepository.findByUserAndPointageDateAndIsAcknowledgedFalse(user, LocalDate.now()))
                .thenReturn(Optional.empty());
        when(pointageNotificationRepository.save(any(PointageNotification.class))).thenReturn(pointageNotification);

        PointageNotificationDTO result = pointageNotificationService.checkPendingPointageNotification(1L, LocalDate.now());

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.isAcknowledged()).isFalse();
        verify(pointageNotificationRepository, times(1)).save(any(PointageNotification.class));
    }

    @Test
    void testCheckPendingPointageNotification_ExistingUnacknowledgedNotification_Success() {
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userTeletravailRepository.findByUserIdAndJoursChoisisContaining(eq(1L), eq(LocalDate.now().toString())))
                .thenReturn(Optional.of(userTeletravail));
        when(pointageRepository.existsByUserAndPointageDate(user, LocalDate.now())).thenReturn(false);
        when(pointageNotificationRepository.findByUserAndPointageDateAndIsAcknowledgedFalse(user, LocalDate.now()))
                .thenReturn(Optional.of(pointageNotification));

        PointageNotificationDTO result = pointageNotificationService.checkPendingPointageNotification(1L, LocalDate.now());

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.isAcknowledged()).isFalse();
        verify(pointageNotificationRepository, never()).save(any(PointageNotification.class));
    }

    @Test
    void testCheckPendingPointageNotification_UserNotFound_ThrowsException() {
        when(usersRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pointageNotificationService.checkPendingPointageNotification(1L, LocalDate.now()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Utilisateur non trouvé.");
    }

    @Test
    void testAcknowledgeNotification_Success() {
        when(pointageNotificationRepository.findById(1L)).thenReturn(Optional.of(pointageNotification));
        when(pointageNotificationRepository.save(any(PointageNotification.class))).thenReturn(pointageNotification);

        pointageNotificationService.acknowledgeNotification(1L);

        verify(pointageNotificationRepository, times(1)).save(pointageNotification);
    }

    @Test
    void testAcknowledgeNotification_NotFound_ThrowsException() {
        when(pointageNotificationRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pointageNotificationService.acknowledgeNotification(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Notification non trouvée.");
    }
}