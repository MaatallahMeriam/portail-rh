package com.example.PORTAIL_RH.request_service.DTO;

import com.example.PORTAIL_RH.request_service.Entity.Demande;
import com.example.PORTAIL_RH.conges_service.Entity.CongeType;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class ManagerCongesDemandeDTO {
    // User details
    private Long userId;
    private String nom;
    private String prenom;

    // Demande details
    private Long demandeId;
    private Demande.StatutType statut;
    private Date dateEmission;
    private Date dateValidation;

    // Congé details (from Dmd_Conges and UserConges/CongeType)
    private String congeNom; // From CongeType.nom
    private Date dateDebut;
    private Date dateFin;
    private int duree;
    private CongeType.Unite unite;
    private int soldeActuel; // From UserConges.soldeActuel
}