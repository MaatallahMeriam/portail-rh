package com.example.PORTAIL_RH.request_service.Service.IMPL;

import com.example.PORTAIL_RH.notification_service.Service.NotificationService;
import com.example.PORTAIL_RH.request_service.DTO.DemandeDTO;
import com.example.PORTAIL_RH.request_service.DTO.DemandeRequest;
import com.example.PORTAIL_RH.request_service.DTO.ManagerCongesDemandeDTO;
import com.example.PORTAIL_RH.request_service.DTO.LogisticDemandeDTO;
import com.example.PORTAIL_RH.request_service.DTO.DocumentDemandeDTO;
import com.example.PORTAIL_RH.request_service.Entity.Demande;
import com.example.PORTAIL_RH.request_service.Entity.Dmd_Conges;
import com.example.PORTAIL_RH.request_service.Entity.Dmd_Doc;
import com.example.PORTAIL_RH.request_service.Entity.Dmd_Log;
import com.example.PORTAIL_RH.user_service.conges_service.Entity.UserConges;
import com.example.PORTAIL_RH.user_service.conges_service.Repo.UserCongesRepository;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.request_service.Repo.DemandeRepository;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.request_service.Service.DemandeService;
import com.example.PORTAIL_RH.user_service.equipe_service.Entity.Equipe;
import com.example.PORTAIL_RH.user_service.equipe_service.Repo.EquipeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DemandeServiceImpl implements DemandeService {
    private static final Logger logger = LoggerFactory.getLogger(DemandeServiceImpl.class);

    @Autowired
    private DemandeRepository demandeRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private UserCongesRepository userCongesRepository;

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private NotificationService notificationService;

    private DemandeDTO mapToDTO(Demande demande) {
        DemandeDTO dto = new DemandeDTO();
        dto.setId(demande.getId());
        dto.setType(demande.getType());
        dto.setStatut(demande.getStatut());
        dto.setUserId(demande.getUser().getId());
        dto.setUserNom(demande.getUser().getNom());
        dto.setDateEmission(demande.getDateEmission());
        dto.setDateValidation(demande.getDateValidation());

        if (demande instanceof Dmd_Conges conges) {
            dto.setFileUrl(conges.getFileUrl());
            dto.setCommentaires(conges.getCommentaires());
            dto.setDateDebut(conges.getDateDebut());
            dto.setDateFin(conges.getDateFin());
            dto.setUnite(conges.getUnite());
            dto.setDuree(conges.getDuree());
            dto.setUserCongesId(conges.getUserConges().getId());
        } else if (demande instanceof Dmd_Doc doc) {
            dto.setRaisonDmd(doc.getRaison_dmd());
            dto.setTypeDocument(doc.getType_document());
            dto.setNombreCopies(doc.getNombre_copies());
        } else if (demande instanceof Dmd_Log log) {
            dto.setRaisonDmdLog(log.getRaison_dmd());
            dto.setCommentaire(log.getCommentaire());
            dto.setDepartement(log.getDepartement());
            dto.setComposant(log.getComposant());
        }

        return dto;
    }

    @Override
    @Transactional
    public DemandeDTO createDemande(DemandeRequest demandeRequest) {
        Users user = usersRepository.findById(demandeRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Demande demande;
        switch (demandeRequest.getType()) {
            case CONGES:
                UserConges userConges = userCongesRepository.findById(demandeRequest.getUserCongesId())
                        .orElseThrow(() -> new RuntimeException("UserConges non trouvé"));
                logger.info("Création d'une demande de congé pour userCongesId={}", demandeRequest.getUserCongesId());
                logger.info("Solde actuel (soldeActuel)={}", userConges.getSoldeActuel());
                logger.info("Durée demandée (duree)={}", demandeRequest.getDuree());
                logger.info("Unité de la demande={}", demandeRequest.getUnite());
                if (userConges.getSoldeActuel() < demandeRequest.getDuree()) {
                    logger.error("Solde insuffisant. soldeActuel={}, duree={}", userConges.getSoldeActuel(), demandeRequest.getDuree());
                    throw new RuntimeException("Solde insuffisant pour ce type de congé");
                }
                if (demandeRequest.getDateDebutAsDate().after(demandeRequest.getDateFinAsDate())) {
                    throw new RuntimeException("La date de début doit être avant la date de fin");
                }
                Dmd_Conges conges = new Dmd_Conges();
                conges.setFileUrl(demandeRequest.getFileUrl());
                conges.setCommentaires(demandeRequest.getCommentaires());
                conges.setDateDebut(demandeRequest.getDateDebutAsDate());
                conges.setDateFin(demandeRequest.getDateFinAsDate());
                conges.setUnite(demandeRequest.getUnite());
                conges.setDuree(demandeRequest.getDuree());
                conges.setUserConges(userConges);
                demande = conges;
                break;
            case DOCUMENT:
                Dmd_Doc doc = new Dmd_Doc();
                doc.setRaison_dmd(demandeRequest.getRaisonDmdDoc());
                doc.setType_document(demandeRequest.getTypeDocument());
                doc.setNombre_copies(demandeRequest.getNombreCopies());
                demande = doc;
                break;
            case LOGISTIQUE:
                Dmd_Log log = new Dmd_Log();
                log.setRaison_dmd(demandeRequest.getRaisonDmdLog());
                log.setCommentaire(demandeRequest.getCommentaireLog());
                log.setDepartement(demandeRequest.getDepartement());
                log.setComposant(demandeRequest.getComposant());
                demande = log;
                break;
            default:
                throw new IllegalArgumentException("Type de demande invalide");
        }

        demande.setUser(user);
        demande.setType(demandeRequest.getType());
        demande.setStatut(Demande.StatutType.EN_ATTENTE);
        demande.setDateEmission(new Date());

        Demande savedDemande = demandeRepository.save(demande);
        user.addDemande(savedDemande);
        usersRepository.save(user);

        // Notify the appropriate role (manager for CONGES, RH for others) on submission
        notificationService.createNotificationForRole(savedDemande);

        return mapToDTO(savedDemande);
    }

    @Override
    @Transactional
    public DemandeDTO updateDemande(Long id, DemandeRequest demandeRequest) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        Users user = usersRepository.findById(demandeRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        switch (demandeRequest.getType()) {
            case CONGES:
                if (!(demande instanceof Dmd_Conges)) {
                    throw new IllegalArgumentException("Type de demande incompatible");
                }
                UserConges userConges = userCongesRepository.findById(demandeRequest.getUserCongesId())
                        .orElseThrow(() -> new RuntimeException("UserConges non trouvé"));
                if (demandeRequest.getDateDebutAsDate().after(demandeRequest.getDateFinAsDate())) {
                    throw new RuntimeException("La date de début doit être avant la date de fin");
                }
                Dmd_Conges conges = (Dmd_Conges) demande;
                conges.setFileUrl(demandeRequest.getFileUrl());
                conges.setCommentaires(demandeRequest.getCommentaires());
                conges.setDateDebut(demandeRequest.getDateDebutAsDate());
                conges.setDateFin(demandeRequest.getDateFinAsDate());
                conges.setUnite(demandeRequest.getUnite());
                conges.setDuree(demandeRequest.getDuree());
                conges.setUserConges(userConges);
                break;
            case DOCUMENT:
                if (!(demande instanceof Dmd_Doc)) {
                    throw new IllegalArgumentException("Type de demande incompatible");
                }
                Dmd_Doc doc = (Dmd_Doc) demande;
                doc.setRaison_dmd(demandeRequest.getRaisonDmdDoc());
                doc.setType_document(demandeRequest.getTypeDocument());
                doc.setNombre_copies(demandeRequest.getNombreCopies());
                break;
            case LOGISTIQUE:
                if (!(demande instanceof Dmd_Log)) {
                    throw new IllegalArgumentException("Type de demande incompatible");
                }
                Dmd_Log log = (Dmd_Log) demande;
                log.setRaison_dmd(demandeRequest.getRaisonDmdLog());
                log.setCommentaire(demandeRequest.getCommentaireLog());
                log.setDepartement(demandeRequest.getDepartement());
                log.setComposant(demandeRequest.getComposant());
                break;
            default:
                throw new IllegalArgumentException("Type de demande invalide");
        }

        demande.setUser(user);
        demande.setType(demandeRequest.getType());
        Demande updatedDemande = demandeRepository.save(demande);
        return mapToDTO(updatedDemande);
    }

    @Override
    public List<DemandeDTO> getDemandesByUserIdAndType(Long userId, String type) {
        Demande.DemandeType demandeType;
        try {
            demandeType = Demande.DemandeType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Type de demande invalide : " + type);
        }
        return demandeRepository.findByUserIdAndType(userId, demandeType).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DemandeDTO> getAllDemandes() {
        return demandeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DemandeDTO> getAllDemandesByUserId(Long userId) {
        return demandeRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteDemande(Long id) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        Users user = demande.getUser();
        user.removeDemande(demande);
        usersRepository.save(user);
        demandeRepository.delete(demande);
    }

    @Override
    public DemandeDTO getDemandeById(Long id) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        return mapToDTO(demande);
    }

    @Override
    @Transactional
    public DemandeDTO acceptDemande(Long id, Long userId) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (demande.getStatut() != Demande.StatutType.EN_ATTENTE) {
            throw new IllegalStateException("La demande doit être en attente pour être acceptée. Statut actuel : " + demande.getStatut());
        }

        // Récupérer l'utilisateur qui effectue l'action (manager ou RH)
        Users processingUser = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        demande.setStatut(Demande.StatutType.VALIDEE);
        demande.setDateValidation(new Date());

        if (demande instanceof Dmd_Conges conges) {
            UserConges userConges = conges.getUserConges();
            logger.info("Accepting congé demande ID: {}, userCongesId: {}, soldeActuel: {}, duree: {}",
                    demande.getId(), userConges.getId(), userConges.getSoldeActuel(), conges.getDuree());

            if (userConges.getSoldeActuel() < conges.getDuree()) {
                logger.error("Solde insuffisant pour valider la demande ID: {}. soldeActuel: {}, duree: {}",
                        demande.getId(), userConges.getSoldeActuel(), conges.getDuree());
                throw new RuntimeException("Solde insuffisant pour valider la demande de congé");
            }

            int nouveauSolde = userConges.getSoldeActuel() - conges.getDuree();
            userConges.setSoldeActuel(nouveauSolde);
            userConges.setLastUpdated(new Date());
            userCongesRepository.save(userConges);

            logger.info("Congé demande ID: {} accepted. Nouveau soldeActuel: {}",
                    demande.getId(), userConges.getSoldeActuel());
        } else if (demande instanceof Dmd_Log) {
            logger.info("Accepting logistique demande ID: {}", demande.getId());
        } else if (demande instanceof Dmd_Doc) {
            logger.info("Accepting document demande ID: {}", demande.getId());
        }

        Demande updatedDemande = demandeRepository.save(demande);

        // Notify only the user who submitted the request, passing the processing user
        notificationService.notifyRequesterStatusChange(updatedDemande, "acceptée", processingUser);

        return mapToDTO(updatedDemande);
    }

    @Override
    @Transactional
    public DemandeDTO refuseDemande(Long id, Long userId) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (demande.getStatut() != Demande.StatutType.EN_ATTENTE) {
            throw new IllegalStateException("La demande doit être en attente pour être refusée. Statut actuel : " + demande.getStatut());
        }

        // Récupérer l'utilisateur qui effectue l'action (manager ou RH)
        Users processingUser = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        demande.setStatut(Demande.StatutType.REFUSEE);
        demande.setDateValidation(null); // Ensure dateValidation is null when refused

        if (demande instanceof Dmd_Conges) {
            logger.info("Refusing congé demande ID: {}", demande.getId());
        } else if (demande instanceof Dmd_Log) {
            logger.info("Refusing logistique demande ID: {}", demande.getId());
        } else if (demande instanceof Dmd_Doc) {
            logger.info("Refusing document demande ID: {}", demande.getId());
        }

        Demande updatedDemande = demandeRepository.save(demande);

        // Notify only the user who submitted the request, passing the processing user
        notificationService.notifyRequesterStatusChange(updatedDemande, "refusée", processingUser);

        return mapToDTO(updatedDemande);
    }

    @Override
    public List<ManagerCongesDemandeDTO> getCongesDemandesByManagerId(Long managerId) {
        return getCongesDemandesByManagerIdAndStatus(managerId, null);
    }

    @Override
    public List<ManagerCongesDemandeDTO> getCongesDemandesByManagerIdAndStatus(Long managerId, Demande.StatutType statut) {
        // Find teams managed by the manager
        List<Equipe> equipes = equipeRepository.findByManagerId(managerId);
        if (equipes.isEmpty()) {
            logger.info("No teams found for manager ID: {}", managerId);
            return List.of();
        }

        // Collect all users in the managed teams, excluding the manager
        List<Long> userIds = equipes.stream()
                .flatMap(equipe -> equipe.getUsers().stream())
                .map(Users::getId)
                .filter(userId -> !userId.equals(managerId)) // Exclude manager's own ID
                .distinct()
                .collect(Collectors.toList());

        if (userIds.isEmpty()) {
            logger.info("No users (excluding manager) found in teams managed by manager ID: {}", managerId);
            return List.of();
        }

        // Fetch congé demands for these users
        List<Demande> demandes = demandeRepository.findByUserIdIn(userIds).stream()
                .filter(demande -> demande.getType() == Demande.DemandeType.CONGES)
                .filter(demande -> statut == null || demande.getStatut() == statut) // Filter by status if provided
                .collect(Collectors.toList());

        // Map to ManagerCongesDemandeDTO
        return demandes.stream()
                .map(demande -> {
                    ManagerCongesDemandeDTO dto = new ManagerCongesDemandeDTO();
                    Users user = demande.getUser();
                    dto.setUserId(user.getId());
                    dto.setNom(user.getNom());
                    dto.setPrenom(user.getPrenom());
                    dto.setDemandeId(demande.getId());
                    dto.setStatut(demande.getStatut());
                    dto.setDateEmission(demande.getDateEmission());
                    dto.setDateValidation(demande.getDateValidation());
                    if (demande instanceof Dmd_Conges conges) {
                        UserConges userConges = conges.getUserConges();
                        dto.setCongeNom(userConges.getCongeType().getNom());
                        dto.setDateDebut(conges.getDateDebut());
                        dto.setDateFin(conges.getDateFin());
                        dto.setDuree(conges.getDuree());
                        dto.setUnite(conges.getUnite());
                        dto.setSoldeActuel(userConges.getSoldeActuel());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ManagerCongesDemandeDTO> getAllDemandeCongesByEquipeAndManagerId(Long managerId, Long equipeId) {
        // Vérifier si l'équipe existe et si le manager est bien le gestionnaire de cette équipe
        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée"));

        if (!equipe.getManager().getId().equals(managerId)) {
            logger.error("Le manager ID {} n'est pas autorisé à accéder aux demandes de l'équipe ID {}", managerId, equipeId);
            throw new RuntimeException("Vous n'êtes pas autorisé à accéder aux demandes de cette équipe");
        }

        // Récupérer tous les utilisateurs de l'équipe, en excluant le manager
        List<Long> userIds = equipe.getUsers().stream()
                .map(Users::getId)
                .filter(userId -> !userId.equals(managerId)) // Exclure le manager
                .distinct()
                .collect(Collectors.toList());

        if (userIds.isEmpty()) {
            logger.info("Aucun utilisateur (excluant le manager) trouvé dans l'équipe ID: {}", equipeId);
            return List.of();
        }

        // Récupérer les demandes de congé de ces utilisateurs
        List<Demande> demandes = demandeRepository.findByUserIdIn(userIds).stream()
                .filter(demande -> demande.getType() == Demande.DemandeType.CONGES)
                .collect(Collectors.toList());

        // Mapper vers ManagerCongesDemandeDTO
        return demandes.stream()
                .map(demande -> {
                    ManagerCongesDemandeDTO dto = new ManagerCongesDemandeDTO();
                    Users user = demande.getUser();
                    dto.setUserId(user.getId());
                    dto.setNom(user.getNom());
                    dto.setPrenom(user.getPrenom());
                    dto.setDemandeId(demande.getId());
                    dto.setStatut(demande.getStatut());
                    dto.setDateEmission(demande.getDateEmission());
                    dto.setDateValidation(demande.getDateValidation());
                    if (demande instanceof Dmd_Conges conges) {
                        UserConges userConges = conges.getUserConges();
                        dto.setCongeNom(userConges.getCongeType().getNom());
                        dto.setDateDebut(conges.getDateDebut());
                        dto.setDateFin(conges.getDateFin());
                        dto.setDuree(conges.getDuree());
                        dto.setUnite(conges.getUnite());
                        dto.setSoldeActuel(userConges.getSoldeActuel());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<LogisticDemandeDTO> getPendingLogisticDemandes() {
        List<Demande> demandes = demandeRepository.findAll().stream()
                .filter(demande -> demande.getType() == Demande.DemandeType.LOGISTIQUE)
                .filter(demande -> demande.getStatut() == Demande.StatutType.EN_ATTENTE)
                .collect(Collectors.toList());

        return demandes.stream()
                .map(demande -> {
                    LogisticDemandeDTO dto = new LogisticDemandeDTO();
                    Users user = demande.getUser();
                    dto.setUserId(user.getId());
                    dto.setNom(user.getNom());
                    dto.setPrenom(user.getPrenom());
                    dto.setDemandeId(demande.getId());
                    dto.setDateEmission(demande.getDateEmission());
                    if (demande instanceof Dmd_Log log) {
                        dto.setRaisonDmd(log.getRaison_dmd());
                        dto.setCommentaire(log.getCommentaire());
                        dto.setDepartement(log.getDepartement());
                        dto.setComposant(log.getComposant());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentDemandeDTO> getPendingDocumentDemandes() {
        List<Demande> demandes = demandeRepository.findAll().stream()
                .filter(demande -> demande.getType() == Demande.DemandeType.DOCUMENT)
                .filter(demande -> demande.getStatut() == Demande.StatutType.EN_ATTENTE)
                .collect(Collectors.toList());

        return demandes.stream()
                .map(demande -> {
                    DocumentDemandeDTO dto = new DocumentDemandeDTO();
                    Users user = demande.getUser();
                    dto.setUserId(user.getId());
                    dto.setNom(user.getNom());
                    dto.setPrenom(user.getPrenom());
                    dto.setDemandeId(demande.getId());
                    dto.setDateEmission(demande.getDateEmission());
                    if (demande instanceof Dmd_Doc doc) {
                        dto.setRaisonDmd(doc.getRaison_dmd());
                        dto.setTypeDocument(doc.getType_document());
                        dto.setNombreCopies(doc.getNombre_copies());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<DemandeDTO> getAllDemandeDocumentAndLogistique() {
        List<Demande> demandes = demandeRepository.findAll().stream()
                .filter(demande -> demande.getType() == Demande.DemandeType.DOCUMENT || demande.getType() == Demande.DemandeType.LOGISTIQUE)
                .collect(Collectors.toList());

        return demandes.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ManagerCongesDemandeDTO> getAllCongesDemandes() {
        List<Demande> demandes = demandeRepository.findAll().stream()
                .filter(demande -> demande.getType() == Demande.DemandeType.CONGES)
                .collect(Collectors.toList());

        return demandes.stream()
                .map(demande -> {
                    ManagerCongesDemandeDTO dto = new ManagerCongesDemandeDTO();
                    Users user = demande.getUser();
                    dto.setUserId(user.getId());
                    dto.setNom(user.getNom());
                    dto.setPrenom(user.getPrenom());
                    dto.setDemandeId(demande.getId());
                    dto.setStatut(demande.getStatut());
                    dto.setDateEmission(demande.getDateEmission());
                    dto.setDateValidation(demande.getDateValidation());
                    if (demande instanceof Dmd_Conges conges) {
                        UserConges userConges = conges.getUserConges();
                        dto.setCongeNom(userConges.getCongeType().getNom());
                        dto.setDateDebut(conges.getDateDebut());
                        dto.setDateFin(conges.getDateFin());
                        dto.setDuree(conges.getDuree());
                        dto.setUnite(conges.getUnite());
                        dto.setSoldeActuel(userConges.getSoldeActuel());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ManagerCongesDemandeDTO> getValidatedCongesDemandesByManagerId(Long managerId) {
        return getCongesDemandesByManagerIdAndStatus(managerId, Demande.StatutType.VALIDEE);
    }
}