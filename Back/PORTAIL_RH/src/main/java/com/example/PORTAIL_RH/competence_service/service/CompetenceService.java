package com.example.PORTAIL_RH.competence_service.service;

import com.example.PORTAIL_RH.competence_service.dto.*;
import com.example.PORTAIL_RH.competence_service.entity.EmployeCompetence;

import java.util.List;

public interface CompetenceService {
    EmployeCompetenceDTO addEmployeCompetence(EmployeCompetenceDTO employeCompetenceDTO); // Plus de CompetenceDTO
    ProjetDTO createProjet(ProjetDTO projetDTO);
    ProjetAffectationDTO affecterEmployeAProjet(ProjetAffectationDTO affectationDTO);
    List<MatchingResultDTO> matchEmployesToProjet(Long projetId);
    List<EmployeCompetenceDTO> getCompetencesByEmploye(Long employeId);
    List<EmployeCompetenceDTO> getCompetencesByEquipe(Long equipeId);
    List<ProjetAffectationDTO> getAffectationsByProjet(Long projetId);
    void desaffecterEmployeAProjet(Long projetId, Long employeId);
    List<ProjetDTO> getProjetsByEmploye(Long employeId);
    void deleteProjet(Long projetId);
    List<EmployeCompetence> getCompetencesByCompetenceNom(String competenceNom);
}