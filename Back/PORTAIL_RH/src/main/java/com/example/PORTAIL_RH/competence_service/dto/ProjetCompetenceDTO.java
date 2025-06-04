package com.example.PORTAIL_RH.competence_service.dto;

public class ProjetCompetenceDTO {
    private String competenceNom; // Remplacer competenceId par competenceNom
    private String niveauRequis;

    public ProjetCompetenceDTO() {}

    public ProjetCompetenceDTO(String competenceNom, String niveauRequis) {
        this.competenceNom = competenceNom;
        this.niveauRequis = niveauRequis;
    }


    // Getters et setters
    public String getCompetenceNom() {
        return competenceNom;
    }

    public void setCompetenceNom(String competenceNom) {
        this.competenceNom = competenceNom;
    }

    public String getNiveauRequis() {
        return niveauRequis;
    }

    public void setNiveauRequis(String niveauRequis) {
        this.niveauRequis = niveauRequis;
    }

}