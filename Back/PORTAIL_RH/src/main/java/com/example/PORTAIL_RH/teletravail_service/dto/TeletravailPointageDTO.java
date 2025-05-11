package com.example.PORTAIL_RH.teletravail_service.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class TeletravailPointageDTO {
    private Long id;
    private Long userId;
    private Long userTeletravailId;
    private LocalDate pointageDate;
    private LocalTime pointageTime;
}