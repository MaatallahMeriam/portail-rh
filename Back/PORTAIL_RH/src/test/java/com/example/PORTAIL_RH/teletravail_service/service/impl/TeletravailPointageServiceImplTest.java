package com.example.PORTAIL_RH.teletravail_service.service.impl;

import com.example.PORTAIL_RH.notification_service.Service.NotificationService;
import com.example.PORTAIL_RH.teletravail_service.dto.TeletravailPointageDTO;
import com.example.PORTAIL_RH.teletravail_service.entity.TeletravailPointage;
import com.example.PORTAIL_RH.teletravail_service.entity.UserTeletravail;
import com.example.PORTAIL_RH.teletravail_service.repo.TeletravailPointageRepository;
import com.example.PORTAIL_RH.teletravail_service.repo.UserTeletravailRepository;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.utils.EnhancedEmailService;
import com.example.PORTAIL_RH.equipe_service.Entity.Equipe;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeletravailPointageServiceImplTest {

    @Mock
    private TeletravailPointageRepository pointageRepository;

    @Mock
    private UserTeletravailRepository userTeletravailRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private EnhancedEmailService emailService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TeletravailPointageServiceImpl pointageService;

    private Users user;
    private Users manager;
    private Equipe equipe;
    private UserTeletravail userTeletravail;
    private TeletravailPointage pointage;
    private String jwtSecretBase64;
    private String qrCodeBaseUrl;
    private String token;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        // Set today to a fixed date for consistency
        today = LocalDate.now(); // Use current date to match generateAndSendQRCodes

        // Generate a secure key for HS512
        SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
        jwtSecretBase64 = Base64.getEncoder().encodeToString(secretKey.getEncoded());
        qrCodeBaseUrl = "http://example.com/qrcode";

        // Use ReflectionTestUtils to set private fields
        ReflectionTestUtils.setField(pointageService, "jwtSecretBase64", jwtSecretBase64);
        ReflectionTestUtils.setField(pointageService, "qrCodeBaseUrl", qrCodeBaseUrl);

        // Trigger the @PostConstruct init method to decode jwtSecret
        ReflectionTestUtils.invokeMethod(pointageService, "init");

        // Setup user
        user = new Users();
        user.setId(2L);
        user.setRole(Users.Role.COLLAB);
        user.setMail("user@example.com");
        user.setNom("Doe");
        user.setPrenom("John");

        // Setup manager
        manager = new Users();
        manager.setId(3L);
        manager.setRole(Users.Role.MANAGER);
        manager.setMail("manager@example.com");
        manager.setNom("Smith");
        manager.setPrenom("Jane");

        // Setup equipe
        equipe = new Equipe();
        equipe.setManager(manager);
        user.setEquipe(equipe);

        // Setup UserTeletravail with today's date
        userTeletravail = new UserTeletravail();
        userTeletravail.setId(1L);
        userTeletravail.setUser(user);
        userTeletravail.setJoursChoisis(Arrays.asList(today.toString())); // Use today

        // Setup TeletravailPointage
        pointage = new TeletravailPointage();
        pointage.setId(1L);
        pointage.setUser(user);
        pointage.setUserTeletravail(userTeletravail);
        pointage.setPointageDate(today);
        pointage.setPointageTime(LocalTime.of(9, 0));

        // Setup token with secure key
        token = Jwts.builder()
                .setSubject("2")
                .claim("date", today.toString())
                .setIssuedAt(new java.util.Date())
                .setExpiration(new java.util.Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000))
                .signWith(secretKey)
                .compact();
    }

    @Test
    void testGenerateQRCode_Success() throws Exception {
        // Arrange
        when(userTeletravailRepository.findByUserIdAndJoursChoisisContaining(2L, today.toString()))
                .thenReturn(Optional.of(userTeletravail));

        // Act
        String qrCodeBase64 = pointageService.getQRCodeForUser(2L, today);

        // Assert
        assertThat(qrCodeBase64).isNotNull();
        assertThat(qrCodeBase64).isNotEmpty();
        verify(userTeletravailRepository, times(1)).findByUserIdAndJoursChoisisContaining(2L, today.toString());
    }

    @Test
    void testGenerateQRCode_NoTeletravailDay() throws Exception {
        // Arrange
        when(userTeletravailRepository.findByUserIdAndJoursChoisisContaining(2L, today.toString()))
                .thenReturn(Optional.empty());

        // Act
        String qrCodeBase64 = pointageService.getQRCodeForUser(2L, today);

        // Assert
        assertThat(qrCodeBase64).isNull();
        verify(userTeletravailRepository, times(1)).findByUserIdAndJoursChoisisContaining(2L, today.toString());
    }

    @Test
    void testRecordPointage_Success() {
        // Arrange
        when(usersRepository.findById(2L)).thenReturn(Optional.of(user));
        when(pointageRepository.existsByUserAndPointageDate(user, today)).thenReturn(false);
        when(userTeletravailRepository.findByUserIdAndJoursChoisisContaining(2L, today.toString()))
                .thenReturn(Optional.of(userTeletravail));
        when(pointageRepository.save(any(TeletravailPointage.class))).thenReturn(pointage);
        doNothing().when(notificationService).createNotificationForUser(any(Users.class), anyString(), anyString(), any(), any(Users.class));

        // Act
        pointageService.recordPointage(token);

        // Assert
        verify(pointageRepository, times(1)).save(any(TeletravailPointage.class));
        verify(notificationService, times(1))
                .createNotificationForUser(eq(manager), anyString(), eq("POINTAGE"), eq(null), eq(user));
    }

    @Test
    void testRecordPointage_AlreadyPointed() {
        // Arrange
        when(usersRepository.findById(2L)).thenReturn(Optional.of(user));
        when(pointageRepository.existsByUserAndPointageDate(user, today)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> pointageService.recordPointage(token))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Token invalide ou expiré : Pointage déjà effectué aujourd’hui.");
        verify(pointageRepository, never()).save(any(TeletravailPointage.class));
    }

    @Test
    void testRecordPointage_InvalidToken() {
        // Arrange
        String invalidToken = "invalid.token.value";

        // Act & Assert
        assertThatThrownBy(() -> pointageService.recordPointage(invalidToken))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Token invalide ou expir");
        verify(pointageRepository, never()).save(any(TeletravailPointage.class));
    }

    @Test
    void testGetPointagesForPeriod_Success() {
        // Arrange
        when(pointageRepository.findByUserIdAndPointageDateBetween(2L, today, today.plusDays(6)))
                .thenReturn(Arrays.asList(pointage));

        // Act
        List<TeletravailPointageDTO> result = pointageService.getPointagesForPeriod(
                today, today.plusDays(6), 2L);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getPointageDate()).isEqualTo(today);
        assertThat(result.get(0).getPointageTime()).isEqualTo(LocalTime.of(9, 0));
    }

    @Test
    void testSendPointageEmail_Success() throws Exception {
        // Arrange
        when(userTeletravailRepository.findByUserIdAndJoursChoisisContaining(2L, today.toString()))
                .thenReturn(Optional.of(userTeletravail));
        when(usersRepository.findById(2L)).thenReturn(Optional.of(user));
        when(emailService.sendPointageEmail(anyString(), anyString(), anyString(), anyString())).thenReturn(true);

        // Act
        boolean result = pointageService.sendPointageEmail(2L, today);

        // Assert
        assertThat(result).isTrue();
        verify(emailService, times(1)).sendPointageEmail(eq("user@example.com"), eq("John Doe"), anyString(), anyString());
    }

    @Test
    void testSendPointageEmail_NoTeletravail() throws Exception {
        // Arrange
        when(userTeletravailRepository.findByUserIdAndJoursChoisisContaining(2L, today.toString()))
                .thenReturn(Optional.empty());

        // Act
        boolean result = pointageService.sendPointageEmail(2L, today);

        // Assert
        assertThat(result).isFalse();
        verify(emailService, never()).sendPointageEmail(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testGenerateAndSendQRCodes_Success() throws Exception {
        // Arrange
        when(userTeletravailRepository.findAll()).thenReturn(Arrays.asList(userTeletravail));
        when(emailService.sendPointageEmail(anyString(), anyString(), anyString(), anyString())).thenReturn(true);

        // Act
        pointageService.generateAndSendQRCodes();

        // Assert
        verify(userTeletravailRepository, times(1)).findAll();
        verify(emailService, times(1)).sendPointageEmail(
                eq("user@example.com"), eq("John Doe"), anyString(), anyString());
    }
}