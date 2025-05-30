package com.example.PORTAIL_RH.equipe_service.Service;

import com.example.PORTAIL_RH.equipe_service.DTO.EquipeDTO;
import com.example.PORTAIL_RH.user_service.user_service.DTO.UsersDTO;
import com.example.PORTAIL_RH.equipe_service.DTO.TeamMemberDTO;

import java.util.List;

public interface EquipeService {
    EquipeDTO createEquipe(EquipeDTO equipeDTO);
    List<EquipeDTO> getAllEquipes();
    List<EquipeDTO> getEquipesByManagerId(Long managerId);
    List<UsersDTO> getUsersByEquipeId(Long equipeId);
    List<UsersDTO> getUsersByEquipeIdExcludingManager(Long equipeId);
    UsersDTO getManagerByEquipeId(Long equipeId);
    void deleteEquipe(Long id);
    void assignUserToEquipe(Long equipeId, Long userId);
    void assignUsersToEquipe(Long equipeId, List<Long> userIds);
    void removeUserFromEquipe(Long equipeId, Long userId);
    EquipeDTO updateEquipe(Long id, EquipeDTO equipeDTO);
    EquipeDTO updateManager(Long equipeId, Long newManagerId);
    EquipeDTO getEquipeById(Long id);
    List<TeamMemberDTO> getTeamMembersByManagerId(Long managerId); // Nouvelle méthode
}