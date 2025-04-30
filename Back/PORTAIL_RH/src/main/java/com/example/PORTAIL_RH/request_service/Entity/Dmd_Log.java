package com.example.PORTAIL_RH.request_service.Entity;

import jakarta.persistence.*;
import lombok.*;

@Setter
@Getter
@Entity
@Table(name = "dmd_log")
@PrimaryKeyJoinColumn(name = "demande_id")
public class Dmd_Log extends Demande {

    private String raison_dmd;
    private String commentaire;
    private String departement;
    private String composant;
}