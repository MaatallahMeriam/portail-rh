package com.example.PORTAIL_RH.conges_service.service.impl;

import com.example.PORTAIL_RH.conges_service.DTO.CongeTypeDTO;
import com.example.PORTAIL_RH.conges_service.Entity.CongeIncrementale;
import com.example.PORTAIL_RH.conges_service.Entity.CongeRenouvelable;
import com.example.PORTAIL_RH.conges_service.Entity.CongeType;
import com.example.PORTAIL_RH.conges_service.Entity.Periodicite;
import com.example.PORTAIL_RH.conges_service.Entity.UserConges;
import com.example.PORTAIL_RH.conges_service.Repo.CongeTypeRepository;
import com.example.PORTAIL_RH.conges_service.Repo.UserCongesRepository;
import com.example.PORTAIL_RH.conges_service.Service.IMPL.CongeTypeServiceImpl;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CongeTypeServiceImplTest {

    @Mock
    private CongeTypeRepository congeTypeRepository;

    @Mock
    private UserCongesRepository userCongesRepository;

    @Mock
    private UsersRepository usersRepository;

    @InjectMocks
    private CongeTypeServiceImpl congeTypeService;

    private CongeTypeDTO congeTypeDTO;
    private Users user;
    private UserConges userConges;
    private CongeRenouvelable conge;

    @BeforeEach
    void setUp() {
        congeTypeDTO = new CongeTypeDTO();
        congeTypeDTO.setType(CongeType.TypeConge.RENOUVELABLE);
        congeTypeDTO.setUnite(CongeType.Unite.Jours);
        congeTypeDTO.setSoldeInitial(20);
        congeTypeDTO.setNom("Maladie");
        congeTypeDTO.setAbreviation("MAL");
        congeTypeDTO.setGlobal(true);
        congeTypeDTO.setValidite(new Date());
        congeTypeDTO.setPeriodicite(Periodicite.MENSUELLE);

        user = new Users();
        user.setId(1L);
        user.setCongesList(new HashSet<>());

        userConges = new UserConges();
        userConges.setId(1L);
        userConges.setUser(user);
        userConges.setSoldeActuel(20);

        conge = new CongeRenouvelable();
        conge.setId(1L);
        conge.setType(CongeType.TypeConge.RENOUVELABLE);
        conge.setUnite(CongeType.Unite.Jours);
        conge.setSoldeInitial(20);
        conge.setNom("Maladie");
        conge.setAbreviation("MAL");
        conge.setGlobal(true);
        conge.setValidite(new Date());
        conge.setPeriodicite(Periodicite.MENSUELLE);
        conge.setLastUpdated(new Date());
        conge.setOriginalSoldeInitial(20);
    }

    @Test
    void testCreateCongeType_Renouvelable_Success() {
        // Arrange
        CongeRenouvelable savedConge = new CongeRenouvelable();
        savedConge.setId(1L);
        savedConge.setType(CongeType.TypeConge.RENOUVELABLE);
        savedConge.setUnite(CongeType.Unite.Jours);
        savedConge.setSoldeInitial(20);
        savedConge.setNom("Maladie");
        savedConge.setAbreviation("MAL");
        savedConge.setGlobal(true);
        savedConge.setValidite(new Date());
        savedConge.setPeriodicite(Periodicite.MENSUELLE);
        savedConge.setLastUpdated(new Date());
        savedConge.setOriginalSoldeInitial(20);

        when(congeTypeRepository.save(any(CongeRenouvelable.class))).thenReturn(savedConge);
        when(usersRepository.findAll()).thenReturn(List.of(user));

        // Act
        CongeTypeDTO result = congeTypeService.createCongeType(congeTypeDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getType()).isEqualTo(CongeType.TypeConge.RENOUVELABLE);
        assertThat(result.getSoldeInitial()).isEqualTo(20);
        verify(congeTypeRepository, times(1)).save(any(CongeRenouvelable.class));
        verify(usersRepository, times(1)).saveAll(anyList());
    }

    @Test
    void testCreateCongeType_Incrementale_Success() {
        // Arrange
        congeTypeDTO.setType(CongeType.TypeConge.INCREMENTALE);
        congeTypeDTO.setPasIncrementale(5);
        CongeIncrementale savedConge = new CongeIncrementale();
        savedConge.setId(1L);
        savedConge.setType(CongeType.TypeConge.INCREMENTALE);
        savedConge.setUnite(CongeType.Unite.Jours);
        savedConge.setSoldeInitial(20);
        savedConge.setNom("Maladie");
        savedConge.setAbreviation("MAL");
        savedConge.setGlobal(true);
        savedConge.setValidite(new Date());
        savedConge.setPeriodicite(Periodicite.MENSUELLE);
        savedConge.setPasIncrementale(5);
        savedConge.setLastUpdated(new Date());

        when(congeTypeRepository.save(any(CongeIncrementale.class))).thenReturn(savedConge);
        when(usersRepository.findAll()).thenReturn(List.of(user));

        // Act
        CongeTypeDTO result = congeTypeService.createCongeType(congeTypeDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getType()).isEqualTo(CongeType.TypeConge.INCREMENTALE);
        assertThat(result.getPasIncrementale()).isEqualTo(5);
        verify(congeTypeRepository, times(1)).save(any(CongeIncrementale.class));
    }

    @Test
    void testUpdateCongeType_Renouvelable_Success() {
        // Arrange
        CongeRenouvelable existing = new CongeRenouvelable();
        existing.setId(1L);
        existing.setType(CongeType.TypeConge.RENOUVELABLE);
        existing.setUnite(CongeType.Unite.Jours);
        existing.setSoldeInitial(20);
        existing.setNom("Maladie");
        existing.setAbreviation("MAL");
        existing.setGlobal(true);
        existing.setValidite(new Date());
        existing.setPeriodicite(Periodicite.MENSUELLE);
        existing.setLastUpdated(new Date());
        existing.setOriginalSoldeInitial(20);

        congeTypeDTO.setSoldeInitial(25);
        congeTypeDTO.setNom("Updated Maladie");

        when(congeTypeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(congeTypeRepository.save(any(CongeRenouvelable.class))).thenReturn(existing);

        // Act
        CongeTypeDTO result = congeTypeService.updateCongeType(1L, congeTypeDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getSoldeInitial()).isEqualTo(25);
        assertThat(result.getNom()).isEqualTo("Updated Maladie");
        verify(congeTypeRepository, times(1)).save(any(CongeRenouvelable.class));
    }

    @Test
    void testDeleteCongeType_Success() {
        // Arrange
        CongeRenouvelable conge = new CongeRenouvelable();
        conge.setId(1L);
        when(congeTypeRepository.existsById(1L)).thenReturn(true);
        // Removed unnecessary stubbing: when(congeTypeRepository.findById(1L)).thenReturn(Optional.of(conge));

        // Act
        congeTypeService.deleteCongeType(1L);

        // Assert
        verify(userCongesRepository, times(1)).deleteByCongeTypeId(1L);
        verify(congeTypeRepository, times(1)).deleteById(1L);
    }

    @Test
    void testUpdateCongeBalances_Renouvelable() {
        // Arrange
        CongeRenouvelable conge = new CongeRenouvelable();
        conge.setId(1L);
        conge.setType(CongeType.TypeConge.RENOUVELABLE);
        conge.setSoldeInitial(10);
        conge.setOriginalSoldeInitial(20);
        conge.setPeriodicite(Periodicite.MENSUELLE);
        conge.setLastUpdated(new Date(System.currentTimeMillis() - 61 * 24 * 60 * 60 * 1000L)); // 61 days ago (March 30, 2025)

        List<CongeType> congeTypes = List.of(conge);
        when(congeTypeRepository.findByTypeIn(anyList())).thenReturn(congeTypes);
        when(userCongesRepository.findByCongeType(conge)).thenReturn(List.of(userConges));

        // Act
        congeTypeService.updateCongeBalances();

        // Assert
        assertThat(conge.getSoldeInitial()).isEqualTo(20);
        verify(congeTypeRepository, times(1)).save(conge);
        verify(userCongesRepository, times(1)).save(userConges);
    }
}