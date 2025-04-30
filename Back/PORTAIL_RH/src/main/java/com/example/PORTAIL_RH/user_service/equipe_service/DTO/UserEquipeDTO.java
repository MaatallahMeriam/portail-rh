package com.example.PORTAIL_RH.user_service.equipe_service.DTO;

import lombok.Data;

@Data
public class UserEquipeDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String mail;
    private String equipeNom; // Nom de l'équipe
    private String departement; // Département de l'équipe
    private Long managerId;   // ID du manager
    private String managerNom; // Nom du manager
}