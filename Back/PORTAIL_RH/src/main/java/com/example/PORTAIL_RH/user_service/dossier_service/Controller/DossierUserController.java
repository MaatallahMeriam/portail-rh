package com.example.PORTAIL_RH.user_service.dossier_service.Controller;

import com.example.PORTAIL_RH.user_service.dossier_service.DTO.DeleteResponse;
import com.example.PORTAIL_RH.user_service.dossier_service.DTO.ResponseDossier;
import com.example.PORTAIL_RH.user_service.dossier_service.Service.DossierUserService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/dossier")
public class DossierUserController {

    private final DossierUserService dossierService;

    public DossierUserController(DossierUserService dossierService) {
        this.dossierService = dossierService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ResponseDossier> uploadFiles(
            @RequestParam(value = "cv", required = false) MultipartFile cv,
            @RequestParam(value = "contrat", required = false) MultipartFile contrat,
            @RequestParam(value = "diplome", required = false) MultipartFile diplome) throws Exception {
        ResponseDossier response = dossierService.uploadFiles(cv, contrat, diplome);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{dossierId}/{fileType}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long dossierId,
            @PathVariable String fileType) throws Exception {
        byte[] fileData = dossierService.downloadFile(dossierId, fileType);

        String contentType = "application/octet-stream";
        String fileName = fileType + "_dossier_" + dossierId;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(new ByteArrayResource(fileData));
    }

    @DeleteMapping("/delete/{dossierId}")
    public ResponseEntity<String> deleteDossier(@PathVariable Long dossierId) {
        dossierService.deleteDossier(dossierId);
        return ResponseEntity.ok("Dossier deleted successfully");
    }

    @PostMapping("/upload/{dossierId}/{fileType}")
    public ResponseEntity<ResponseDossier> uploadSingleFile(
            @PathVariable Long dossierId,
            @PathVariable String fileType,
            @RequestParam("file") MultipartFile file) throws Exception {
        ResponseDossier response = dossierService.uploadSingleFile(dossierId, fileType, file);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{dossierId}/{fileType}")
    public ResponseEntity<Object> deleteSingleFile(
            @PathVariable Long dossierId,
            @PathVariable String fileType) throws Exception {
        dossierService.deleteSingleFile(dossierId, fileType);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(new DeleteResponse("File " + fileType + " deleted successfully"));
    }
}

