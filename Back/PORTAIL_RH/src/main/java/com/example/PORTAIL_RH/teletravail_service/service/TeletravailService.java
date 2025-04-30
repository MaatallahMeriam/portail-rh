package com.example.PORTAIL_RH.teletravail_service.service;

import com.example.PORTAIL_RH.teletravail_service.dto.TeletravailPlanningDTO;
import com.example.PORTAIL_RH.teletravail_service.dto.UserTeletravailDTO;

import java.time.YearMonth;
import java.util.List;

public interface TeletravailService {

    TeletravailPlanningDTO createPlanning(TeletravailPlanningDTO planningDTO);

    UserTeletravailDTO selectDays(UserTeletravailDTO userTeletravailDTO);

    List<UserTeletravailDTO> getUserPlannings(Long userId);

    List<TeletravailPlanningDTO> getPlanningsForMonth(Long rhId, YearMonth mois);
}