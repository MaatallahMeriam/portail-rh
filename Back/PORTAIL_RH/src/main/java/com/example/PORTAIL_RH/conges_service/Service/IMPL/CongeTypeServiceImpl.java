package com.example.PORTAIL_RH.conges_service.Service.IMPL;

import com.example.PORTAIL_RH.conges_service.DTO.CongeTypeDTO;
import com.example.PORTAIL_RH.conges_service.Entity.*;
import com.example.PORTAIL_RH.conges_service.Repo.CongeTypeRepository;
import com.example.PORTAIL_RH.conges_service.Repo.UserCongesRepository;
import com.example.PORTAIL_RH.conges_service.Service.CongeTypeService;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CongeTypeServiceImpl implements CongeTypeService {
    @Autowired
    private UsersRepository usersRepository;
    @Autowired
    private UserCongesRepository userCongesRepository;
    @Autowired
    private CongeTypeRepository congeTypeRepository;
    private static final Logger logger = LoggerFactory.getLogger(CongeTypeServiceImpl.class);

    // Create a new CongeType based on type
    public CongeTypeDTO createCongeType(CongeTypeDTO dto) {
        CongeType congeType;
        switch (dto.getType()) {
            case RENOUVELABLE:
                if (dto.getPeriodicite() == null) {
                    throw new IllegalArgumentException("Periodicite is required for CongeRenouvelable");
                }
                CongeRenouvelable renouvelable = new CongeRenouvelable();
                renouvelable.setPeriodicite(dto.getPeriodicite());
                renouvelable.setLastUpdated(new Date()); // Set lastUpdated
                congeType = renouvelable;
                break;
            case INCREMENTALE:
                if (dto.getPeriodicite() == null || dto.getPasIncrementale() <= 0) {
                    throw new IllegalArgumentException("Periodicite and valid pasIncrementale are required for CongeIncrementale");
                }
                CongeIncrementale incrementale = new CongeIncrementale();
                incrementale.setPeriodicite(dto.getPeriodicite());
                incrementale.setPasIncrementale(dto.getPasIncrementale());
                incrementale.setLastUpdated(new Date()); // Set lastUpdated
                congeType = incrementale;
                break;
            case DECREMENTALE:
                CongeDecrementale decrementale = new CongeDecrementale();
                congeType = decrementale;
                break;
            default:
                throw new IllegalArgumentException("Invalid CongeType");
        }

        // Set common attributes
        congeType.setType(dto.getType());
        congeType.setUnite(dto.getUnite());
        congeType.setSoldeInitial(dto.getSoldeInitial());
        congeType.setNom(dto.getNom());
        congeType.setAbreviation(dto.getAbreviation());
        congeType.setGlobal(dto.isGlobal());
        congeType.setValidite(dto.getValidite());

        // Save and convert to DTO
        CongeType saved = congeTypeRepository.save(congeType);
        synchronizeUsersWithCongeType(saved);

        return convertToDTO(saved);
    }

    private void synchronizeUsersWithCongeType(CongeType congeType) {
        List<Users> users = usersRepository.findAll();
        for (Users user : users) {
            // Vérifier si l’utilisateur a déjà ce CongeType dans sa liste
            if (user.getCongesList().stream().noneMatch(uc -> uc.getCongeType()
                    .getId().equals(congeType.getId()))) {
                UserConges userConges = new UserConges();
                userConges.setUser(user);
                userConges.setCongeType(congeType);
                userConges.setSoldeActuel(congeType.getSoldeInitial());
                user.getCongesList().add(userConges);
            } else if (congeType.getSoldeInitial() != user.getCongesList().stream()
                    .filter(uc -> uc.getCongeType().getId().equals(congeType.getId()))
                    .findFirst().get().getSoldeActuel()) {
                // Optionnel : Mettre à jour le soldeActuel si le soldeInitial change
                UserConges existingUserConges = user.getCongesList().stream()
                        .filter(uc -> uc.getCongeType().getId().equals(congeType.getId()))
                        .findFirst().get();
                existingUserConges.setSoldeActuel(congeType.getSoldeInitial());
            }
        }
        usersRepository.saveAll(users);
    }

    public List<CongeTypeDTO> getAllCongeTypes() {
        return congeTypeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get CongeTypes where isGlobal is true
    public List<CongeTypeDTO> getGlobalCongeTypes() {
        return congeTypeRepository.findByIsGlobalTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCongeType(Long id) {
        if (!congeTypeRepository.existsById(id)) {
            logger.warn("Attempted to delete non-existent CongeType with ID {}", id);
            throw new IllegalArgumentException("CongeType with ID " + id + " not found");
        }

        logger.info("Deleting UserConges associated with CongeType ID {}", id);
        userCongesRepository.deleteByCongeTypeId(id);

        logger.info("Deleting CongeType with ID {}", id);
        congeTypeRepository.deleteById(id);
    }

    // Update by ID
    public CongeTypeDTO updateCongeType(Long id, CongeTypeDTO dto) {
        Optional<CongeType> optional = congeTypeRepository.findById(id);
        if (!optional.isPresent()) {
            throw new IllegalArgumentException("CongeType with ID " + id + " not found");
        }

        CongeType existing = optional.get();
        if (existing.getType() != dto.getType()) {
            throw new IllegalArgumentException("Cannot change CongeType type");
        }

        // Update common attributes
        existing.setUnite(dto.getUnite());
        existing.setSoldeInitial(dto.getSoldeInitial());
        existing.setNom(dto.getNom());
        existing.setAbreviation(dto.getAbreviation());
        existing.setGlobal(dto.isGlobal());
        existing.setValidite(dto.getValidite());

        // Update type-specific attributes
        switch (existing.getType()) {
            case RENOUVELABLE:
                if (!(existing instanceof CongeRenouvelable)) {
                    throw new IllegalStateException("Type mismatch for CongeRenouvelable");
                }
                CongeRenouvelable renouvelable = (CongeRenouvelable) existing;
                renouvelable.setPeriodicite(dto.getPeriodicite());
                renouvelable.setOriginalSoldeInitial(dto.getSoldeInitial()); // Update originalSoldeInitial
                renouvelable.setLastUpdated(new Date()); // Update lastUpdated
                break;
            case INCREMENTALE:
                if (!(existing instanceof CongeIncrementale)) {
                    throw new IllegalStateException("Type mismatch for CongeIncrementale");
                }
                CongeIncrementale incrementale = (CongeIncrementale) existing;
                incrementale.setPeriodicite(dto.getPeriodicite());
                incrementale.setPasIncrementale(dto.getPasIncrementale());
                incrementale.setLastUpdated(new Date()); // Update lastUpdated
                break;
            case DECREMENTALE:
                if (!(existing instanceof CongeDecrementale)) {
                    throw new IllegalStateException("Type mismatch for CongeDecrementale");
                }
                break;
        }

        CongeType updated = congeTypeRepository.save(existing);
        return convertToDTO(updated);
    }

    // Convert Entity to DTO
    private CongeTypeDTO convertToDTO(CongeType congeType) {
        CongeTypeDTO dto = new CongeTypeDTO();
        dto.setId(congeType.getId());
        dto.setType(congeType.getType());
        dto.setUnite(congeType.getUnite());
        dto.setSoldeInitial(congeType.getSoldeInitial());
        dto.setNom(congeType.getNom());
        dto.setAbreviation(congeType.getAbreviation());
        dto.setGlobal(congeType.isGlobal());
        dto.setValidite(congeType.getValidite());
        // Set type-specific attributes
        if (congeType instanceof CongeRenouvelable) {
            dto.setPeriodicite(((CongeRenouvelable) congeType).getPeriodicite());
        } else if (congeType instanceof CongeIncrementale) {
            dto.setPeriodicite(((CongeIncrementale) congeType).getPeriodicite());
            dto.setPasIncrementale(((CongeIncrementale) congeType).getPasIncrementale());
        }

        return dto;
    }

    // Scheduled task to update balances
    @Scheduled(cron = "0 0 0 * * ?") // Runs daily at midnight
    @Transactional
    public void updateCongeBalances() {
        List<CongeType> congeTypes = congeTypeRepository.findByTypeIn(
                List.of(CongeType.TypeConge.RENOUVELABLE, CongeType.TypeConge.INCREMENTALE));
        for (CongeType congeType : congeTypes) {
            if (congeType instanceof CongeRenouvelable) {
                updateRenouvelableBalance((CongeRenouvelable) congeType);
            } else if (congeType instanceof CongeIncrementale) {
                updateIncrementaleBalance((CongeIncrementale) congeType);
            }
        }
    }

    private void updateRenouvelableBalance(CongeRenouvelable conge) {
        if (shouldUpdateBalance(conge.getPeriodicite(), conge.getLastUpdated())) {
            logger.info("Resetting balance for CongeRenouvelable ID {}", conge.getId());
            conge.setSoldeInitial(conge.getOriginalSoldeInitial());
            conge.setLastUpdated(new Date());
            congeTypeRepository.save(conge);

            // Update UserConges balances
            List<UserConges> userCongesList = userCongesRepository.findByCongeType(conge);
            for (UserConges userConges : userCongesList) {
                userConges.setSoldeActuel(conge.getOriginalSoldeInitial());
                userConges.setLastUpdated(new Date());
                userCongesRepository.save(userConges);
            }
        }
    }

    private void updateIncrementaleBalance(CongeIncrementale conge) {
        if (shouldUpdateBalance(conge.getPeriodicite(), conge.getLastUpdated())) {
            logger.info("Incrementing balance for CongeIncrementale ID {}", conge.getId());
            conge.setSoldeInitial(conge.getSoldeInitial() + conge.getPasIncrementale());
            conge.setLastUpdated(new Date());
            congeTypeRepository.save(conge);

            // Update UserConges balances
            List<UserConges> userCongesList = userCongesRepository.findByCongeType(conge);
            for (UserConges userConges : userCongesList) {
                userConges.setSoldeActuel(userConges.getSoldeActuel() + conge.getPasIncrementale());
                userConges.setLastUpdated(new Date());
                userCongesRepository.save(userConges);
            }
        }
    }

    private boolean shouldUpdateBalance(Periodicite periodicite, Date lastUpdated) {
        if (lastUpdated == null || periodicite == null) {
            return false;
        }

        Calendar last = Calendar.getInstance();
        last.setTime(lastUpdated);

        Calendar now = Calendar.getInstance();
        int monthsElapsed = monthsBetween(last, now);

        return monthsElapsed >= periodicite.getMonths();
    }

    private int monthsBetween(Calendar start, Calendar end) {
        int months = (end.get(Calendar.YEAR) - start.get(Calendar.YEAR)) * 12;
        months += end.get(Calendar.MONTH) - start.get(Calendar.MONTH);
        if (end.get(Calendar.DAY_OF_MONTH) < start.get(Calendar.DAY_OF_MONTH)) {
            months--;
        }
        return months;
    }
}