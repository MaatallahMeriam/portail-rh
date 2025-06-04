package com.example.PORTAIL_RH.competence_service.repo;


import com.example.PORTAIL_RH.competence_service.entity.ProjetCompetence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjetCompetenceRepository extends JpaRepository<ProjetCompetence, ProjetCompetence.ProjetCompetenceId> {
    List<ProjetCompetence> findByProjetId(Long projetId);
}
