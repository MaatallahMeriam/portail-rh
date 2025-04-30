package com.example.PORTAIL_RH.teletravail_service.repo;

import com.example.PORTAIL_RH.teletravail_service.entity.TeletravailPlanning;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.YearMonth;
import java.util.List;

public interface TeletravailPlanningRepository extends JpaRepository<TeletravailPlanning, Long> {
    List<TeletravailPlanning> findByMois(YearMonth mois);
    List<TeletravailPlanning> findByRhId(Long rhId);
}
