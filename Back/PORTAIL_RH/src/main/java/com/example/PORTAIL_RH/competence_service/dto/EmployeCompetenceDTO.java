package com.example.PORTAIL_RH.competence_service.dto;

public class EmployeCompetenceDTO {
    private Long employeId;
    private String competenceNom; // Remplacer competenceId par competenceNom
    private String niveau;

    public EmployeCompetenceDTO() {}

    public EmployeCompetenceDTO(Long employeId, String competenceNom, String niveau) {
        this.employeId = employeId;
        this.competenceNom = competenceNom;
        this.niveau = niveau;
    }

    // Getters et setters
    public Long getEmployeId() {
        return employeId;
    }

    public void setEmployeId(Long employeId) {
        this.employeId = employeId;
    }

    public String getCompetenceNom() {
        return competenceNom;
    }

    public void setCompetenceNom(String competenceNom) {
        this.competenceNom = competenceNom;
    }

    public String getNiveau() {
        return niveau;
    }

    public void setNiveau(String niveau) {
        this.niveau = niveau;
    }
}