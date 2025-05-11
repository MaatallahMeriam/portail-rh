package com.example.PORTAIL_RH.teletravail_service.controller;

import com.example.PORTAIL_RH.teletravail_service.dto.TeletravailPointageDTO;
import com.example.PORTAIL_RH.teletravail_service.service.TeletravailPointageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/teletravail/pointage")
public class TeletravailPointageController {

    @Autowired
    private TeletravailPointageService pointageService;

    @GetMapping("/qrcode")
    public ResponseEntity<String> getQRCode(@RequestParam Long userId) {
        try {
            String qrCodeBase64 = pointageService.getQRCodeForUser(userId, LocalDate.now());
            if (qrCodeBase64 != null) {
                return ResponseEntity.ok(qrCodeBase64);
            }
            return ResponseEntity.badRequest().body("Aucun télétravail prévu aujourd’hui.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la génération du QR code : " + e.getMessage());
        }
    }

    @GetMapping("/confirm")
    public ResponseEntity<String> confirmPointage(@RequestParam String token) {
        try {
            pointageService.recordPointage(token);
            return ResponseEntity.ok("Pointage enregistré avec succès !");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l’enregistrement du pointage : " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<TeletravailPointageDTO>> getPointages(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam Long userId) { // Assurez-vous que @RequestParam est présent
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            List<TeletravailPointageDTO> pointages = pointageService.getPointagesForPeriod(start, end, userId);
            return ResponseEntity.ok(pointages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    @PostMapping("/send-email")
    public ResponseEntity<String> sendPointageEmail(@RequestParam Long userId) {
        try {
            String qrCodeBase64 = pointageService.getQRCodeForUser(userId, LocalDate.now());
            if (qrCodeBase64 == null) {
                return ResponseEntity.badRequest().body("Aucun télétravail prévu aujourd’hui.");
            }
            boolean emailSent = pointageService.sendPointageEmail(userId, LocalDate.now());
            if (emailSent) {
                return ResponseEntity.ok("Email de pointage envoyé avec succès !");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Erreur lors de l’envoi de l’email.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l’envoi de l’email : " + e.getMessage());
        }
    }
}