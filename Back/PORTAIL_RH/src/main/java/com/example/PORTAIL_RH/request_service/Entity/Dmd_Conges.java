package com.example.PORTAIL_RH.request_service.Entity;

import com.example.PORTAIL_RH.conges_service.Entity.CongeType;
import com.example.PORTAIL_RH.conges_service.Entity.UserConges;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Setter
@Getter
@Entity
@Table(name = "dmd_conges")
@PrimaryKeyJoinColumn(name = "demande_id")
public class Dmd_Conges extends Demande {

    private String fileUrl; // fichier de certificat
    private String commentaires;
    private Date dateDebut;
    private Date dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CongeType.Unite unite;

    @Column(nullable = false)
    private int duree;

    @ManyToOne
    @JoinColumn(name = "user_conges_id", nullable = false)
    private UserConges userConges;
}