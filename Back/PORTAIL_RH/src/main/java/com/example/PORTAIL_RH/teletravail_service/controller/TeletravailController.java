package com.example.PORTAIL_RH.teletravail_service.controller;

import com.example.PORTAIL_RH.teletravail_service.dto.TeletravailPlanningDTO;
import com.example.PORTAIL_RH.teletravail_service.dto.UserTeletravailDTO;
import com.example.PORTAIL_RH.teletravail_service.service.TeletravailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/teletravail")
public class TeletravailController {

    @Autowired
    private TeletravailService teletravailService;

    @PostMapping("/plannings")
    public ResponseEntity<TeletravailPlanningDTO> createPlanning(@RequestBody TeletravailPlanningDTO planningDTO) {
        TeletravailPlanningDTO createdPlanning = teletravailService.createPlanning(planningDTO);
        return ResponseEntity.ok(createdPlanning);
    }

    @GetMapping("/plannings/month/direct")
    public ResponseEntity<List<TeletravailPlanningDTO>> getPlanningsForMonth(@RequestParam Long rhId, @RequestParam String mois) {
        YearMonth yearMonth = YearMonth.parse(mois);
        List<TeletravailPlanningDTO> plannings = teletravailService.getPlanningsForMonth(rhId, yearMonth);
        return ResponseEntity.ok(plannings);
    }

    @PostMapping("/user/select-days")
    public ResponseEntity<UserTeletravailDTO> selectDays(@RequestBody UserTeletravailDTO userTeletravailDTO) {
        UserTeletravailDTO result = teletravailService.selectDays(userTeletravailDTO);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/plannings/user")
    public ResponseEntity<List<UserTeletravailDTO>> getUserPlannings(@RequestParam Long userId) {
        List<UserTeletravailDTO> plannings = teletravailService.getUserPlannings(userId);
        return ResponseEntity.ok(plannings);
    }
}