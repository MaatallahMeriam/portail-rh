package com.example.PORTAIL_RH.teletravail_service.service.impl;

import com.example.PORTAIL_RH.teletravail_service.dto.TeletravailPlanningDTO;
import com.example.PORTAIL_RH.teletravail_service.dto.UserTeletravailDTO;
import com.example.PORTAIL_RH.teletravail_service.entity.TeletravailPlanning;
import com.example.PORTAIL_RH.teletravail_service.entity.UserTeletravail;
import com.example.PORTAIL_RH.teletravail_service.repo.TeletravailPlanningRepository;
import com.example.PORTAIL_RH.teletravail_service.repo.UserTeletravailRepository;
import com.example.PORTAIL_RH.teletravail_service.service.TeletravailService;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeletravailServiceImpl implements TeletravailService {

    @Autowired
    private TeletravailPlanningRepository planningRepository;

    @Autowired
    private UserTeletravailRepository userTeletravailRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Override
    @Transactional
    public TeletravailPlanningDTO createPlanning(TeletravailPlanningDTO planningDTO) {
        Users rh = usersRepository.findById(planningDTO.getRhId())
                .orElseThrow(() -> new RuntimeException("RH not found"));

        // Vérifier si un planning existe déjà pour ce mois
        YearMonth mois = YearMonth.parse(planningDTO.getMois());
        List<TeletravailPlanning> existingPlannings = planningRepository.findByMois(mois);
        if (!existingPlannings.isEmpty()) {
            throw new RuntimeException("Un planning existe déjà pour le mois " + planningDTO.getMois() + ".");
        }

        // Mapper DTO vers entité
        TeletravailPlanning planning = new TeletravailPlanning();
        planning.setPolitique(planningDTO.getPolitique());
        planning.setNombreJoursMax(planningDTO.getNombreJoursMax());
        planning.setMois(mois);
        planning.setJoursFixes(planningDTO.getJoursFixes());
        planning.setRh(rh);

        TeletravailPlanning savedPlanning = planningRepository.save(planning);

        // Attribuer le planning à tous les utilisateurs (sauf RH)
        List<Users> users = usersRepository.findAllByRoleNot(Users.Role.RH);
        for (Users user : users) {
            UserTeletravail userTeletravail = new UserTeletravail();
            userTeletravail.setUser(user);
            userTeletravail.setPlanning(savedPlanning);
            userTeletravailRepository.save(userTeletravail);
        }

        // Mapper entité vers DTO pour la réponse
        planningDTO.setId(savedPlanning.getId());
        return planningDTO;
    }

    @Override
    @Transactional
    public UserTeletravailDTO selectDays(UserTeletravailDTO userTeletravailDTO) {
        Users user = usersRepository.findById(userTeletravailDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeletravailPlanning planning = planningRepository.findById(userTeletravailDTO.getPlanningId())
                .orElseThrow(() -> new RuntimeException("Planning not found"));
        UserTeletravail userTeletravail = userTeletravailRepository.findByUserIdAndPlanningId(
                        userTeletravailDTO.getUserId(), userTeletravailDTO.getPlanningId())
                .orElseThrow(() -> new RuntimeException("UserTeletravail not found"));

        // Validation selon la politique
        if (planning.getPolitique() == TeletravailPlanning.Politique.SEUIL_LIBRE) {
            if (userTeletravailDTO.getJoursChoisis().size() > planning.getNombreJoursMax()) {
                throw new RuntimeException("Nombre de jours dépasse la limite : " + planning.getNombreJoursMax());
            }
        } else if (planning.getPolitique() == TeletravailPlanning.Politique.PLANNING_FIXE) {
            for (String jour : userTeletravailDTO.getJoursChoisis()) {
                if (!planning.getJoursFixes().contains(jour)) {
                    throw new RuntimeException("Jour non autorisé : " + jour);
                }
            }
            if (userTeletravailDTO.getJoursChoisis().size() > planning.getNombreJoursMax()) {
                throw new RuntimeException("Nombre de jours dépasse la limite : " + planning.getNombreJoursMax());
            }
        }

        // Mettre à jour l'entité
        userTeletravail.setJoursChoisis(userTeletravailDTO.getJoursChoisis());
        UserTeletravail savedUserTeletravail = userTeletravailRepository.save(userTeletravail);

        // Mapper entité vers DTO pour la réponse
        userTeletravailDTO.setId(savedUserTeletravail.getId());
        return userTeletravailDTO;
    }

    @Override
    public List<UserTeletravailDTO> getUserPlannings(Long userId) {
        return userTeletravailRepository.findByUserId(userId).stream()
                .map(this::mapToUserTeletravailDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TeletravailPlanningDTO> getPlanningsForMonth(Long rhId, YearMonth mois) {
        Users rh = usersRepository.findById(rhId)
                .orElseThrow(() -> new RuntimeException("RH not found"));

        List<TeletravailPlanning> plannings = planningRepository.findByMois(mois);
        return plannings.stream()
                .map(planning -> {
                    TeletravailPlanningDTO dto = new TeletravailPlanningDTO();
                    dto.setId(planning.getId());
                    dto.setPolitique(planning.getPolitique());
                    dto.setNombreJoursMax(planning.getNombreJoursMax());
                    dto.setMois(planning.getMois().toString());
                    dto.setJoursFixes(planning.getJoursFixes());
                    dto.setRhId(planning.getRh().getId());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private UserTeletravailDTO mapToUserTeletravailDTO(UserTeletravail userTeletravail) {
        UserTeletravailDTO dto = new UserTeletravailDTO();
        dto.setId(userTeletravail.getId());
        dto.setUserId(userTeletravail.getUser().getId());
        dto.setPlanningId(userTeletravail.getPlanning().getId());
        dto.setJoursChoisis(userTeletravail.getJoursChoisis());

        // Mapper les détails du planning
        TeletravailPlanning planning = userTeletravail.getPlanning();
        TeletravailPlanningDTO planningDTO = new TeletravailPlanningDTO();
        planningDTO.setId(planning.getId());
        planningDTO.setPolitique(planning.getPolitique());
        planningDTO.setNombreJoursMax(planning.getNombreJoursMax());
        planningDTO.setMois(planning.getMois().toString());
        planningDTO.setJoursFixes(planning.getJoursFixes());
        planningDTO.setRhId(planning.getRh().getId());
        dto.setPlanning(planningDTO);

        return dto;
    }
}