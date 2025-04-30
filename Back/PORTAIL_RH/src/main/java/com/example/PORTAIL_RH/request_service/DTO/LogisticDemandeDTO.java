package com.example.PORTAIL_RH.request_service.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class LogisticDemandeDTO {
    // User details
    private Long userId;
    private String nom;
    private String prenom;

    // Demande details
    private Long demandeId;
    private Date dateEmission;

    // Dmd_Log details
    private String raisonDmd;
    private String commentaire;
    private String departement;
    private String composant;
}