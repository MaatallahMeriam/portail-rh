package com.example.PORTAIL_RH.request_service.DTO;

import com.example.PORTAIL_RH.request_service.Entity.Demande.DemandeType;
import com.example.PORTAIL_RH.conges_service.Entity.CongeType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.text.SimpleDateFormat;
import java.util.Date;

@Getter
@Setter
public class DemandeRequest {
    private DemandeType type;
    private Long userId;

    // Champs pour Dmd_Conges
    private String fileUrl;
    private String commentaires;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private String dateDebut;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private String dateFin;
    private CongeType.Unite unite;
    private int duree;
    private Long userCongesId;
    public Date getDateDebutAsDate() {
        try {
            return dateDebut != null ? new SimpleDateFormat("yyyy-MM-dd").parse(dateDebut) : null;
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format for dateDebut");
        }
    }

    public Date getDateFinAsDate() {
        try {
            return dateFin != null ? new SimpleDateFormat("yyyy-MM-dd").parse(dateFin) : null;
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format for dateFin");
        }
    }
    // Champs pour Dmd_Doc
    private String raisonDmdDoc;
    private String typeDocument;
    private Integer nombreCopies;

    // Champs pour Dmd_Log
    private String raisonDmdLog;
    private String commentaireLog;
    private String departement;
    private String composant;
}