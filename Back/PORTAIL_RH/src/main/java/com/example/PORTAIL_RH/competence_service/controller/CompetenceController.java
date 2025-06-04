package com.example.PORTAIL_RH.competence_service.controller;

import com.example.PORTAIL_RH.competence_service.dto.*;
import com.example.PORTAIL_RH.competence_service.entity.Projet;
import com.example.PORTAIL_RH.competence_service.repo.ProjetRepository;
import com.example.PORTAIL_RH.competence_service.service.CompetenceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/competences")
public class CompetenceController {
    @Autowired
    private ProjetRepository projetRepository;
    @Autowired
    private CompetenceService competenceService;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/employe")
    public ResponseEntity<EmployeCompetenceDTO> addEmployeCompetence(@RequestBody EmployeCompetenceDTO employeCompetenceDTO) {
        return ResponseEntity.ok(competenceService.addEmployeCompetence(employeCompetenceDTO));
    }
    @GetMapping("/projet/{projetId}/affectations")
    public ResponseEntity<List<ProjetAffectationDTO>> getAffectationsByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(competenceService.getAffectationsByProjet(projetId));
    }
    @DeleteMapping("/affectation/{projetId}/{employeId}")
    public ResponseEntity<Void> desaffecterEmployeAProjet(@PathVariable Long projetId, @PathVariable Long employeId) {
        try {
            competenceService.desaffecterEmployeAProjet(projetId, employeId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/employe/{employeId}/projets")
    public ResponseEntity<List<ProjetDTO>> getProjetsByEmploye(@PathVariable Long employeId) {
        return ResponseEntity.ok(competenceService.getProjetsByEmploye(employeId));
    }
    @DeleteMapping("/projet/{projetId}")
    public ResponseEntity<Void> deleteProjet(@PathVariable Long projetId) {
        try {
            competenceService.deleteProjet(projetId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @PostMapping(value = "/projet", consumes = "multipart/form-data")
    public ResponseEntity<ProjetDTO> createProjet(
            @RequestParam("nom") String nom,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("competencesRequises") String competencesRequisesJson,
            @RequestParam(value = "cahierCharge", required = false) MultipartFile cahierCharge) throws IOException {
        ProjetDTO projetDTO = new ProjetDTO();
        projetDTO.setNom(nom);
        projetDTO.setDescription(description);

        List<ProjetCompetenceDTO> competencesRequises = objectMapper.readValue(
                competencesRequisesJson,
                objectMapper.getTypeFactory().constructCollectionType(List.class, ProjetCompetenceDTO.class)
        );
        projetDTO.setCompetencesRequises(competencesRequises);

        if (cahierCharge != null && !cahierCharge.isEmpty()) {
            projetDTO.setCahierCharge(cahierCharge.getBytes());
        }

        return ResponseEntity.ok(competenceService.createProjet(projetDTO));
    }

    @PostMapping("/affectation")
    public ResponseEntity<ProjetAffectationDTO> affecterEmployeAProjet(@RequestBody ProjetAffectationDTO affectationDTO) {
        return ResponseEntity.ok(competenceService.affecterEmployeAProjet(affectationDTO));
    }

    @GetMapping("/projet/{projetId}/matching")
    public ResponseEntity<List<MatchingResultDTO>> matchEmployesToProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(competenceService.matchEmployesToProjet(projetId));
    }

    @GetMapping("/employe/{employeId}")
    public ResponseEntity<List<EmployeCompetenceDTO>> getCompetencesByEmploye(@PathVariable Long employeId) {
        return ResponseEntity.ok(competenceService.getCompetencesByEmploye(employeId));
    }

    @GetMapping("/equipe/{equipeId}")
    public ResponseEntity<List<EmployeCompetenceDTO>> getCompetencesByEquipe(@PathVariable Long equipeId) {
        return ResponseEntity.ok(competenceService.getCompetencesByEquipe(equipeId));
    }
    @GetMapping("/projet")
    public ResponseEntity<List<ProjetDTO>> getAllProjets() {
        List<Projet> projets = projetRepository.findAll();
        List<ProjetDTO> projetDTOs = projets.stream().map(projet -> {
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
        return ResponseEntity.ok(projetDTOs);
    }



    @GetMapping("/projet/{projetId}")
    public ResponseEntity<ProjetDTO> getProjetById(@PathVariable Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
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
        return ResponseEntity.ok(projetDTO);
    }

    @GetMapping("/projet/{projetId}/cahierCharge/download")
    public ResponseEntity<byte[]> downloadCahierCharge(@PathVariable Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        byte[] cahierCharge = projet.getCahierCharge();
        if (cahierCharge == null || cahierCharge.length == 0) {
            throw new RuntimeException("Aucun cahier de charges trouvé pour ce projet");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "cahier_de_charge.pdf");
        headers.setContentLength(cahierCharge.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(cahierCharge);
    }
}