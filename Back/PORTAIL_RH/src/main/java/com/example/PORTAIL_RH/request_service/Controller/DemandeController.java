package com.example.PORTAIL_RH.request_service.Controller;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;
import com.example.PORTAIL_RH.request_service.DTO.DemandeDTO;
import com.example.PORTAIL_RH.request_service.DTO.DemandeRequest;
import com.example.PORTAIL_RH.request_service.DTO.ManagerCongesDemandeDTO;
import com.example.PORTAIL_RH.request_service.DTO.LogisticDemandeDTO;
import com.example.PORTAIL_RH.request_service.DTO.DocumentDemandeDTO;
import com.example.PORTAIL_RH.request_service.Entity.Demande;
import com.example.PORTAIL_RH.request_service.Service.DemandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demandes")
public class DemandeController {

    @Autowired
    private DemandeService demandeService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get("uploads/" + fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, file.getBytes());
            String fileUrl = "/uploads/" + fileName;
            return ResponseEntity.ok(Map.of("fileUrl", fileUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors du téléchargement du fichier"));
        }
    }

    @PostMapping
    public ResponseEntity<DemandeDTO> createDemande(@RequestBody DemandeRequest demandeRequest) {
        DemandeDTO createdDemande = demandeService.createDemande(demandeRequest);
        return new ResponseEntity<>(createdDemande, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DemandeDTO> updateDemande(@PathVariable Long id, @RequestBody DemandeRequest demandeRequest) {
        DemandeDTO updatedDemande = demandeService.updateDemande(id, demandeRequest);
        return new ResponseEntity<>(updatedDemande, HttpStatus.OK);
    }



    @GetMapping
    public ResponseEntity<List<DemandeDTO>> getAllDemandes() {
        List<DemandeDTO> demandes = demandeService.getAllDemandes();
        return new ResponseEntity<>(demandes, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DemandeDTO> getDemandeById(@PathVariable Long id) {
        DemandeDTO demande = demandeService.getDemandeById(id);
        return new ResponseEntity<>(demande, HttpStatus.OK);
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<DemandeDTO> acceptDemande(
            @PathVariable Long id,
            @RequestParam Long userId) { // Ajout du paramètre userId
        DemandeDTO accepted = demandeService.acceptDemande(id, userId); // Passer userId à la méthode
        return new ResponseEntity<>(accepted, HttpStatus.OK);
    }

    @PutMapping("/{id}/refuse")
    public ResponseEntity<DemandeDTO> refuseDemande(
            @PathVariable Long id,
            @RequestParam Long userId) { // Ajout du paramètre userId
        DemandeDTO refused = demandeService.refuseDemande(id, userId); // Passer userId à la méthode
        return new ResponseEntity<>(refused, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DemandeDTO>> getAllDemandesByUserId(@PathVariable Long userId) {
        List<DemandeDTO> demandes = demandeService.getAllDemandesByUserId(userId);
        return new ResponseEntity<>(demandes, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<List<DemandeDTO>> getDemandesByUserIdAndType(@PathVariable Long userId, @PathVariable String type) {
        List<DemandeDTO> demandes = demandeService.getDemandesByUserIdAndType(userId, type);
        return new ResponseEntity<>(demandes, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDemande(@PathVariable Long id) {
        demandeService.deleteDemande(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/manager/{managerId}/conges")
    public ResponseEntity<List<ManagerCongesDemandeDTO>> getCongesDemandesByManagerId(
            @PathVariable Long managerId,
            @RequestParam(required = false) String statut) {
        List<ManagerCongesDemandeDTO> demandes;
        if (statut != null) {
            try {
                Demande.StatutType statutType = Demande.StatutType.valueOf(statut.toUpperCase());
                demandes = demandeService.getCongesDemandesByManagerIdAndStatus(managerId, statutType);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(List.of());
            }
        } else {
            demandes = demandeService.getCongesDemandesByManagerId(managerId);
        }
        return new ResponseEntity<>(demandes, HttpStatus.OK);
    }

    @GetMapping("/manager/{managerId}/equipe/{equipeId}/conges")
    public ResponseEntity<List<ManagerCongesDemandeDTO>> getAllDemandeCongesByEquipeAndManagerId(
            @PathVariable Long managerId,
            @PathVariable Long equipeId) {
        List<ManagerCongesDemandeDTO> demandes = demandeService.getAllDemandeCongesByEquipeAndManagerId(managerId, equipeId);
        return new ResponseEntity<>(demandes, HttpStatus.OK);
    }

    @GetMapping("/pending/logistique")
    public ResponseEntity<List<LogisticDemandeDTO>> getPendingLogisticDemandes() {
        List<LogisticDemandeDTO> demandes = demandeService.getPendingLogisticDemandes();
        return new ResponseEntity<>(demandes, HttpStatus.OK);
    }

    @GetMapping("/pending/document")
    public ResponseEntity<List<DocumentDemandeDTO>> getPendingDocumentDemandes() {
        List<DocumentDemandeDTO> demandes = demandeService.getPendingDocumentDemandes();
        return new ResponseEntity<>(demandes, HttpStatus.OK);
    }

    @GetMapping("/document-and-logistique")
    public ResponseEntity<List<DemandeDTO>> getAllDemandeDocumentAndLogistique() {
        List<DemandeDTO> demandes = demandeService.getAllDemandeDocumentAndLogistique();
        return new ResponseEntity<>(demandes, HttpStatus.OK);
    }

    @GetMapping("/conges/all")
    public ResponseEntity<List<ManagerCongesDemandeDTO>> getAllCongesDemandes() {
        List<ManagerCongesDemandeDTO> demandes = demandeService.getAllCongesDemandes();
        return new ResponseEntity<>(demandes, HttpStatus.OK);
    }

    @GetMapping("/manager/{managerId}/conges/validated")
    public ResponseEntity<List<ManagerCongesDemandeDTO>> getValidatedCongesDemandesByManagerId(@PathVariable Long managerId) {
        List<ManagerCongesDemandeDTO> validatedDemandes = demandeService.getValidatedCongesDemandesByManagerId(managerId);
        return new ResponseEntity<>(validatedDemandes, HttpStatus.OK);
    }
}

class StatutRequest {
    private Demande.StatutType statut;

    public Demande.StatutType getStatut() {
        return statut;
    }

    public void setStatut(Demande.StatutType statut) {
        this.statut = statut;
    }
}