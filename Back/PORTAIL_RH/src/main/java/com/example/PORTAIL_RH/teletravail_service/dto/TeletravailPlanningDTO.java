package com.example.PORTAIL_RH.teletravail_service.dto;

import com.example.PORTAIL_RH.teletravail_service.entity.TeletravailPlanning.Politique;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeletravailPlanningDTO {

    private Long id;
    private Politique politique;
    private Integer nombreJoursMax;
    private String mois; // Changement de YearMonth à String
    private List<String> joursFixes = new ArrayList<>();
    private Long rhId;
}