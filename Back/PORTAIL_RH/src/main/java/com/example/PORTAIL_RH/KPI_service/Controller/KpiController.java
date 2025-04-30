package com.example.PORTAIL_RH.KPI_service.Controller;

import com.example.PORTAIL_RH.KPI_service.DTO.KpiDTO;
import com.example.PORTAIL_RH.KPI_service.Service.KpiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/kpi")
public class KpiController {

    @Autowired
    private KpiService kpiService;

    @GetMapping("/latest")
    public ResponseEntity<KpiDTO> getLatestKpi() {
        return ResponseEntity.ok(kpiService.getLatestKpi());
    }

    @GetMapping("/by-date")
    public ResponseEntity<KpiDTO> getKpiByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(kpiService.getKpiByDate(date));
    }

    @GetMapping("/all")
    public ResponseEntity<List<KpiDTO>> getAllKpis() {
        return ResponseEntity.ok(kpiService.getAllKpis());
    }

    @PostMapping("/calculate")
    public ResponseEntity<KpiDTO> calculateKpiForMonth(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(kpiService.calculateAndSaveKpiForMonth(date));
    }
}