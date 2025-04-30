package com.example.PORTAIL_RH.user_service.dossier_service.Service.IMPL;

import com.example.PORTAIL_RH.user_service.dossier_service.DTO.ResponseDossier;
import com.example.PORTAIL_RH.user_service.dossier_service.Entity.DossierUser;
import com.example.PORTAIL_RH.user_service.dossier_service.Repo.DossierUserRepository;
import com.example.PORTAIL_RH.user_service.dossier_service.Service.DossierUserService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Service
public class DossierUserServiceImpl implements DossierUserService {

    private final DossierUserRepository dossierUserRepository;

    public DossierUserServiceImpl(DossierUserRepository dossierUserRepository) {
        this.dossierUserRepository = dossierUserRepository;
    }

    @Override
    public ResponseDossier uploadFiles(MultipartFile cv, MultipartFile contrat, MultipartFile diplome) throws Exception {
        DossierUser dossier = new DossierUser();

        if (cv != null) dossier.setCv(cv.getBytes());
        if (contrat != null) dossier.setContrat(contrat.getBytes());
        if (diplome != null) dossier.setDiplome(diplome.getBytes());

        DossierUser savedDossier = dossierUserRepository.save(dossier);

        String cvUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/download/" + savedDossier.getId() + "/cv")
                .toUriString();
        String contratUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/download/" + savedDossier.getId() + "/contrat")
                .toUriString();
        String diplomeUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/download/" + savedDossier.getId() + "/diplome")
                .toUriString();

        return new ResponseDossier(cvUrl, contratUrl, diplomeUrl);
    }

    @Override
    public byte[] downloadFile(Long dossierId, String fileType) throws Exception {
        DossierUser dossier = dossierUserRepository.findById(dossierId)
                .orElseThrow(() -> new Exception("Dossier not found for id: " + dossierId));

        switch (fileType.toLowerCase()) {
            case "cv":
                return dossier.getCv() != null ? dossier.getCv() : new byte[0];
            case "contrat":
                return dossier.getContrat() != null ? dossier.getContrat() : new byte[0];
            case "diplome":
                return dossier.getDiplome() != null ? dossier.getDiplome() : new byte[0];
            default:
                throw new Exception("Invalid file type");
        }
    }

    @Override
    public void deleteDossier(Long dossierId) {
        dossierUserRepository.deleteById(dossierId);
    }
    @Override
    public ResponseDossier uploadSingleFile(Long dossierId, String fileType, MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new Exception("No file provided for upload");
        }

        DossierUser dossier = dossierUserRepository.findById(dossierId)
                .orElseThrow(() -> new Exception("Dossier not found for id: " + dossierId));

        switch (fileType.toLowerCase()) {
            case "cv":
                dossier.setCv(file.getBytes());
                break;
            case "contrat":
                dossier.setContrat(file.getBytes());
                break;
            case "diplome":
                dossier.setDiplome(file.getBytes());
                break;
            default:
                throw new Exception("Invalid file type: " + fileType);
        }

        DossierUser savedDossier = dossierUserRepository.save(dossier);

        String cvUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/dossier/download/" + savedDossier.getId() + "/cv")
                .toUriString();
        String contratUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/dossier/download/" + savedDossier.getId() + "/contrat")
                .toUriString();
        String diplomeUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/dossier/download/" + savedDossier.getId() + "/diplome")
                .toUriString();

        return new ResponseDossier(cvUrl, contratUrl, diplomeUrl);
    }

    @Override
    public void deleteSingleFile(Long dossierId, String fileType) throws Exception {
        DossierUser dossier = dossierUserRepository.findById(dossierId)
                .orElseThrow(() -> new Exception("Dossier not found for id: " + dossierId));

        switch (fileType.toLowerCase()) {
            case "cv":
                dossier.setCv(null);
                break;
            case "contrat":
                dossier.setContrat(null);
                break;
            case "diplome":
                dossier.setDiplome(null);
                break;
            default:
                throw new Exception("Invalid file type: " + fileType);
        }

        dossierUserRepository.save(dossier);
    }
}