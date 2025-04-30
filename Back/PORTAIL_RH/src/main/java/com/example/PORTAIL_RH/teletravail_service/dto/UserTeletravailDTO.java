package com.example.PORTAIL_RH.teletravail_service.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserTeletravailDTO {

    private Long id;
    private Long userId;
    private Long planningId;
    private TeletravailPlanningDTO planning; // Ajout de la propriété
    private List<String> joursChoisis = new ArrayList<>();

    public void setPlanning(TeletravailPlanningDTO planningDTO) {
        this.planning = planningDTO; // Correction de la méthode
    }
}