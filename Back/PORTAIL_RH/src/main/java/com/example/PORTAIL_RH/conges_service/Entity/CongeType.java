package com.example.PORTAIL_RH.conges_service.Entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(name = "conge_types")
@Inheritance(strategy = InheritanceType.JOINED)
public  class CongeType {

    public enum TypeConge {
        RENOUVELABLE,
        DECREMENTALE,
        INCREMENTALE
    }

    public enum Unite {
        Jours,
        Heure
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeConge type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Unite unite;

    @Column(nullable = false)
    private int soldeInitial;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String abreviation;

    @Column(nullable = false, columnDefinition = "boolean default true")
    @JsonProperty("isGlobal")
    private boolean isGlobal = true;

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date validite;
}