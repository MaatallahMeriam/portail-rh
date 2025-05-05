package com.example.PORTAIL_RH.user_service.equipe_service.DTO;

import lombok.Data;

@Data
public class TeamMemberDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String poste;
    private String departement;
    private String image;
    private String mail;
    private String numero; // Added to support phone number
}