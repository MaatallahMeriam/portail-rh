package com.example.PORTAIL_RH.request_service.service.impl;

import com.example.PORTAIL_RH.notification_service.Service.NotificationService;
import com.example.PORTAIL_RH.request_service.DTO.*;
import com.example.PORTAIL_RH.request_service.Entity.Demande;
import com.example.PORTAIL_RH.request_service.Entity.Dmd_Conges;
import com.example.PORTAIL_RH.request_service.Entity.Dmd_Doc;
import com.example.PORTAIL_RH.request_service.Entity.Dmd_Log;
import com.example.PORTAIL_RH.request_service.Repo.DemandeRepository;
import com.example.PORTAIL_RH.request_service.Service.IMPL.DemandeServiceImpl;
import com.example.PORTAIL_RH.conges_service.Entity.CongeType;
import com.example.PORTAIL_RH.conges_service.Entity.UserConges;
import com.example.PORTAIL_RH.conges_service.Repo.UserCongesRepository;
import com.example.PORTAIL_RH.equipe_service.Entity.Equipe;
import com.example.PORTAIL_RH.equipe_service.Repo.EquipeRepository;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.text.SimpleDateFormat;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT) // Added to disable strict stubbing checks
class DemandeServiceImplTest {

    @Mock
    private DemandeRepository demandeRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private UserCongesRepository userCongesRepository;

    @Mock
    private EquipeRepository equipeRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private DemandeServiceImpl demandeService;

    private Users user;
    private Users manager;
    private UserConges userConges;
    private CongeType congeType;
    private Equipe equipe;
    private DemandeRequest demandeRequest;
    private Dmd_Conges congesDemande;
    private Dmd_Doc docDemande;
    private Dmd_Log logDemande;
    private SimpleDateFormat dateFormat;

    @BeforeEach
    void setUp() {
        // Initialize date formatter
        dateFormat = new SimpleDateFormat("yyyy-MM-dd");

        // Initialize CongeType
        congeType = new CongeType();
        congeType.setId(1L);
        congeType.setType(CongeType.TypeConge.RENOUVELABLE);
        congeType.setUnite(CongeType.Unite.Jours);
        congeType.setSoldeInitial(30);
        congeType.setNom("Maladie");
        congeType.setAbreviation("MAL");
        congeType.setGlobal(true);
        congeType.setValidite(new Date(System.currentTimeMillis() + 365 * 24 * 60 * 60 * 1000L)); // Valid for 1 year

        // Initialize test data
        user = new Users();
        user.setId(1L);
        user.setNom("Doe");
        user.setPrenom("John");
        user.setDemandes(new HashSet<>());

        manager = new Users();
        manager.setId(2L);
        manager.setNom("Smith");
        manager.setPrenom("Jane");
        manager.setRole(Users.Role.MANAGER);

        userConges = new UserConges();
        userConges.setId(1L);
        userConges.setUser(user);
        userConges.setCongeType(congeType);
        userConges.setSoldeActuel(20);
        userConges.setLastUpdated(new Date());

        equipe = new Equipe();
        equipe.setId(1L);
        equipe.setNom("Team A");
        equipe.setManager(manager);
        equipe.setUsers(new ArrayList<>(List.of(user, manager)));

        // Initialize demandeRequest for CONGES
        demandeRequest = new DemandeRequest();
        demandeRequest.setUserId(1L);
        demandeRequest.setType(Demande.DemandeType.CONGES);
        demandeRequest.setUserCongesId(1L);
        demandeRequest.setDuree(5);
        demandeRequest.setUnite(CongeType.Unite.Jours);
        demandeRequest.setDateDebut(dateFormat.format(new Date(System.currentTimeMillis())));
        demandeRequest.setDateFin(dateFormat.format(new Date(System.currentTimeMillis() + 5 * 24 * 60 * 60 * 1000)));
        demandeRequest.setFileUrl("/uploads/certificat.pdf");
        demandeRequest.setCommentaires("Medical leave");

        // Initialize sample demands
        congesDemande = new Dmd_Conges();
        congesDemande.setId(1L);
        congesDemande.setUser(user);
        congesDemande.setType(Demande.DemandeType.CONGES);
        congesDemande.setStatut(Demande.StatutType.EN_ATTENTE);
        congesDemande.setDateEmission(new Date());
        congesDemande.setUserConges(userConges);
        congesDemande.setDuree(5);
        congesDemande.setUnite(CongeType.Unite.Jours);
        congesDemande.setDateDebut(new Date());
        congesDemande.setDateFin(new Date(System.currentTimeMillis() + 5 * 24 * 60 * 60 * 1000));
        congesDemande.setFileUrl("/uploads/certificat.pdf");
        congesDemande.setCommentaires("Medical leave");

        docDemande = new Dmd_Doc();
        docDemande.setId(2L);
        docDemande.setUser(user);
        docDemande.setType(Demande.DemandeType.DOCUMENT);
        docDemande.setStatut(Demande.StatutType.EN_ATTENTE);
        docDemande.setDateEmission(new Date());
        docDemande.setRaison_dmd("Need ID copy");
        docDemande.setType_document("ID Card");
        docDemande.setNombre_copies(2);

        logDemande = new Dmd_Log();
        logDemande.setId(3L);
        logDemande.setUser(user);
        logDemande.setType(Demande.DemandeType.LOGISTIQUE);
        logDemande.setStatut(Demande.StatutType.EN_ATTENTE);
        logDemande.setDateEmission(new Date());
        logDemande.setRaison_dmd("New laptop");
        logDemande.setCommentaire("Urgent");
        logDemande.setDepartement("IT");
        logDemande.setComposant("Laptop");
    }

    @Test
    void testCreateDemande_Conges_Success() {
        // Arrange
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userCongesRepository.findById(1L)).thenReturn(Optional.of(userConges));
        when(demandeRepository.save(any(Dmd_Conges.class))).thenReturn(congesDemande);
        when(usersRepository.save(any(Users.class))).thenReturn(user);

        // Act
        DemandeDTO result = demandeService.createDemande(demandeRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getType()).isEqualTo(Demande.DemandeType.CONGES);
        assertThat(result.getStatut()).isEqualTo(Demande.StatutType.EN_ATTENTE);
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getDuree()).isEqualTo(5);
        assertThat(result.getFileUrl()).isEqualTo("/uploads/certificat.pdf");
        verify(demandeRepository, times(1)).save(any(Dmd_Conges.class));
        verify(usersRepository, times(1)).save(user);
        verify(notificationService, times(1)).createNotificationForRole(any(Demande.class));
    }

    @Test
    void testCreateDemande_Conges_InsufficientBalance() {
        // Arrange
        demandeRequest.setDuree(30); // Exceeds soldeActuel (20)
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userCongesRepository.findById(1L)).thenReturn(Optional.of(userConges));

        // Act & Assert
        assertThatThrownBy(() -> demandeService.createDemande(demandeRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Solde insuffisant pour ce type de congé");
        verify(demandeRepository, never()).save(any());
    }

    @Test
    void testCreateDemande_Document_Success() {
        // Arrange
        demandeRequest.setType(Demande.DemandeType.DOCUMENT);
        demandeRequest.setRaisonDmdDoc("Need ID copy");
        demandeRequest.setTypeDocument("ID Card");
        demandeRequest.setNombreCopies(2);
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(demandeRepository.save(any(Dmd_Doc.class))).thenReturn(docDemande);
        when(usersRepository.save(any(Users.class))).thenReturn(user);

        // Act
        DemandeDTO result = demandeService.createDemande(demandeRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getType()).isEqualTo(Demande.DemandeType.DOCUMENT);
        assertThat(result.getRaisonDmd()).isEqualTo("Need ID copy");
        assertThat(result.getTypeDocument()).isEqualTo("ID Card");
        assertThat(result.getNombreCopies()).isEqualTo(2);
        verify(demandeRepository, times(1)).save(any(Dmd_Doc.class));
        verify(notificationService, times(1)).createNotificationForRole(any(Demande.class));
    }

    @Test
    void testCreateDemande_Logistique_Success() {
        // Arrange
        demandeRequest.setType(Demande.DemandeType.LOGISTIQUE);
        demandeRequest.setRaisonDmdLog("New laptop");
        demandeRequest.setCommentaires("Urgent");
        demandeRequest.setDepartement("IT");
        demandeRequest.setComposant("Laptop");
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(demandeRepository.save(any(Dmd_Log.class))).thenReturn(logDemande);
        when(usersRepository.save(any(Users.class))).thenReturn(user);

        // Act
        DemandeDTO result = demandeService.createDemande(demandeRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getType()).isEqualTo(Demande.DemandeType.LOGISTIQUE);
        assertThat(result.getRaisonDmdLog()).isEqualTo("New laptop");
        assertThat(result.getCommentaire()).isEqualTo("Urgent");
        verify(demandeRepository, times(1)).save(any(Dmd_Log.class));
        verify(notificationService, times(1)).createNotificationForRole(any(Demande.class));
    }

    @Test
    void testCreateDemande_UserNotFound() {
        // Arrange
        when(usersRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> demandeService.createDemande(demandeRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Utilisateur non trouvé");
        verify(demandeRepository, never()).save(any());
    }

    @Test
    void testUpdateDemande_Conges_Success() {
        // Arrange
        demandeRequest.setDuree(3);
        demandeRequest.setCommentaires("Updated leave");
        when(demandeRepository.findById(1L)).thenReturn(Optional.of(congesDemande));
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userCongesRepository.findById(1L)).thenReturn(Optional.of(userConges));
        when(demandeRepository.save(any(Dmd_Conges.class))).thenReturn(congesDemande);

        // Act
        DemandeDTO result = demandeService.updateDemande(1L, demandeRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getDuree()).isEqualTo(3);
        assertThat(result.getCommentaires()).isEqualTo("Updated leave");
        verify(demandeRepository, times(1)).save(any(Dmd_Conges.class));
    }

    @Test
    void testUpdateDemande_WrongType() {
        // Arrange
        demandeRequest.setType(Demande.DemandeType.DOCUMENT);
        when(demandeRepository.findById(1L)).thenReturn(Optional.of(congesDemande));
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act & Assert
        assertThatThrownBy(() -> demandeService.updateDemande(1L, demandeRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Type de demande incompatible");
        verify(demandeRepository, never()).save(any());
    }

    @Test
    void testGetAllDemandes() {
        // Arrange
        when(demandeRepository.findAll()).thenReturn(List.of(congesDemande, docDemande, logDemande));

        // Act
        List<DemandeDTO> result = demandeService.getAllDemandes();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getType()).isEqualTo(Demande.DemandeType.CONGES);
        assertThat(result.get(1).getType()).isEqualTo(Demande.DemandeType.DOCUMENT);
        assertThat(result.get(2).getType()).isEqualTo(Demande.DemandeType.LOGISTIQUE);
        verify(demandeRepository, times(1)).findAll();
    }

    @Test
    void testGetDemandeById() {
        // Arrange
        when(demandeRepository.findById(1L)).thenReturn(Optional.of(congesDemande));

        // Act
        DemandeDTO result = demandeService.getDemandeById(1L);

        // Assert
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getType()).isEqualTo(Demande.DemandeType.CONGES);
        verify(demandeRepository, times(1)).findById(1L);
    }

    @Test
    void testAcceptDemande_Conges_Success() {
        // Arrange
        when(demandeRepository.findById(1L)).thenReturn(Optional.of(congesDemande));
        when(usersRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(userCongesRepository.save(any(UserConges.class))).thenReturn(userConges);
        when(demandeRepository.save(any(Dmd_Conges.class))).thenReturn(congesDemande);

        // Act
        DemandeDTO result = demandeService.acceptDemande(1L, 2L);

        // Assert
        assertThat(result.getStatut()).isEqualTo(Demande.StatutType.VALIDEE);
        assertThat(userConges.getSoldeActuel()).isEqualTo(15); // 20 - 5
        verify(userCongesRepository, times(1)).save(userConges);
        verify(notificationService, times(1)).notifyRequesterStatusChange(any(Demande.class), eq("acceptée"), eq(manager));
    }

    @Test
    void testAcceptDemande_NotPending() {
        // Arrange
        congesDemande.setStatut(Demande.StatutType.VALIDEE);
        when(demandeRepository.findById(1L)).thenReturn(Optional.of(congesDemande));
        when(usersRepository.findById(2L)).thenReturn(Optional.of(manager));

        // Act & Assert
        assertThatThrownBy(() -> demandeService.acceptDemande(1L, 2L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("La demande doit être en attente");
        verify(demandeRepository, never()).save(any());
    }

    @Test
    void testRefuseDemande_Success() {
        // Arrange
        when(demandeRepository.findById(1L)).thenReturn(Optional.of(congesDemande));
        when(usersRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(demandeRepository.save(any(Dmd_Conges.class))).thenReturn(congesDemande);

        // Act
        DemandeDTO result = demandeService.refuseDemande(1L, 2L);

        // Assert
        assertThat(result.getStatut()).isEqualTo(Demande.StatutType.REFUSEE);
        assertThat(result.getDateValidation()).isNull();
        verify(demandeRepository, times(1)).save(any(Dmd_Conges.class));
        verify(notificationService, times(1)).notifyRequesterStatusChange(any(Demande.class), eq("refusée"), eq(manager));
    }

    @Test
    void testDeleteDemande() {
        // Arrange
        when(demandeRepository.findById(1L)).thenReturn(Optional.of(congesDemande));
        when(usersRepository.save(any(Users.class))).thenReturn(user);

        // Act
        demandeService.deleteDemande(1L);

        // Assert
        verify(usersRepository, times(1)).save(user);
        verify(demandeRepository, times(1)).delete(congesDemande);
    }

    @Test
    void testGetCongesDemandesByManagerId() {
        // Arrange
        when(equipeRepository.findByManagerId(2L)).thenReturn(List.of(equipe));
        when(demandeRepository.findByUserIdIn(List.of(1L))).thenReturn(List.of(congesDemande));

        // Act
        List<ManagerCongesDemandeDTO> result = demandeService.getCongesDemandesByManagerId(2L);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(1L);
        assertThat(result.get(0).getCongeNom()).isEqualTo("Maladie");
        verify(equipeRepository, times(1)).findByManagerId(2L);
    }

    @Test
    void testGetPendingLogisticDemandes() {
        // Arrange
        when(demandeRepository.findAll()).thenReturn(List.of(logDemande));

        // Act
        List<LogisticDemandeDTO> result = demandeService.getPendingLogisticDemandes();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRaisonDmd()).isEqualTo("New laptop");
        verify(demandeRepository, times(1)).findAll();
    }

    @Test
    void testGetPendingDocumentDemandes() {
        // Arrange
        when(demandeRepository.findAll()).thenReturn(List.of(docDemande));

        // Act
        List<DocumentDemandeDTO> result = demandeService.getPendingDocumentDemandes();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTypeDocument()).isEqualTo("ID Card");
        verify(demandeRepository, times(1)).findAll();
    }
}