package com.example.PORTAIL_RH.competence_service.dto;

import java.util.List;

public class ProjetDTO {
    private Long id;
    private String nom;
    private String description;
    private byte[] cahierCharge; // Ajout du champ pour le document
    private List<ProjetCompetenceDTO> competencesRequises;

    public ProjetDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public byte[] getCahierCharge() {
        return cahierCharge;
    }

    public void setCahierCharge(byte[] cahierCharge) {
        this.cahierCharge = cahierCharge;
    }

    public List<ProjetCompetenceDTO> getCompetencesRequises() {
        return competencesRequises;
    }

    public void setCompetencesRequises(List<ProjetCompetenceDTO> competencesRequises) {
        this.competencesRequises = competencesRequises;
    }
}