package com.example.PORTAIL_RH.conges_service.service.impl;

import com.example.PORTAIL_RH.conges_service.DTO.UserCongesDTO;
import com.example.PORTAIL_RH.conges_service.Entity.CongeRenouvelable;
import com.example.PORTAIL_RH.conges_service.Entity.CongeType;
import com.example.PORTAIL_RH.conges_service.Entity.Periodicite;
import com.example.PORTAIL_RH.conges_service.Entity.UserConges;
import com.example.PORTAIL_RH.conges_service.Repo.CongeTypeRepository;
import com.example.PORTAIL_RH.conges_service.Repo.UserCongesRepository;
import com.example.PORTAIL_RH.conges_service.Service.IMPL.UserCongesServiceImpl;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserCongesServiceImplTest {

    @Mock
    private UserCongesRepository userCongesRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private CongeTypeRepository congeTypeRepository;

    @InjectMocks
    private UserCongesServiceImpl userCongesService;

    private UserCongesDTO userCongesDTO;
    private Users user;
    private CongeRenouvelable congeType;
    private UserConges userConges;

    @BeforeEach
    void setUp() {
        userCongesDTO = new UserCongesDTO();
        userCongesDTO.setUserId(1L);
        userCongesDTO.setCongeTypeId(1L);
        userCongesDTO.setSoldeActuel(20);
        userCongesDTO.setType(CongeType.TypeConge.RENOUVELABLE);
        userCongesDTO.setUnite(CongeType.Unite.Jours);
        userCongesDTO.setNom("Maladie");
        userCongesDTO.setAbreviation("MAL");
        userCongesDTO.setGlobal(false);
        userCongesDTO.setPeriodicite(Periodicite.MENSUELLE);
        userCongesDTO.setValidite(new Date());

        user = new Users();
        user.setId(1L);
        user.setCongesList(new HashSet<>());

        congeType = new CongeRenouvelable();
        congeType.setId(1L);
        congeType.setType(CongeType.TypeConge.RENOUVELABLE);
        congeType.setUnite(CongeType.Unite.Jours);
        congeType.setSoldeInitial(20);
        congeType.setNom("Maladie");
        congeType.setAbreviation("MAL");
        congeType.setGlobal(false);
        congeType.setValidite(new Date());
        congeType.setPeriodicite(Periodicite.MENSUELLE);
        congeType.setLastUpdated(new Date());
        congeType.setOriginalSoldeInitial(20);

        userConges = new UserConges();
        userConges.setId(1L);
        userConges.setUser(user);
        userConges.setCongeType(congeType);
        userConges.setSoldeActuel(20);
    }

    @Test
    void testCreateUserConges_Success() {
        // Arrange
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(congeTypeRepository.findById(1L)).thenReturn(Optional.of(congeType));
        when(userCongesRepository.findByUserIdAndCongeTypeId(1L, 1L)).thenReturn(Optional.empty());
        when(userCongesRepository.save(any(UserConges.class))).thenReturn(userConges);

        // Act
        UserCongesDTO result = userCongesService.createUserConges(userCongesDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getSoldeActuel()).isEqualTo(20);
        verify(userCongesRepository, times(1)).save(any(UserConges.class));
    }

    @Test
    void testCreateUserConges_AlreadyExists() {
        // Arrange
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(congeTypeRepository.findById(1L)).thenReturn(Optional.of(congeType));
        when(userCongesRepository.findByUserIdAndCongeTypeId(1L, 1L)).thenReturn(Optional.of(userConges));

        // Act & Assert
        assertThatThrownBy(() -> userCongesService.createUserConges(userCongesDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User already has this CongeType assigned");
        verify(userCongesRepository, never()).save(any());
    }

    @Test
    void testRequestConge_Success() {
        // Arrange
        when(userCongesRepository.findByUserIdAndCongeTypeId(1L, 1L)).thenReturn(Optional.of(userConges));
        when(userCongesRepository.save(any(UserConges.class))).thenReturn(userConges);

        // Act
        userCongesService.requestConge(1L, 1L, 5);

        // Assert
        assertThat(userConges.getSoldeActuel()).isEqualTo(15);
        verify(userCongesRepository, times(1)).save(userConges);
    }

    @Test
    void testRequestConge_InsufficientBalance() {
        // Arrange
        when(userCongesRepository.findByUserIdAndCongeTypeId(1L, 1L)).thenReturn(Optional.of(userConges));

        // Act & Assert
        assertThatThrownBy(() -> userCongesService.requestConge(1L, 1L, 25))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Solde insuffisant");
        verify(userCongesRepository, never()).save(any());
    }

    @Test
    void testAssignSpecificCongeType_Success() {
        // Arrange
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));
        when(congeTypeRepository.save(any(CongeRenouvelable.class))).thenReturn(congeType);
        when(userCongesRepository.save(any(UserConges.class))).thenReturn(userConges);

        // Act
        UserCongesDTO result = userCongesService.assignSpecificCongeType(1L, userCongesDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getSoldeActuel()).isEqualTo(20);
        verify(congeTypeRepository, times(1)).save(any(CongeRenouvelable.class));
        verify(userCongesRepository, times(1)).save(any(UserConges.class));
    }

    @Test
    void testDeleteSpecificCongeType_Success() {
        // Arrange
        when(userCongesRepository.findByUserIdAndCongeTypeId(1L, 1L)).thenReturn(Optional.of(userConges));
        when(userCongesRepository.findByCongeType(congeType)).thenReturn(new ArrayList<>());

        // Act
        userCongesService.deleteSpecificCongeType(1L, 1L);

        // Assert
        verify(userCongesRepository, times(1)).delete(userConges);
        verify(congeTypeRepository, times(1)).delete(congeType);
    }
}