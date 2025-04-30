package com.example.PORTAIL_RH.user_service.conges_service.Service;

import com.example.PORTAIL_RH.user_service.conges_service.DTO.CongeTypeDTO;
import com.example.PORTAIL_RH.user_service.conges_service.DTO.UserCongesDTO;

import java.util.List;

public interface UserCongesService {
    UserCongesDTO createUserConges(UserCongesDTO userCongesDTO);
    UserCongesDTO getUserCongesById(Long id);
    List<UserCongesDTO> getUserCongesByUserId(Long userId);
    UserCongesDTO updateUserConges(Long id, UserCongesDTO userCongesDTO);
    void deleteUserConges(Long id);
    void requestConge(Long userId, Long congeTypeId, int daysRequested);
    List<CongeTypeDTO> getAllCongeTypesForUser(Long userId);
    // New methods for user-specific CongeType management
    UserCongesDTO assignSpecificCongeType(Long userId, UserCongesDTO userCongesDTO);
    UserCongesDTO updateSpecificCongeType(Long userId, Long congeTypeId, UserCongesDTO userCongesDTO);
    void deleteSpecificCongeType(Long userId, Long congeTypeId);
}