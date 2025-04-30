package com.example.PORTAIL_RH.user_service.dossier_service.Service;

import com.example.PORTAIL_RH.user_service.dossier_service.DTO.ResponseDossier;
import org.springframework.web.multipart.MultipartFile;

public interface DossierUserService {
    ResponseDossier uploadFiles(MultipartFile cv, MultipartFile contrat, MultipartFile diplome) throws Exception;
    byte[] downloadFile(Long dossierId, String fileType) throws Exception;
    void deleteDossier(Long dossierId);
    ResponseDossier uploadSingleFile(Long dossierId, String fileType, MultipartFile file) throws Exception;
    void deleteSingleFile(Long dossierId, String fileType) throws Exception;

}