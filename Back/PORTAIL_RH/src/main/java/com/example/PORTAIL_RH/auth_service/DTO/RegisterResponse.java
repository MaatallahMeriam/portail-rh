package com.example.PORTAIL_RH.auth_service.DTO;


import lombok.Data;

@Data
public class RegisterResponse {
    private Long id;
    private String userName;
    private String mail;
    private String role;
    private String message; // Ex: "Utilisateur créé avec succès"
}
