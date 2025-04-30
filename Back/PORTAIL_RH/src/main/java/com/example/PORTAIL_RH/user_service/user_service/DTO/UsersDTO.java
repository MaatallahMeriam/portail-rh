package com.example.PORTAIL_RH.user_service.user_service.DTO;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users.Role;
import lombok.Data;

@Data
public class UsersDTO {
    private Long id;
    private String userName;
    private String nom;
    private String prenom;
    private String mail;
    private String password; // Only used for creation/update, not returned in GET
    private String dateNaissance; // Changed from Date to String
    private int age;
    private String poste;
    private String departement;
    private String image;
    private String numero; // New phone number field
    private Role role;
    private Long equipeId;
    private Long dossierId;
    private boolean active;
}