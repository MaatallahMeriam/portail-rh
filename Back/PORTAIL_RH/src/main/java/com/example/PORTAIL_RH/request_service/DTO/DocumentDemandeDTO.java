package com.example.PORTAIL_RH.request_service.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class DocumentDemandeDTO {
    // User details
    private Long userId;
    private String nom;
    private String prenom;

    // Demande details
    private Long demandeId;
    private Date dateEmission;

    // Dmd_Doc details
    private String raisonDmd;
    private String typeDocument;
    private Integer nombreCopies;
}