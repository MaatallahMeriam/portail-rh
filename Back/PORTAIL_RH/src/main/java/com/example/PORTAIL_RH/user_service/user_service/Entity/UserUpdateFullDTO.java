package com.example.PORTAIL_RH.user_service.user_service.Entity;

import lombok.Data;

@Data
public class UserUpdateFullDTO extends UserUpdateBasicDTO {
    private String poste;
    private String departement;
    private String role;
}
