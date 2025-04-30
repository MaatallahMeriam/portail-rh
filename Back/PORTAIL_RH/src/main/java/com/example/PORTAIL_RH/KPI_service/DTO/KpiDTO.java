package com.example.PORTAIL_RH.KPI_service.DTO;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KpiDTO {

    private Long id;
    private Integer nbreDepart;
    private Integer effectifDebut;
    private Integer effectifFin;
    private Integer effectifMoyen;
    private Double turnover;
    private LocalDate dateCalcul;
}