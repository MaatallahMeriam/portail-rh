package com.example.PORTAIL_RH.kpi_service.service.impl;

import com.example.PORTAIL_RH.KPI_service.DTO.KpiDTO;
import com.example.PORTAIL_RH.KPI_service.Entity.Kpi;
import com.example.PORTAIL_RH.KPI_service.Repo.KpiRepository;
import com.example.PORTAIL_RH.KPI_service.Service.IMPL.KpiServiceImpl;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KpiServiceImplTest {

    @Mock
    private KpiRepository kpiRepository;

    @Mock
    private UsersRepository usersRepository;

    @InjectMocks
    private KpiServiceImpl kpiService;

    private Kpi kpi;
    private KpiDTO kpiDTO;
    private LocalDate testDate;

    @BeforeEach
    void setUp() {
        testDate = LocalDate.of(2025, 5, 15); // May 15, 2025
        kpi = new Kpi();
        kpi.setId(1L);
        kpi.setNbreDepart(5);
        kpi.setEffectifDebut(100);
        kpi.setEffectifFin(100); // Align with mocked service behavior
        kpi.setEffectifMoyen(100); // (100 + 100) / 2
        kpi.setTurnover(5.0); // (5 / 100) * 100
        kpi.setDateCalcul(testDate.with(TemporalAdjusters.lastDayOfMonth())); // May 31, 2025

        kpiDTO = new KpiDTO();
        kpiDTO.setId(1L);
        kpiDTO.setNbreDepart(5);
        kpiDTO.setEffectifDebut(100);
        kpiDTO.setEffectifFin(100); // Align with mocked service behavior
        kpiDTO.setEffectifMoyen(100); // (100 + 100) / 2
        kpiDTO.setTurnover(5.0); // (5 / 100) * 100
        kpiDTO.setDateCalcul(testDate.with(TemporalAdjusters.lastDayOfMonth()));
    }

    @Test
    void testCalculateAndSaveKpiForMonth_Success() {
        // Arrange
        when(usersRepository.findAllByActiveFalse()).thenReturn(Collections.nCopies(5, new Users())); // 5 inactive users
        when(usersRepository.findAll()).thenReturn(Collections.nCopies(100, new Users())); // 100 total users
        when(kpiRepository.save(any(Kpi.class))).thenReturn(kpi);

        // Act
        KpiDTO result = kpiService.calculateAndSaveKpiForMonth(testDate);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getNbreDepart()).isEqualTo(5);
        assertThat(result.getEffectifDebut()).isEqualTo(100);
        assertThat(result.getEffectifFin()).isEqualTo(100);
        assertThat(result.getEffectifMoyen()).isEqualTo(100); // (100 + 100) / 2
        assertThat(result.getTurnover()).isCloseTo(5.0, within(0.01)); // (5 / 100) * 100
        assertThat(result.getDateCalcul()).isEqualTo(LocalDate.of(2025, 5, 31));
        verify(kpiRepository, times(1)).save(any(Kpi.class));
    }

    @Test
    void testCalculateAndSaveKpiForMonth_ZeroEffectifMoyen() {
        // Arrange
        when(usersRepository.findAllByActiveFalse()).thenReturn(Collections.nCopies(5, new Users())); // 5 inactive users
        when(usersRepository.findAll()).thenReturn(Collections.emptyList()); // 0 total users
        Kpi zeroKpi = new Kpi();
        zeroKpi.setId(1L);
        zeroKpi.setNbreDepart(5);
        zeroKpi.setEffectifDebut(0);
        zeroKpi.setEffectifFin(0);
        zeroKpi.setEffectifMoyen(0); // (0 + 0) / 2
        zeroKpi.setTurnover(0.0); // Turnover is 0 when effectifMoyen is 0
        zeroKpi.setDateCalcul(testDate.with(TemporalAdjusters.lastDayOfMonth()));
        when(kpiRepository.save(any(Kpi.class))).thenReturn(zeroKpi);

        // Act
        KpiDTO result = kpiService.calculateAndSaveKpiForMonth(testDate);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getNbreDepart()).isEqualTo(5);
        assertThat(result.getEffectifDebut()).isEqualTo(0);
        assertThat(result.getEffectifFin()).isEqualTo(0);
        assertThat(result.getEffectifMoyen()).isEqualTo(0); // Fixed to expect 0
        assertThat(result.getTurnover()).isEqualTo(0.0);
        assertThat(result.getDateCalcul()).isEqualTo(LocalDate.of(2025, 5, 31));
        verify(kpiRepository, times(1)).save(any(Kpi.class));
    }

    @Test
    void testCalculateKpiAutomatically() {
        // Arrange
        when(usersRepository.findAllByActiveFalse()).thenReturn(Collections.nCopies(5, new Users()));
        when(usersRepository.findAll()).thenReturn(Collections.nCopies(100, new Users()));
        when(kpiRepository.save(any(Kpi.class))).thenReturn(kpi);

        // Act
        kpiService.calculateKpiAutomatically();

        // Assert
        verify(kpiRepository, times(1)).save(any(Kpi.class));
    }

    @Test
    void testGetLatestKpi_Success() {
        // Arrange
        when(kpiRepository.findTopByOrderByDateCalculDesc()).thenReturn(Optional.of(kpi));

        // Act
        KpiDTO result = kpiService.getLatestKpi();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTurnover()).isEqualTo(5.0);
        assertThat(result.getDateCalcul()).isEqualTo(LocalDate.of(2025, 5, 31));
    }

    @Test
    void testGetLatestKpi_NotFound() {
        // Arrange
        when(kpiRepository.findTopByOrderByDateCalculDesc()).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> kpiService.getLatestKpi())
                .isInstanceOf(RuntimeException.class)
                .hasMessage("No KPI found");
    }

    @Test
    void testGetKpiByDate_Success() {
        // Arrange
        LocalDate endOfMonth = testDate.with(TemporalAdjusters.lastDayOfMonth());
        when(kpiRepository.findByDateCalcul(endOfMonth)).thenReturn(Optional.of(kpi));

        // Act
        KpiDTO result = kpiService.getKpiByDate(testDate);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTurnover()).isEqualTo(5.0);
        assertThat(result.getDateCalcul()).isEqualTo(endOfMonth);
    }

    @Test
    void testGetKpiByDate_NotFound() {
        // Arrange
        LocalDate endOfMonth = testDate.with(TemporalAdjusters.lastDayOfMonth());
        when(kpiRepository.findByDateCalcul(endOfMonth)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> kpiService.getKpiByDate(testDate))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("No KPI found for date: 2025-05-15");
    }

    @Test
    void testGetAllKpis_Success() {
        // Arrange
        when(kpiRepository.findAll()).thenReturn(List.of(kpi));

        // Act
        List<KpiDTO> result = kpiService.getAllKpis();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getTurnover()).isEqualTo(5.0);
    }

    @Test
    void testGetAllKpis_Empty() {
        // Arrange
        when(kpiRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<KpiDTO> result = kpiService.getAllKpis();

        // Assert
        assertThat(result).isEmpty();
    }
}