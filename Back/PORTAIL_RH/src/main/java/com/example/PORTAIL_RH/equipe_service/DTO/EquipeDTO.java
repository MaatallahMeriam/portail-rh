package com.example.PORTAIL_RH.equipe_service.DTO;

import lombok.Data;

@Data
public class EquipeDTO {
    private Long id;
    private String nom;
    private String departement;
    private Long managerId; // ID du manager
}