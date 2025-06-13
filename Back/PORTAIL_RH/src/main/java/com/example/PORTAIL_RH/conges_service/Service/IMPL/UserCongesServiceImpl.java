package com.example.PORTAIL_RH.conges_service.Service.IMPL;

import com.example.PORTAIL_RH.conges_service.DTO.CongeTypeDTO;
import com.example.PORTAIL_RH.conges_service.DTO.UserCongesDTO;
import com.example.PORTAIL_RH.conges_service.Entity.*;
import com.example.PORTAIL_RH.conges_service.Repo.CongeTypeRepository;
import com.example.PORTAIL_RH.conges_service.Repo.UserCongesRepository;
import com.example.PORTAIL_RH.conges_service.Service.UserCongesService;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserCongesServiceImpl implements UserCongesService {

    private static final Logger logger = LoggerFactory.getLogger(UserCongesServiceImpl.class);

    @Autowired
    private UserCongesRepository userCongesRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private CongeTypeRepository congeTypeRepository;

    @Override
    @Transactional
    public UserCongesDTO createUserConges(UserCongesDTO userCongesDTO) {
        Users user = usersRepository.findById(userCongesDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        CongeType congeType = congeTypeRepository.findById(userCongesDTO.getCongeTypeId())
                .orElseThrow(() -> new RuntimeException("CongeType not found"));

        // Check if the user already has this CongeType
        userCongesRepository.findByUserIdAndCongeTypeId(user.getId(), congeType.getId())
                .ifPresent(uc -> {
                    throw new RuntimeException("User already has this CongeType assigned");
                });

        UserConges userConges = new UserConges();
        userConges.setUser(user);
        userConges.setCongeType(congeType);
        userConges.setSoldeActuel(userCongesDTO.getSoldeActuel() > 0 ? userCongesDTO.getSoldeActuel() : congeType.getSoldeInitial());
        UserConges savedUserConges = userCongesRepository.save(userConges);
        return mapToDTO(savedUserConges);
    }

    @Override
    public UserCongesDTO getUserCongesById(Long id) {
        UserConges userConges = userCongesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("UserConges not found"));
        return mapToDTO(userConges);
    }

    @Override
    public List<UserCongesDTO> getUserCongesByUserId(Long userId) {
        return userCongesRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }



    @Override
    public List<CongeTypeDTO> getAllCongeTypesForUser(Long userId) {
        List<UserConges> userCongesList = userCongesRepository.findByUserId(userId);
        return userCongesList.stream()
                .map(userConges -> {
                    CongeType congeType = userConges.getCongeType();
                    CongeTypeDTO dto = new CongeTypeDTO();
                    dto.setId(congeType.getId());
                    dto.setValidite(congeType.getValidite());
                    dto.setAbreviation(congeType.getAbreviation());
                    dto.setNom(congeType.getNom());
                    dto.setUnite(congeType.getUnite());
                    dto.setType(congeType.getType());
                    dto.setValidite(congeType.getValidite());
                    dto.setSoldeInitial(congeType.getSoldeInitial());
                    dto.setGlobal(congeType.isGlobal());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public UserCongesDTO updateUserConges(Long id, UserCongesDTO userCongesDTO) {
        UserConges userConges = userCongesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("UserConges not found"));
        Users user = usersRepository.findById(userCongesDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        CongeType congeType = congeTypeRepository.findById(userCongesDTO.getCongeTypeId())
                .orElseThrow(() -> new RuntimeException("CongeType not found"));

        userConges.setUser(user);
        userConges.setCongeType(congeType);
        userConges.setSoldeActuel(userCongesDTO.getSoldeActuel());
        UserConges updatedUserConges = userCongesRepository.save(userConges);
        return mapToDTO(updatedUserConges);
    }

    @Override
    @Transactional
    public void deleteUserConges(Long id) {
        UserConges userConges = userCongesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("UserConges not found"));
        CongeType congeType = userConges.getCongeType();

        userCongesRepository.delete(userConges);

        // If the CongeType is not global and not used by other users, delete it
        if (!congeType.isGlobal()) {
            List<UserConges> remaining = userCongesRepository.findByCongeType(congeType);
            if (remaining.isEmpty()) {
                congeTypeRepository.delete(congeType);
            }
        }
    }

    @Override
    @Transactional
    public void requestConge(Long userId, Long congeTypeId, int daysRequested) {
        UserConges userConges = userCongesRepository.findByUserIdAndCongeTypeId(userId, congeTypeId)
                .orElseThrow(() -> new RuntimeException("CongeType not assigned to this user"));

        if (userConges.getSoldeActuel() < daysRequested) {
            throw new RuntimeException("Solde insuffisant");
        }

        userConges.setSoldeActuel(userConges.getSoldeActuel() - daysRequested);
        userCongesRepository.save(userConges);
    }

    @Override
    @Transactional
    public UserCongesDTO assignSpecificCongeType(Long userId, UserCongesDTO userCongesDTO) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create a new user-specific CongeType
        CongeType congeType;
        switch (userCongesDTO.getType()) {
            case RENOUVELABLE:
                if (userCongesDTO.getPeriodicite() == null) {
                    throw new IllegalArgumentException("Periodicite is required for CongeRenouvelable");
                }
                CongeRenouvelable renouvelable = new CongeRenouvelable();
                renouvelable.setPeriodicite(userCongesDTO.getPeriodicite());
                renouvelable.setLastUpdated(new Date());
                congeType = renouvelable;
                break;
            case INCREMENTALE:
                if (userCongesDTO.getPeriodicite() == null || userCongesDTO.getPasIncrementale() <= 0) {
                    throw new IllegalArgumentException("Periodicite and valid pasIncrementale are required for CongeIncrementale");
                }
                CongeIncrementale incrementale = new CongeIncrementale();
                incrementale.setPeriodicite(userCongesDTO.getPeriodicite());
                incrementale.setPasIncrementale(userCongesDTO.getPasIncrementale());
                incrementale.setLastUpdated(new Date());
                congeType = incrementale;
                break;
            case DECREMENTALE:
                if (userCongesDTO.getValidite() == null) {
                    throw new IllegalArgumentException("Validite is required for CongeDecrementale");
                }
                CongeDecrementale decrementale = new CongeDecrementale();
                congeType = decrementale;
                break;
            default:
                throw new IllegalArgumentException("Invalid CongeType");
        }

        // Set common CongeType attributes
        congeType.setType(userCongesDTO.getType());
        congeType.setUnite(userCongesDTO.getUnite());
        congeType.setSoldeInitial(userCongesDTO.getSoldeActuel());
        congeType.setNom(userCongesDTO.getNom());
        congeType.setAbreviation(userCongesDTO.getAbreviation());
        congeType.setGlobal(false); // User-specific
        congeType.setValidite(userCongesDTO.getValidite());
        // Save CongeType
        CongeType savedCongeType = congeTypeRepository.save(congeType);

        // Create UserConges entry
        UserConges userConges = new UserConges();
        userConges.setUser(user);
        userConges.setCongeType(savedCongeType);
        userConges.setSoldeActuel(userCongesDTO.getSoldeActuel());
        UserConges savedUserConges = userCongesRepository.save(userConges);

        return mapToDTO(savedUserConges);
    }

    @Override
    @Transactional
    public UserCongesDTO updateSpecificCongeType(Long userId, Long congeTypeId, UserCongesDTO userCongesDTO) {
        UserConges userConges = userCongesRepository.findByUserIdAndCongeTypeId(userId, congeTypeId)
                .orElseThrow(() -> new RuntimeException("CongeType not assigned to this user"));
        CongeType congeType = userConges.getCongeType();

        // Only allow updates for non-global CongeTypes
        if (congeType.isGlobal()) {
            throw new RuntimeException("Cannot update a global CongeType");
        }

        // Verify the type matches
        if (congeType.getType() != userCongesDTO.getType()) {
            throw new IllegalArgumentException("Cannot change CongeType type");
        }

        // Update CongeType attributes
        congeType.setUnite(userCongesDTO.getUnite());
        congeType.setSoldeInitial(userCongesDTO.getSoldeActuel());
        congeType.setNom(userCongesDTO.getNom());
        congeType.setAbreviation(userCongesDTO.getAbreviation());
        congeType.setGlobal(false);

        // Update type-specific attributes
        switch (congeType.getType()) {
            case RENOUVELABLE:
                if (!(congeType instanceof CongeRenouvelable)) {
                    throw new IllegalStateException("Type mismatch for CongeRenouvelable");
                }
                ((CongeRenouvelable) congeType).setPeriodicite(userCongesDTO.getPeriodicite());
                ((CongeRenouvelable) congeType).setLastUpdated(new Date());
                ((CongeRenouvelable) congeType).setOriginalSoldeInitial(userCongesDTO.getSoldeActuel());
                break;
            case INCREMENTALE:
                if (!(congeType instanceof CongeIncrementale)) {
                    throw new IllegalStateException("Type mismatch for CongeIncrementale");
                }
                ((CongeIncrementale) congeType).setPeriodicite(userCongesDTO.getPeriodicite());
                ((CongeIncrementale) congeType).setPasIncrementale(userCongesDTO.getPasIncrementale());
                ((CongeIncrementale) congeType).setLastUpdated(new Date());
                break;
            case DECREMENTALE:
                if (!(congeType instanceof CongeDecrementale)) {
                    throw new IllegalStateException("Type mismatch for CongeDecrementale");
                }
                ((CongeDecrementale) congeType).setValidite(userCongesDTO.getValidite());
                break;
        }

        // Save updated CongeType
        congeTypeRepository.save(congeType);

        // Update UserConges
        userConges.setSoldeActuel(userCongesDTO.getSoldeActuel());
        UserConges savedUserConges = userCongesRepository.save(userConges);

        return mapToDTO(savedUserConges);
    }

    @Override
    @Transactional
    public void deleteSpecificCongeType(Long userId, Long congeTypeId) {
        UserConges userConges = userCongesRepository.findByUserIdAndCongeTypeId(userId, congeTypeId)
                .orElseThrow(() -> new RuntimeException("CongeType not assigned to this user"));
        CongeType congeType = userConges.getCongeType();

        // Only allow deletion for non-global CongeTypes
        if (congeType.isGlobal()) {
            throw new RuntimeException("Cannot delete a global CongeType");
        }

        // Delete UserConges
        userCongesRepository.delete(userConges);

        // Delete CongeType if not used by other users
        List<UserConges> remaining = userCongesRepository.findByCongeType(congeType);
        if (remaining.isEmpty()) {
            congeTypeRepository.delete(congeType);
        }
    }

    private UserCongesDTO mapToDTO(UserConges userConges) {
        UserCongesDTO dto = new UserCongesDTO();
        dto.setId(userConges.getId());
        dto.setUserId(userConges.getUser().getId());
        dto.setCongeTypeId(userConges.getCongeType().getId());
        dto.setSoldeActuel(userConges.getSoldeActuel());
        dto.setType(userConges.getCongeType().getType());
        dto.setGlobal(userConges.getCongeType().isGlobal());
        dto.setNom(userConges.getCongeType().getNom());
        dto.setAbreviation(userConges.getCongeType().getAbreviation());
        dto.setUnite(userConges.getCongeType().getUnite()); // Added unite
        dto.setLastUpdated(userConges.getLastUpdated());

        // Set type-specific attributes and validite
        CongeType congeType = userConges.getCongeType();
        dto.setValidite(congeType.getValidite()); // Set validite from base CongeType

        if (congeType instanceof CongeRenouvelable) {
            CongeRenouvelable renouvelable = (CongeRenouvelable) congeType;
            dto.setPeriodicite(renouvelable.getPeriodicite());
        } else if (congeType instanceof CongeIncrementale) {
            CongeIncrementale incrementale = (CongeIncrementale) congeType;
            dto.setPeriodicite(incrementale.getPeriodicite());
            dto.setPasIncrementale(incrementale.getPasIncrementale());
        } else if (congeType instanceof CongeDecrementale) {
            CongeDecrementale decrementale = (CongeDecrementale) congeType;
            // Use CongeDecrementale's validite if defined, otherwise keep base validite
            if (decrementale.getValidite() != null) {
                dto.setValidite(decrementale.getValidite());
            }
        }

        return dto;
    }




}