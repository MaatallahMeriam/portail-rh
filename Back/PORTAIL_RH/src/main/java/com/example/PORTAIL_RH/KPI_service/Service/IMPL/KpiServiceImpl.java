package com.example.PORTAIL_RH.KPI_service.Service.IMPL;

import com.example.PORTAIL_RH.KPI_service.DTO.KpiDTO;
import com.example.PORTAIL_RH.KPI_service.Entity.Kpi;
import com.example.PORTAIL_RH.KPI_service.Repo.KpiRepository;
import com.example.PORTAIL_RH.KPI_service.Service.KpiService;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class KpiServiceImpl implements KpiService {

    @Autowired
    private KpiRepository kpiRepository;

    @Autowired
    private UsersRepository usersRepository;

    private KpiDTO mapToDTO(Kpi kpi) {
        KpiDTO dto = new KpiDTO();
        dto.setId(kpi.getId());
        dto.setNbreDepart(kpi.getNbreDepart());
        dto.setEffectifDebut(kpi.getEffectifDebut());
        dto.setEffectifFin(kpi.getEffectifFin());
        dto.setEffectifMoyen(kpi.getEffectifMoyen());
        dto.setTurnover(kpi.getTurnover());
        dto.setDateCalcul(kpi.getDateCalcul());
        return dto;
    }

    private Kpi mapToEntity(KpiDTO dto) {
        Kpi kpi = new Kpi();
        kpi.setNbreDepart(dto.getNbreDepart());
        kpi.setEffectifDebut(dto.getEffectifDebut());
        kpi.setEffectifFin(dto.getEffectifFin());
        kpi.setEffectifMoyen(dto.getEffectifMoyen());
        kpi.setTurnover(dto.getTurnover());
        kpi.setDateCalcul(dto.getDateCalcul());
        return kpi;
    }

    @Override
    public KpiDTO calculateAndSaveKpiForMonth(LocalDate date) {
        // Définir le début et la fin du mois
        LocalDate startOfMonth = date.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = date.with(TemporalAdjusters.lastDayOfMonth());

        // Compter le nombre de départs (active = false)
        int nbreDepart = usersRepository.findAllByActiveFalse().size();

        // Compter l'effectif au début et à la fin du mois
        // Note : Puisqu'on n'a pas de données historiques précises, on utilise le total actuel
        // Si tu as une table pour suivre les changements d'état, il faudrait ajuster ici
        int effectifDebut = usersRepository.findAll().size(); // Approximation
        int effectifFin = usersRepository.findAll().size();   // Approximation

        // Calculer l'effectif moyen
        int effectifMoyen = (effectifDebut + effectifFin) / 2;

        // Calculer le taux de turnover
        double turnover = effectifMoyen > 0 ? ((double) nbreDepart / effectifMoyen) * 100 : 0.0;

        // Créer et sauvegarder le KPI
        Kpi kpi = new Kpi();
        kpi.setNbreDepart(nbreDepart);
        kpi.setEffectifDebut(effectifDebut);
        kpi.setEffectifFin(effectifFin);
        kpi.setEffectifMoyen(effectifMoyen);
        kpi.setTurnover(turnover);
        kpi.setDateCalcul(endOfMonth);

        Kpi savedKpi = kpiRepository.save(kpi);
        return mapToDTO(savedKpi);
    }

    // Scheduler pour exécuter le calcul à la fin de chaque mois
    @Scheduled(cron = "0 0 0 L * ?") // Exécute le dernier jour du mois à minuit
    public void calculateKpiAutomatically() {
        LocalDate today = LocalDate.now();
        calculateAndSaveKpiForMonth(today);
    }

    @Override
    public KpiDTO getLatestKpi() {
        return kpiRepository.findTopByOrderByDateCalculDesc()
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("No KPI found"));
    }

    @Override
    public KpiDTO getKpiByDate(LocalDate date) {
        return kpiRepository.findByDateCalcul(date.with(TemporalAdjusters.lastDayOfMonth()))
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("No KPI found for date: " + date));
    }

    @Override
    public List<KpiDTO> getAllKpis() {
        return kpiRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
}