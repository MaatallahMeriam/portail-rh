package com.example.PORTAIL_RH.competence_service.service.impl;

import com.example.PORTAIL_RH.competence_service.dto.*;
import com.example.PORTAIL_RH.competence_service.entity.*;
import com.example.PORTAIL_RH.competence_service.repo.*;
import com.example.PORTAIL_RH.competence_service.service.CompetenceService;
import com.example.PORTAIL_RH.notification_service.Service.NotificationService;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CompetenceServiceImpl implements CompetenceService {
    @Autowired
    private RestTemplate restTemplate;

    private static final String SIMILARITY_API_URL = "http://localhost:8000/similarity";
    private static final double SIMILARITY_THRESHOLD = 0.5;
    @Autowired
    private EmployeCompetenceRepository employeCompetenceRepository;

    @Autowired
    private ProjetRepository projetRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private ProjetCompetenceRepository projetCompetenceRepository;

    @Autowired
    private ProjetAffectationRepository projetAffectationRepository;

    @Autowired
    private UsersRepository usersRepository;

    private static final Map<String, Integer> NIVEAUX = Map.of(
            "Débutant", 1,
            "Intermédiaire", 2,
            "Expert", 3
    );

    @Override
    public EmployeCompetenceDTO addEmployeCompetence(EmployeCompetenceDTO employeCompetenceDTO) {
        EmployeCompetence employeCompetence = new EmployeCompetence();
        employeCompetence.setId(new EmployeCompetence.EmployeCompetenceId(
                employeCompetenceDTO.getEmployeId(),
                employeCompetenceDTO.getCompetenceNom()
        ));
        employeCompetence.setEmploye(usersRepository.findById(employeCompetenceDTO.getEmployeId())
                .orElseThrow(() -> new RuntimeException("Employé non trouvé")));
        employeCompetence.setNiveau(employeCompetenceDTO.getNiveau());
        employeCompetenceRepository.save(employeCompetence);
        return employeCompetenceDTO;
    }
    @Override
    public List<EmployeCompetence> getCompetencesByCompetenceNom(String competenceNom) {
        return employeCompetenceRepository.findByIdCompetenceNomContainingIgnoreCase(competenceNom);
    }
    @Override
    public ProjetDTO createProjet(ProjetDTO projetDTO) {
        Projet projet = new Projet();
        projet.setNom(projetDTO.getNom());
        projet.setDescription(projetDTO.getDescription());
        projet.setCahierCharge(projetDTO.getCahierCharge()); // Ajout du cahier de charge
        for (ProjetCompetenceDTO competenceDTO : projetDTO.getCompetencesRequises()) {
            ProjetCompetence projetCompetence = new ProjetCompetence();
            projetCompetence.setId(new ProjetCompetence.ProjetCompetenceId(0L, competenceDTO.getCompetenceNom()));
            projetCompetence.setProjet(projet);
            projetCompetence.setNiveauRequis(competenceDTO.getNiveauRequis());
            projet.getCompetencesRequises().add(projetCompetence);
        }
        projet = projetRepository.save(projet);
        projetDTO.setId(projet.getId());
        return projetDTO;
    }
    @Override
    public ProjetAffectationDTO affecterEmployeAProjet(ProjetAffectationDTO affectationDTO) {
        ProjetAffectation affectation = new ProjetAffectation();
        affectation.setId(new ProjetAffectation.ProjetAffectationId(
                affectationDTO.getProjetId(),
                affectationDTO.getEmployeId()
        ));
        affectation.setProjet(projetRepository.findById(affectationDTO.getProjetId())
                .orElseThrow(() -> new RuntimeException("Projet non trouvé")));
        affectation.setEmploye(usersRepository.findById(affectationDTO.getEmployeId())
                .orElseThrow(() -> new RuntimeException("Employé non trouvé")));
        projetAffectationRepository.save(affectation);

        // Créer une notification pour l'utilisateur affecté
        Users employe = affectation.getEmploye();
        Projet projet = affectation.getProjet();
        Long projetId = projet.getId();
        Users triggeredByUser = null;
        String message = String.format("Vous avez été affecté au projet '%s'... voir détails", projet.getNom());
        notificationService.createNotificationForUser(employe, message, "PROJET_AFFECTATION", projetId, triggeredByUser);

        return affectationDTO;
    }





    @Override
    public List<MatchingResultDTO> matchEmployesToProjet(Long projetId) {
        List<ProjetCompetence> besoins = projetCompetenceRepository.findByProjetId(projetId);
        List<EmployeCompetence> competences = employeCompetenceRepository.findAll();

        return usersRepository.findAll().stream().map(employe -> {
                    double score = 0;
                    for (ProjetCompetence besoin : besoins) {
                        for (EmployeCompetence competence : competences) {
                            if (competence.getEmploye().getId().equals(employe.getId())) {
                                if (competence.getId().getCompetenceNom().equalsIgnoreCase(besoin.getId().getCompetenceNom()) &&
                                        isNiveauSuffisant(competence.getNiveau(), besoin.getNiveauRequis())) {
                                    score += 1.0;
                                } else {
                                    double similarity = getCompetenceSimilarity(
                                            competence.getId().getCompetenceNom(),
                                            besoin.getId().getCompetenceNom()
                                    );
                                    if (similarity >= SIMILARITY_THRESHOLD &&
                                            isNiveauSuffisant(competence.getNiveau(), besoin.getNiveauRequis())) {
                                        score += similarity * 0.5;
                                    }
                                }
                            }
                        }
                    }
                    return new MatchingResultDTO(employe.getId(), employe.getNom() + " " + employe.getPrenom(), score);
                })
                .filter(result -> result.getScore() > 0)
                .sorted((r1, r2) -> Double.compare(r2.getScore(), r1.getScore()))
                .collect(Collectors.toList());
    }

    @Cacheable(value = "similarityCache", key = "#competence1 + '-' + #competence2")
    private double getCompetenceSimilarity(String competence1, String competence2) {
        try {
            Map<String, String> request = Map.of("competence1", competence1, "competence2", competence2);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(SIMILARITY_API_URL, request, Map.class);
            return response != null ? ((Number) response.get("similarity")).doubleValue() : 0.0;
        } catch (Exception e) {
            System.err.println("Erreur lors de l'appel au service de similarité : " + e.getMessage());
            return 0.0;
        }
    }
    @Override
    public void deleteProjet(Long projetId) {
        // Vérifier si le projet existe
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec l'ID : " + projetId));

        // Supprimer toutes les affectations liées au projet
        List<ProjetAffectation> affectations = projetAffectationRepository.findByProjetId(projetId);
        if (!affectations.isEmpty()) {
            projetAffectationRepository.deleteAll(affectations);
        }

        // Supprimer toutes les compétences requises liées au projet
        List<ProjetCompetence> competencesRequises = projetCompetenceRepository.findByProjetId(projetId);
        if (!competencesRequises.isEmpty()) {
            projetCompetenceRepository.deleteAll(competencesRequises);
        }

        // Supprimer le projet lui-même
        projetRepository.delete(projet);
    }
    @Override
    public void desaffecterEmployeAProjet(Long projetId, Long employeId) {
        ProjetAffectation.ProjetAffectationId id = new ProjetAffectation.ProjetAffectationId(projetId, employeId);
        if (projetAffectationRepository.existsById(id)) {
            projetAffectationRepository.deleteById(id);
        } else {
            throw new RuntimeException("Affectation non trouvée pour projetId=" + projetId + " et employeId=" + employeId);
        }
    }
    @Override
    public List<ProjetDTO> getProjetsByEmploye(Long employeId) {
        // Récupérer les affectations pour l'employé donné
        List<ProjetAffectation> affectations = projetAffectationRepository.findByEmployeId(employeId);

        // Extraire les IDs des projets à partir des affectations
        List<Long> projetIds = affectations.stream()
                .map(affectation -> affectation.getId().getProjetId())
                .distinct()
                .collect(Collectors.toList());

        // Récupérer les projets correspondants
        List<Projet> projets = projetRepository.findAllById(projetIds);

        // Convertir les entités Projet en DTOs
        return projets.stream().map(projet -> {
            ProjetDTO projetDTO = new ProjetDTO();
            projetDTO.setId(projet.getId());
            projetDTO.setNom(projet.getNom());
            projetDTO.setDescription(projet.getDescription());
            projetDTO.setCahierCharge(projet.getCahierCharge());
            projetDTO.setCompetencesRequises(
                    projet.getCompetencesRequises().stream()
                            .map(pc -> new ProjetCompetenceDTO(pc.getId().getCompetenceNom(), pc.getNiveauRequis()))
                            .collect(Collectors.toList())
            );
            return projetDTO;
        }).collect(Collectors.toList());
    }
    @Override
    public List<ProjetAffectationDTO> getAffectationsByProjet(Long projetId) {
        return projetAffectationRepository.findByProjetId(projetId).stream()
                .map(affectation -> {
                    ProjetAffectationDTO dto = new ProjetAffectationDTO();
                    dto.setProjetId(affectation.getId().getProjetId());
                    dto.setEmployeId(affectation.getId().getEmployeId());
                    return dto;
                })
                .collect(Collectors.toList());
    }
    @Override
    public List<EmployeCompetenceDTO> getCompetencesByEmploye(Long employeId) {
        return employeCompetenceRepository.findByEmployeId(employeId).stream()
                .map(ec -> new EmployeCompetenceDTO(ec.getEmploye().getId(), ec.getId().getCompetenceNom(), ec.getNiveau()))
                .collect(Collectors.toList());
    }

    @Override
    public List<EmployeCompetenceDTO> getCompetencesByEquipe(Long equipeId) {
        return employeCompetenceRepository.findByEmployeEquipeId(equipeId).stream()
                .map(ec -> new EmployeCompetenceDTO(ec.getEmploye().getId(), ec.getId().getCompetenceNom(), ec.getNiveau()))
                .collect(Collectors.toList());
    }

    private boolean isNiveauSuffisant(String niveauEmploye, String niveauRequis) {
        return NIVEAUX.getOrDefault(niveauEmploye, 0) >= NIVEAUX.getOrDefault(niveauRequis, 0);
    }
}