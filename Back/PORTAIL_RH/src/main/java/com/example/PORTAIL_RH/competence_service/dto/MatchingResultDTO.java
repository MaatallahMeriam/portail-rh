package com.example.PORTAIL_RH.competence_service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MatchingResultDTO {
    private Long employeId;
    private String employeNom;
    private double score; // Changé de int à double


}