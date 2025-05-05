package com.example.PORTAIL_RH.user_service.equipe_service.Service.IMPL;

import com.example.PORTAIL_RH.user_service.equipe_service.DTO.EquipeDTO;
import com.example.PORTAIL_RH.user_service.user_service.DTO.UsersDTO;
import com.example.PORTAIL_RH.user_service.equipe_service.Entity.Equipe;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.equipe_service.Repo.EquipeRepository;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.user_service.user_service.Service.UsersService;
import com.example.PORTAIL_RH.user_service.equipe_service.Service.EquipeService;
import com.example.PORTAIL_RH.user_service.equipe_service.DTO.TeamMemberDTO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipeServiceImpl implements EquipeService {

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private UsersService usersService;

    private EquipeDTO mapToDTO(Equipe equipe) {
        EquipeDTO dto = new EquipeDTO();
        dto.setId(equipe.getId());
        dto.setNom(equipe.getNom());
        dto.setDepartement(equipe.getDepartement());
        dto.setManagerId(equipe.getManager() != null ? equipe.getManager().getId() : null);
        return dto;
    }

    private TeamMemberDTO mapToTeamMemberDTO(Users user) {
        TeamMemberDTO dto = new TeamMemberDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setPoste(user.getPoste());
        dto.setDepartement(user.getDepartement());
        String imageUrl = user.getImage() != null
                ? ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/" + user.getImage().replace("\\", "/"))
                .toUriString()
                : null;
        dto.setImage(imageUrl);
        dto.setMail(user.getMail());
        dto.setNumero(user.getNumero()); // Added to include phone number
        return dto;
    }
    @Override
    @Transactional
    public EquipeDTO createEquipe(EquipeDTO equipeDTO) {
        Equipe equipe = new Equipe();
        equipe.setNom(equipeDTO.getNom());
        equipe.setDepartement(equipeDTO.getDepartement());

        Equipe savedEquipe = equipeRepository.save(equipe);

        if (equipeDTO.getManagerId() != null) {
            Users manager = usersRepository.findById(equipeDTO.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            manager.setRole(Users.Role.MANAGER);
            manager.setEquipe(savedEquipe);
            savedEquipe.setManager(manager);
            savedEquipe.getUsers().add(manager);
            savedEquipe = equipeRepository.save(savedEquipe);
        }

        return mapToDTO(savedEquipe);
    }

    @Override
    public List<EquipeDTO> getAllEquipes() {
        return equipeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<EquipeDTO> getEquipesByManagerId(Long managerId) {
        return equipeRepository.findByManagerId(managerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UsersDTO> getUsersByEquipeId(Long equipeId) {
        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new RuntimeException("Equipe not found"));
        return equipe.getUsers().stream()
                .map(usersService::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UsersDTO> getUsersByEquipeIdExcludingManager(Long equipeId) {
        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new RuntimeException("Equipe not found"));
        Long managerId = equipe.getManager() != null ? equipe.getManager().getId() : null;
        return equipe.getUsers().stream()
                .filter(user -> !user.getId().equals(managerId))
                .map(usersService::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UsersDTO getManagerByEquipeId(Long equipeId) {
        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new RuntimeException("Equipe not found"));
        Users manager = equipe.getManager();
        if (manager == null) {
            throw new RuntimeException("No manager assigned to this equipe");
        }
        return usersService.mapToDTO(manager);
    }

    @Override
    @Transactional
    public void deleteEquipe(Long id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipe not found"));

        List<Users> usersCopy = new ArrayList<>(equipe.getUsers());
        usersCopy.forEach(user -> {
            user.setEquipe(null);
            equipe.getUsers().remove(user);
            usersRepository.save(user);
        });

        Users manager = equipe.getManager();
        if (manager != null) {
            manager.getEquipesGerees().remove(equipe);
            manager.setEquipe(null);
            equipe.getUsers().remove(manager);
            equipe.setManager(null);
            usersRepository.save(manager);
        }

        equipeRepository.save(equipe);
        equipeRepository.delete(equipe);
    }

    @Override
    public void assignUserToEquipe(Long equipeId, Long userId) {
        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new RuntimeException("Equipe not found"));
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getEquipe() != null && !user.getEquipe().getId().equals(equipeId)) {
            throw new RuntimeException("User is already assigned to another team");
        }

        user.setEquipe(equipe);
        equipe.getUsers().add(user);
        usersRepository.save(user);
    }

    @Override
    @Transactional
    public void assignUsersToEquipe(Long equipeId, List<Long> userIds) {
        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new RuntimeException("Equipe not found"));

        List<Users> usersToAssign = usersRepository.findAllById(userIds);
        if (usersToAssign.size() != userIds.size()) {
            throw new RuntimeException("One or more users not found");
        }

        List<String> errors = new ArrayList<>();
        for (Users user : usersToAssign) {
            if (user.getEquipe() != null && !user.getEquipe().getId().equals(equipeId)) {
                errors.add("User " + user.getId() + " is already assigned to another team");
            }
        }
        if (!errors.isEmpty()) {
            throw new RuntimeException(String.join("; ", errors));
        }

        usersToAssign.forEach(user -> {
            user.setEquipe(equipe);
            equipe.getUsers().add(user);
        });

        equipeRepository.save(equipe);
    }

    @Override
    public void removeUserFromEquipe(Long equipeId, Long userId) {
        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new RuntimeException("Equipe not found"));
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getEquipe() == null || !user.getEquipe().getId().equals(equipeId)) {
            throw new RuntimeException("User is not a member of this team");
        }

        if (equipe.getManager() != null && equipe.getManager().getId().equals(userId)) {
            throw new RuntimeException("Cannot remove the manager from the team via this method");
        }

        user.setEquipe(null);
        equipe.getUsers().remove(user);
        usersRepository.save(user);
    }

    @Override
    public EquipeDTO updateEquipe(Long id, EquipeDTO equipeDTO) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipe not found"));
        equipe.setNom(equipeDTO.getNom());
        equipe.setDepartement(equipeDTO.getDepartement());
        Equipe updatedEquipe = equipeRepository.save(equipe);
        return mapToDTO(updatedEquipe);
    }

    @Override
    @Transactional
    public EquipeDTO updateManager(Long equipeId, Long newManagerId) {
        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new RuntimeException("Equipe not found"));
        Users newManager = usersRepository.findById(newManagerId)
                .orElseThrow(() -> new RuntimeException("New manager not found"));

        Users oldManager = equipe.getManager();
        if (oldManager != null) {
            oldManager.getEquipesGerees().remove(equipe);
            if (oldManager.getEquipe() != null && oldManager.getEquipe().getId().equals(equipeId)) {
                oldManager.setEquipe(null);
                equipe.getUsers().remove(oldManager);
            }
            usersRepository.save(oldManager);
        }

        if (newManager.getRole() != Users.Role.MANAGER) {
            newManager.setRole(Users.Role.MANAGER);
        }
        equipe.setManager(newManager);
        if (newManager.getEquipe() == null || !newManager.getEquipe().getId().equals(equipeId)) {
            newManager.setEquipe(equipe);
            if (!equipe.getUsers().contains(newManager)) {
                equipe.getUsers().add(newManager);
            }
        }

        Equipe updatedEquipe = equipeRepository.save(equipe);
        usersRepository.save(newManager);

        return mapToDTO(updatedEquipe);
    }

    @Override
    public EquipeDTO getEquipeById(Long id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipe not found"));
        return mapToDTO(equipe);
    }

    @Override
    public List<TeamMemberDTO> getTeamMembersByManagerId(Long managerId) {
        List<Equipe> equipes = equipeRepository.findByManagerId(managerId);
        List<TeamMemberDTO> teamMembers = new ArrayList<>();

        for (Equipe equipe : equipes) {
            Long equipeManagerId = equipe.getManager() != null ? equipe.getManager().getId() : null;
            List<Users> members = equipe.getUsers().stream()
                    .filter(user -> !user.getId().equals(equipeManagerId)) // Exclure le manager
                    .collect(Collectors.toList());

            teamMembers.addAll(members.stream()
                    .map(this::mapToTeamMemberDTO)
                    .collect(Collectors.toList()));
        }

        return teamMembers;
    }
}