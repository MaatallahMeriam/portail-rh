package com.example.PORTAIL_RH.auth_service.DTO;

import lombok.Data;

@Data
public class NewRegisterRequest {
    private String userName;
    private String nom;
    private String prenom;
    private String mail;
    private String password; // Optionnel, peut être null
    private String dateNaissance; // Format: yyyy-MM-dd
    private String poste;
    private String departement;
    private String role; // Ex: "RH", "ADMIN", "MANAGER", "COLLAB"
}