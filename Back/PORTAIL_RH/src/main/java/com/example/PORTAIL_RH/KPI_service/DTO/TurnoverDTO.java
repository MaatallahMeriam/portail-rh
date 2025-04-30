package com.example.PORTAIL_RH.KPI_service.DTO;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TurnoverDTO {
    private Double turnover;
    private Integer nbreDepart;

}