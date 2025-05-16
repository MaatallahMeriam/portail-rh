package com.example.PORTAIL_RH.request_service.Service;

import com.example.PORTAIL_RH.request_service.DTO.DemandeDTO;
import com.example.PORTAIL_RH.request_service.DTO.DemandeRequest;
import com.example.PORTAIL_RH.request_service.DTO.ManagerCongesDemandeDTO;
import com.example.PORTAIL_RH.request_service.DTO.LogisticDemandeDTO;
import com.example.PORTAIL_RH.request_service.DTO.DocumentDemandeDTO;
import com.example.PORTAIL_RH.request_service.Entity.Demande;

import java.util.List;

public interface DemandeService {
    DemandeDTO createDemande(DemandeRequest demandeRequest);
    DemandeDTO updateDemande(Long id, DemandeRequest demandeRequest);
    List<DemandeDTO> getDemandesByUserIdAndType(Long userId, String type);
    List<DemandeDTO> getAllDemandes();
    List<DemandeDTO> getAllDemandesByUserId(Long userId);
    void deleteDemande(Long id);
    DemandeDTO getDemandeById(Long id);
    DemandeDTO acceptDemande(Long id, Long userId); // Ajout de userId
    DemandeDTO refuseDemande(Long id, Long userId); // Ajout de userId
    List<ManagerCongesDemandeDTO> getCongesDemandesByManagerId(Long managerId);
    List<ManagerCongesDemandeDTO> getCongesDemandesByManagerIdAndStatus(Long managerId, Demande.StatutType statut);
    List<LogisticDemandeDTO> getPendingLogisticDemandes();
    List<DocumentDemandeDTO> getPendingDocumentDemandes();
    List<ManagerCongesDemandeDTO> getAllCongesDemandes();
    List<ManagerCongesDemandeDTO> getValidatedCongesDemandesByManagerId(Long managerId);
    List<ManagerCongesDemandeDTO> getAllDemandeCongesByEquipeAndManagerId(Long managerId, Long equipeId);
    List<DemandeDTO> getAllDemandeDocumentAndLogistique();
}