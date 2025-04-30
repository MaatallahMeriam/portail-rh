package com.example.PORTAIL_RH.user_service.user_service.Service;

import com.example.PORTAIL_RH.user_service.conges_service.DTO.UserCongesDTO;
import com.example.PORTAIL_RH.user_service.dossier_service.DTO.ResponseDossier;
import com.example.PORTAIL_RH.user_service.dossier_service.Entity.DossierUser;
import com.example.PORTAIL_RH.user_service.user_service.DTO.UsersDTO;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UsersService {
    UsersDTO createUser(UsersDTO userDTO);
    List<UsersDTO> getAllUsers();
    List<UsersDTO> getAllActiveUsers();
    List<UsersDTO> getAllDeactivatedUsers();
    UsersDTO updateUser(Long id, UsersDTO userDTO);
    UsersDTO deactivateUser(Long id);
    void deleteUser(Long id);
    DossierUser getDossierByUserId(Long userId);
    DossierUser updateDossierByUserId(Long userId, DossierUser updatedDossier);
    void deleteDossierByUserId(Long userId);
    Users getUserEntityById(Long id);
    UsersDTO getUserById(Long id);
    ResponseDossier uploadFilesForUser(Long userId, MultipartFile cv, MultipartFile contrat, MultipartFile diplome) throws Exception;
    List<UserCongesDTO> getUserConges(Long id);
    List<UsersDTO> getAllActiveUsersWithNoEquipe();
    UsersDTO mapToDTO(Users user);
    UsersDTO updateProfilePhoto(Long userId, MultipartFile image) throws Exception;
    UsersDTO activateUser(Long id);
}