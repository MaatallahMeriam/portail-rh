package com.example.PORTAIL_RH.user_service.user_service.Entity;

import lombok.Data;

@Data
public class UserUpdateBasicDTO {
    private String nom;
    private String prenom;
    private String dateNaissance;
    private String userName;
    private String mail;
    private String numero;
    private String adresse;


}
