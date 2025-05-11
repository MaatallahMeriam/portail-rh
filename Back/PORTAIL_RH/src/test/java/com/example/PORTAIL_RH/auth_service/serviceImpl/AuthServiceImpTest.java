package com.example.PORTAIL_RH.auth_service.serviceImpl;

import com.example.PORTAIL_RH.auth_service.DTO.NewRegisterRequest;
import com.example.PORTAIL_RH.auth_service.DTO.RegisterResponse;
import com.example.PORTAIL_RH.auth_service.Service.IMPL.EnhancedUserServiceImpl;
import com.example.PORTAIL_RH.user_service.conges_service.Entity.CongeType;
import com.example.PORTAIL_RH.user_service.conges_service.Repo.CongeTypeRepository;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.utils.EnhancedEmailService;
import com.example.PORTAIL_RH.utils.PasswordGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AuthServiceImpTest {

    @InjectMocks
    private EnhancedUserServiceImpl enhancedUserService;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private CongeTypeRepository congeTypeRepository;

    @Mock
    private EnhancedEmailService emailService;

    @Mock
    private PasswordGenerator passwordGenerator;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegister_SuccessfulRegistration() {
        // Préparer une requête de test
        NewRegisterRequest request = new NewRegisterRequest();
        request.setMail("test@example.com");
        request.setUserName("testuser");
        request.setNom("Test");
        request.setPrenom("User");
        request.setPoste("Developer");
        request.setDepartement("IT");
        request.setDateNaissance("1990-01-01");
        request.setRole("COLLAB");
        request.setPassword("password123");

        // Simuler le comportement des mocks
        when(usersRepository.findByMail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword123");
        when(usersRepository.save(any(Users.class))).thenAnswer(invocation -> {
            Users user = invocation.getArgument(0);
            user.setId(1L); // Simuler un ID généré
            return user;
        });

        CongeType congeType = new CongeType();
        congeType.setId(1L);
        congeType.setSoldeInitial(20);
        congeType.setGlobal(true);
        when(congeTypeRepository.findByIsGlobalTrue()).thenReturn(Collections.singletonList(congeType));
        when(emailService.sendPasswordEmail(anyString(), anyString(), anyString())).thenReturn(true);

        // Exécuter la méthode
        RegisterResponse response = enhancedUserService.register(request);

        // Vérifications
        assertEquals(1L, response.getId());
        assertEquals("testuser", response.getUserName());
        assertEquals("test@example.com", response.getMail());
        assertEquals("COLLAB", response.getRole());
        assertEquals("Utilisateur créé avec succès", response.getMessage());
        verify(usersRepository, times(2)).save(any(Users.class)); // Deux appels : un pour l'utilisateur, un pour les congés
    }

    @Test
    void testRegister_EmailAlreadyExists() {
        // Simuler un email existant
        NewRegisterRequest request = new NewRegisterRequest();
        request.setMail("test@example.com");
        request.setUserName("testuser");
        request.setRole("COLLAB");

        when(usersRepository.findByMail("test@example.com")).thenReturn(Optional.of(new Users()));

        // Vérifier que l'exception est levée
        assertThrows(IllegalArgumentException.class, () -> enhancedUserService.register(request));
    }

    @Test
    void testRegister_InvalidDateFormat() {
        // Préparer une requête avec une date invalide
        NewRegisterRequest request = new NewRegisterRequest();
        request.setMail("test@example.com");
        request.setUserName("testuser");
        request.setDateNaissance("invalid-date"); // Date invalide
        request.setRole("COLLAB");

        // Configurer les mocks
        when(usersRepository.findByMail(request.getMail())).thenReturn(Optional.empty());
        when(emailService.sendPasswordEmail(anyString(), anyString(), anyString())).thenReturn(true);
        when(passwordGenerator.generateRandomPassword()).thenReturn("randomPassword123");
        when(passwordEncoder.encode("randomPassword123")).thenReturn("encodedRandomPassword123");

        // Vérifier que l'exception correcte est levée
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> enhancedUserService.register(request));
        assertEquals("Format de date invalide (attendu : yyyy-MM-dd)", exception.getMessage());
    }
}
