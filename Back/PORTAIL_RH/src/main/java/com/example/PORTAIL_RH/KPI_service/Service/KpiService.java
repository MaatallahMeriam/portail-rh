package com.example.PORTAIL_RH.KPI_service.Service;

import com.example.PORTAIL_RH.KPI_service.DTO.KpiDTO;

import java.time.LocalDate;
import java.util.List;

public interface KpiService {
    KpiDTO calculateAndSaveKpiForMonth(LocalDate date);
    KpiDTO getLatestKpi();
    KpiDTO getKpiByDate(LocalDate date);
    List<KpiDTO> getAllKpis();
}