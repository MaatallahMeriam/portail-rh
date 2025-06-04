package com.example.PORTAIL_RH.competence_service.repo;


import com.example.PORTAIL_RH.competence_service.entity.EmployeCompetence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeCompetenceRepository extends JpaRepository<EmployeCompetence, EmployeCompetence.EmployeCompetenceId> {
    List<EmployeCompetence> findByEmployeId(Long employeId);
    List<EmployeCompetence> findByEmployeEquipeId(Long equipeId);
}