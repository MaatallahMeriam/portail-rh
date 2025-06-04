package com.example.PORTAIL_RH.competence_service.repo;


import com.example.PORTAIL_RH.competence_service.entity.ProjetAffectation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjetAffectationRepository extends JpaRepository<ProjetAffectation, ProjetAffectation.ProjetAffectationId> {
    List<ProjetAffectation> findByProjetId(Long projetId);

    List<ProjetAffectation> findByEmployeId(Long employeId);
}