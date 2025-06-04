package com.example.PORTAIL_RH.competence_service.service.impl;

import com.example.PORTAIL_RH.competence_service.dto.*;
import com.example.PORTAIL_RH.competence_service.entity.*;
import com.example.PORTAIL_RH.competence_service.repo.*;
import com.example.PORTAIL_RH.notification_service.Service.NotificationService;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompetenceServiceImplTest {

    @Mock
    private EmployeCompetenceRepository employeCompetenceRepository;

    @Mock
    private ProjetRepository projetRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private ProjetCompetenceRepository projetCompetenceRepository;

    @Mock
    private ProjetAffectationRepository projetAffectationRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private CompetenceServiceImpl competenceService;

    private Users employe;
    private Projet projet;

    @BeforeEach
    void setUp() {
        employe = new Users();
        employe.setId(1L);
        employe.setNom("Doe");
        employe.setPrenom("John");

        projet = new Projet();
        projet.setId(1L);
        projet.setNom("Projet Test");
        projet.setDescription("Description");
        projet.setCahierCharge(new byte[]{1, 2, 3});
        projet.setCompetencesRequises(new HashSet<>());
        projet.setAffectations(new HashSet<>());
    }

    @Test
    void addEmployeCompetence_success() {
        // Arrange
        EmployeCompetenceDTO dto = new EmployeCompetenceDTO(1L, "Java", "Expert");
        when(usersRepository.findById(1L)).thenReturn(Optional.of(employe));
        when(employeCompetenceRepository.save(any(EmployeCompetence.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        EmployeCompetenceDTO result = competenceService.addEmployeCompetence(dto);

        // Assert
        assertThat(result).isEqualTo(dto);
        verify(employeCompetenceRepository).save(any(EmployeCompetence.class));
        verify(usersRepository).findById(1L);
    }

    @Test
    void addEmployeCompetence_employeNotFound_throwsException() {
        // Arrange
        EmployeCompetenceDTO dto = new EmployeCompetenceDTO(1L, "Java", "Expert");
        when(usersRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> competenceService.addEmployeCompetence(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Employé non trouvé");
        verify(employeCompetenceRepository, never()).save(any());
    }

    @Test
    void createProjet_success() {
        // Arrange
        ProjetDTO dto = new ProjetDTO();
        dto.setNom("Projet Test");
        dto.setDescription("Description");
        dto.setCahierCharge(new byte[]{1, 2, 3});
        ProjetCompetenceDTO competenceDTO = new ProjetCompetenceDTO("Java", "Expert");
        dto.setCompetencesRequises(List.of(competenceDTO));

        when(projetRepository.save(any(Projet.class))).thenAnswer(invocation -> {
            Projet saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        // Act
        ProjetDTO result = competenceService.createProjet(dto);

        // Assert
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getNom()).isEqualTo("Projet Test");
        assertThat(result.getCompetencesRequises()).hasSize(1);
        assertThat(result.getCompetencesRequises().get(0).getCompetenceNom()).isEqualTo("Java");
        verify(projetRepository).save(any(Projet.class));
    }

    @Test
    void affecterEmployeAProjet_success() {
        // Arrange
        ProjetAffectationDTO dto = new ProjetAffectationDTO();
        dto.setProjetId(1L);
        dto.setEmployeId(1L);

        when(projetRepository.findById(1L)).thenReturn(Optional.of(projet));
        when(usersRepository.findById(1L)).thenReturn(Optional.of(employe));
        when(projetAffectationRepository.save(any(ProjetAffectation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ProjetAffectationDTO result = competenceService.affecterEmployeAProjet(dto);

        // Assert
        assertThat(result).isEqualTo(dto);
        verify(projetAffectationRepository).save(any(ProjetAffectation.class));
        verify(notificationService).createNotificationForUser(eq(employe), anyString(), eq("PROJET_AFFECTATION"), eq(1L), isNull());
    }

    @Test
    void affecterEmployeAProjet_projetNotFound_throwsException() {
        // Arrange
        ProjetAffectationDTO dto = new ProjetAffectationDTO();
        dto.setProjetId(1L);
        dto.setEmployeId(1L);

        when(projetRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> competenceService.affecterEmployeAProjet(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Projet non trouvé");
        verify(projetAffectationRepository, never()).save(any());
    }

    @Test
    void deleteProjet_success() {
        // Arrange
        when(projetRepository.findById(1L)).thenReturn(Optional.of(projet));
        when(projetAffectationRepository.findByProjetId(1L)).thenReturn(List.of());
        when(projetCompetenceRepository.findByProjetId(1L)).thenReturn(List.of());

        // Act
        competenceService.deleteProjet(1L);

        // Assert
        verify(projetRepository).delete(projet);
        verify(projetAffectationRepository).findByProjetId(1L);
        verify(projetCompetenceRepository).findByProjetId(1L);
    }

    @Test
    void deleteProjet_notFound_throwsException() {
        // Arrange
        when(projetRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> competenceService.deleteProjet(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Projet non trouvé avec l'ID : 1");
        verify(projetRepository, never()).delete(any());
    }

    @Test
    void matchEmployesToProjet_success() {
        // Arrange
        ProjetCompetence projetCompetence = new ProjetCompetence();
        projetCompetence.setId(new ProjetCompetence.ProjetCompetenceId(1L, "Java"));
        projetCompetence.setNiveauRequis("Expert");
        projetCompetence.setProjet(projet);

        EmployeCompetence employeCompetence = new EmployeCompetence();
        employeCompetence.setId(new EmployeCompetence.EmployeCompetenceId(1L, "Java"));
        employeCompetence.setNiveau("Expert");
        employeCompetence.setEmploye(employe);

        when(projetCompetenceRepository.findByProjetId(1L)).thenReturn(List.of(projetCompetence));
        when(employeCompetenceRepository.findAll()).thenReturn(List.of(employeCompetence));
        when(usersRepository.findAll()).thenReturn(List.of(employe));

        // Act
        List<MatchingResultDTO> results = competenceService.matchEmployesToProjet(1L);

        // Assert
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getEmployeId()).isEqualTo(1L);
        assertThat(results.get(0).getEmployeNom()).isEqualTo("Doe John");
        assertThat(results.get(0).getScore()).isEqualTo(1.0);
    }

    @Test
    void matchEmployesToProjet_withSimilarity() {
        // Arrange
        ProjetCompetence projetCompetence = new ProjetCompetence();
        projetCompetence.setId(new ProjetCompetence.ProjetCompetenceId(1L, "Python"));
        projetCompetence.setNiveauRequis("Expert");
        projetCompetence.setProjet(projet);

        EmployeCompetence employeCompetence = new EmployeCompetence();
        employeCompetence.setId(new EmployeCompetence.EmployeCompetenceId(1L, "Java"));
        employeCompetence.setNiveau("Expert");
        employeCompetence.setEmploye(employe);

        when(projetCompetenceRepository.findByProjetId(1L)).thenReturn(List.of(projetCompetence));
        when(employeCompetenceRepository.findAll()).thenReturn(List.of(employeCompetence));
        when(usersRepository.findAll()).thenReturn(List.of(employe));

        // Mock similarity API call
        Map<String, Object> similarityResponse = new HashMap<>();
        similarityResponse.put("similarity", 0.6);
        when(restTemplate.postForObject(anyString(), any(), eq(Map.class))).thenReturn(similarityResponse);

        // Act
        List<MatchingResultDTO> results = competenceService.matchEmployesToProjet(1L);

        // Assert
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getEmployeId()).isEqualTo(1L);
        assertThat(results.get(0).getEmployeNom()).isEqualTo("Doe John");
        assertThat(results.get(0).getScore()).isEqualTo(0.6 * 0.5); // 0.3
        verify(restTemplate).postForObject(anyString(), any(), eq(Map.class));
    }

    @Test
    void getProjetsByEmploye_success() {
        // Arrange
        ProjetAffectation affectation = new ProjetAffectation();
        affectation.setId(new ProjetAffectation.ProjetAffectationId(1L, 1L));
        affectation.setProjet(projet);
        affectation.setEmploye(employe);

        ProjetCompetence competence = new ProjetCompetence();
        competence.setId(new ProjetCompetence.ProjetCompetenceId(1L, "Java"));
        competence.setNiveauRequis("Expert");
        projet.getCompetencesRequises().add(competence);

        when(projetAffectationRepository.findByEmployeId(1L)).thenReturn(List.of(affectation));
        when(projetRepository.findAllById(List.of(1L))).thenReturn(List.of(projet));

        // Act
        List<ProjetDTO> results = competenceService.getProjetsByEmploye(1L);

        // Assert
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo(1L);
        assertThat(results.get(0).getNom()).isEqualTo("Projet Test");
        assertThat(results.get(0).getCompetencesRequises()).hasSize(1);
        assertThat(results.get(0).getCompetencesRequises().get(0).getCompetenceNom()).isEqualTo("Java");
    }
}
