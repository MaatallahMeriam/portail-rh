package com.example.PORTAIL_RH.KPI_service.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "kpi")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Kpi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer nbreDepart;

    @Column(nullable = false)
    private Integer effectifDebut;

    @Column(nullable = false)
    private Integer effectifFin;

    @Column(nullable = false)
    private Integer effectifMoyen;

    @Column(nullable = false)
    private Double turnover;

    @Column(nullable = false)
    private LocalDate dateCalcul; // Ajouté pour suivre le mois du calcul
}