package com.example.PORTAIL_RH.KPI_service.Repo;

import com.example.PORTAIL_RH.KPI_service.Entity.Kpi;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface KpiRepository extends JpaRepository<Kpi, Long> {
    Optional<Kpi> findTopByOrderByDateCalculDesc();
    Optional<Kpi> findByDateCalcul(LocalDate dateCalcul);
}