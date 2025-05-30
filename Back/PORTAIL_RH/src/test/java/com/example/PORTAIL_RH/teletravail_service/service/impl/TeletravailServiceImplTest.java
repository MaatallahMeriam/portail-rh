package com.example.PORTAIL_RH.teletravail_service.service.impl;

import com.example.PORTAIL_RH.teletravail_service.dto.TeletravailPlanningDTO;
import com.example.PORTAIL_RH.teletravail_service.dto.UserTeletravailDTO;
import com.example.PORTAIL_RH.teletravail_service.entity.TeletravailPlanning;
import com.example.PORTAIL_RH.teletravail_service.entity.UserTeletravail;
import com.example.PORTAIL_RH.teletravail_service.repo.TeletravailPlanningRepository;
import com.example.PORTAIL_RH.teletravail_service.repo.UserTeletravailRepository;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.YearMonth;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeletravailServiceImplTest {

    @Mock
    private TeletravailPlanningRepository planningRepository;

    @Mock
    private UserTeletravailRepository userTeletravailRepository;

    @Mock
    private UsersRepository usersRepository;

    @InjectMocks
    private TeletravailServiceImpl teletravailService;

    private TeletravailPlanning planning;
    private TeletravailPlanningDTO planningDTO;
    private UserTeletravail userTeletravail;
    private UserTeletravailDTO userTeletravailDTO;
    private Users rh;
    private Users user;

    @BeforeEach
    void setUp() {
        // Setup RH user
        rh = new Users();
        rh.setId(1L);
        rh.setRole(Users.Role.RH);
        rh.setMail("rh@example.com");
        rh.setNom("RH");
        rh.setPrenom("Admin");

        // Setup regular user
        user = new Users();
        user.setId(2L);
        user.setRole(Users.Role.COLLAB);
        user.setMail("user@example.com");
        user.setNom("Doe");
        user.setPrenom("John");

        // Setup TeletravailPlanning
        planning = new TeletravailPlanning();
        planning.setId(1L);
        planning.setPolitique(TeletravailPlanning.Politique.SEUIL_LIBRE);
        planning.setNombreJoursMax(5);
        planning.setMois(YearMonth.of(2025, 5));
        planning.setJoursFixes(Collections.emptyList());
        planning.setRh(rh);

        planningDTO = new TeletravailPlanningDTO();
        planningDTO.setId(1L);
        planningDTO.setPolitique(TeletravailPlanning.Politique.SEUIL_LIBRE);
        planningDTO.setNombreJoursMax(5);
        planningDTO.setMois("2025-05");
        planningDTO.setJoursFixes(Collections.emptyList());
        planningDTO.setRhId(1L);

        // Setup UserTeletravail
        userTeletravail = new UserTeletravail();
        userTeletravail.setId(1L);
        userTeletravail.setUser(user);
        userTeletravail.setPlanning(planning);
        userTeletravail.setJoursChoisis(Arrays.asList("2025-05-01", "2025-05-02"));

        userTeletravailDTO = new UserTeletravailDTO();
        userTeletravailDTO.setId(1L);
        userTeletravailDTO.setUserId(2L);
        userTeletravailDTO.setPlanningId(1L);
        userTeletravailDTO.setJoursChoisis(Arrays.asList("2025-05-01", "2025-05-02"));
    }

    @Test
    void testCreatePlanning_Success() {
        // Arrange
        when(usersRepository.findById(1L)).thenReturn(Optional.of(rh));
        when(planningRepository.findByMois(YearMonth.of(2025, 5))).thenReturn(Collections.emptyList());
        when(planningRepository.save(any(TeletravailPlanning.class))).thenReturn(planning);
        when(usersRepository.findAllByRoleNot(Users.Role.RH)).thenReturn(Arrays.asList(user));
        when(userTeletravailRepository.save(any(UserTeletravail.class))).thenReturn(userTeletravail);

        // Act
        TeletravailPlanningDTO result = teletravailService.createPlanning(planningDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getPolitique()).isEqualTo(TeletravailPlanning.Politique.SEUIL_LIBRE);
        assertThat(result.getNombreJoursMax()).isEqualTo(5);
        assertThat(result.getMois()).isEqualTo("2025-05");
        assertThat(result.getRhId()).isEqualTo(1L);
        verify(planningRepository, times(1)).save(any(TeletravailPlanning.class));
        verify(userTeletravailRepository, times(1)).save(any(UserTeletravail.class));
    }

    @Test
    void testCreatePlanning_ExistingPlanningForMonth() {
        // Arrange
        when(usersRepository.findById(1L)).thenReturn(Optional.of(rh));
        when(planningRepository.findByMois(YearMonth.of(2025, 5))).thenReturn(Arrays.asList(planning));

        // Act & Assert
        assertThatThrownBy(() -> teletravailService.createPlanning(planningDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Un planning existe déjà pour le mois 2025-05.");
        verify(planningRepository, never()).save(any(TeletravailPlanning.class));
    }

    @Test
    void testCreatePlanning_RHNotFound() {
        // Arrange
        when(usersRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> teletravailService.createPlanning(planningDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("RH not found");
        verify(planningRepository, never()).save(any(TeletravailPlanning.class));
    }

    @Test
    void testSelectDays_Success_SeuilLibre() {
        // Arrange
        when(usersRepository.findById(2L)).thenReturn(Optional.of(user));
        when(planningRepository.findById(1L)).thenReturn(Optional.of(planning));
        when(userTeletravailRepository.findByUserIdAndPlanningId(2L, 1L)).thenReturn(Optional.of(userTeletravail));
        when(userTeletravailRepository.save(any(UserTeletravail.class))).thenReturn(userTeletravail);

        // Act
        UserTeletravailDTO result = teletravailService.selectDays(userTeletravailDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUserId()).isEqualTo(2L);
        assertThat(result.getPlanningId()).isEqualTo(1L);
        assertThat(result.getJoursChoisis()).containsExactly("2025-05-01", "2025-05-02");
        verify(userTeletravailRepository, times(1)).save(any(UserTeletravail.class));
    }

    @Test
    void testSelectDays_TooManyDays_SeuilLibre() {
        // Arrange
        userTeletravailDTO.setJoursChoisis(Arrays.asList("2025-05-01", "2025-05-02", "2025-05-03", "2025-05-04", "2025-05-05", "2025-05-06"));
        when(usersRepository.findById(2L)).thenReturn(Optional.of(user));
        when(planningRepository.findById(1L)).thenReturn(Optional.of(planning));
        when(userTeletravailRepository.findByUserIdAndPlanningId(2L, 1L)).thenReturn(Optional.of(userTeletravail));

        // Act & Assert
        assertThatThrownBy(() -> teletravailService.selectDays(userTeletravailDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Nombre de jours dépasse la limite : 5");
        verify(userTeletravailRepository, never()).save(any(UserTeletravail.class));
    }

    @Test
    void testSelectDays_PlanningFixe_UnauthorizedDay() {
        // Arrange
        planning.setPolitique(TeletravailPlanning.Politique.PLANNING_FIXE);
        planning.setJoursFixes(Arrays.asList("2025-05-03", "2025-05-04"));
        userTeletravailDTO.setJoursChoisis(Arrays.asList("2025-05-01"));
        when(usersRepository.findById(2L)).thenReturn(Optional.of(user));
        when(planningRepository.findById(1L)).thenReturn(Optional.of(planning));
        when(userTeletravailRepository.findByUserIdAndPlanningId(2L, 1L)).thenReturn(Optional.of(userTeletravail));

        // Act & Assert
        assertThatThrownBy(() -> teletravailService.selectDays(userTeletravailDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Jour non autorisé : 2025-05-01");
        verify(userTeletravailRepository, never()).save(any(UserTeletravail.class));
    }

    @Test
    void testGetUserPlannings_Success() {
        // Arrange
        when(userTeletravailRepository.findByUserId(2L)).thenReturn(Arrays.asList(userTeletravail));

        // Act
        List<UserTeletravailDTO> result = teletravailService.getUserPlannings(2L);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getUserId()).isEqualTo(2L);
        assertThat(result.get(0).getPlanningId()).isEqualTo(1L);
        assertThat(result.get(0).getJoursChoisis()).containsExactly("2025-05-01", "2025-05-02");
        assertThat(result.get(0).getPlanning().getMois()).isEqualTo("2025-05");
    }

    @Test
    void testGetPlanningsForMonth_Success() {
        // Arrange
        when(usersRepository.findById(1L)).thenReturn(Optional.of(rh));
        when(planningRepository.findByMois(YearMonth.of(2025, 5))).thenReturn(Arrays.asList(planning));

        // Act
        List<TeletravailPlanningDTO> result = teletravailService.getPlanningsForMonth(1L, YearMonth.of(2025, 5));

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getPolitique()).isEqualTo(TeletravailPlanning.Politique.SEUIL_LIBRE);
        assertThat(result.get(0).getMois()).isEqualTo("2025-05");
    }

    @Test
    void testGetPlanningsForMonth_RHNotFound() {
        // Arrange
        when(usersRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> teletravailService.getPlanningsForMonth(1L, YearMonth.of(2025, 5)))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("RH not found");
    }
}