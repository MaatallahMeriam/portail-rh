package com.example.PORTAIL_RH.request_service.DTO;

import com.example.PORTAIL_RH.request_service.Entity.Demande.DemandeType;
import com.example.PORTAIL_RH.request_service.Entity.Demande.StatutType;
import com.example.PORTAIL_RH.user_service.conges_service.Entity.CongeType;
import lombok.Data;

import java.util.Date;

@Data
public class DemandeDTO {
    private Long id;
    private DemandeType type;
    private StatutType statut;
    private Long userId;
    private String userNom;
    private Date dateEmission;
    private Date dateValidation;

    // Champs pour Dmd_Conges
    private String fileUrl;
    private String commentaires;
    private Date dateDebut;
    private Date dateFin;
    private CongeType.Unite unite;
    private int duree;
    private Long userCongesId;

    // Champs pour Dmd_Doc
    private String raisonDmd;
    private String typeDocument;
    private Integer nombreCopies;

    // Champs pour Dmd_Log
    private String raisonDmdLog;
    private String commentaire;
    private String departement;
    private String composant;
}