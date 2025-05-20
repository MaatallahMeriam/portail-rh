package com.example.PORTAIL_RH.user_service.user_service.Service;

import com.example.PORTAIL_RH.user_service.conges_service.DTO.UserCongesDTO;
import com.example.PORTAIL_RH.user_service.user_service.DTO.BirthdayWishDTO;
import com.example.PORTAIL_RH.user_service.user_service.DTO.UsersDTO;
import com.example.PORTAIL_RH.user_service.dossier_service.Entity.DossierUser;
import com.example.PORTAIL_RH.user_service.dossier_service.DTO.ResponseDossier;
import com.example.PORTAIL_RH.user_service.user_service.Entity.UserUpdateBasicDTO;
import com.example.PORTAIL_RH.user_service.user_service.Entity.UserUpdateFullDTO;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

public interface UsersService {

    UsersDTO getUserById(Long id);

    UsersDTO createUser(UsersDTO userDTO);

    List<UsersDTO> getAllUsers();

    List<UsersDTO> getAllActiveUsers();
    boolean updatePassword(Long userId, String oldPassword, String newPassword);
    List<UsersDTO> getAllActiveUsersWithNoEquipe();
    UsersDTO deleteProfilePhoto(Long userId) throws Exception;
    List<UsersDTO> getAllDeactivatedUsers();

    UsersDTO updateUser(Long id, UsersDTO userDTO);


    UsersDTO deactivateUser(Long id);

    void deleteUser(Long id);

    boolean modifierPWD(Long userId, String newPassword);

    DossierUser getDossierByUserId(Long userId);

    UsersDTO activateUser(Long id);

    DossierUser updateDossierByUserId(Long userId, DossierUser updatedDossier);

    byte[] exportUserCongesToCSV();

    byte[] exportActiveUsersToCSV();


    Users getUserEntityById(Long id);

    void deleteDossierByUserId(Long userId);

    ResponseDossier uploadFilesForUser(Long userId, MultipartFile cv, MultipartFile contrat, MultipartFile diplome) throws Exception;

    List<UserCongesDTO> getUserConges(Long userId);

    void sendBirthdayWish(Long recipientId, String message, String icon, MultipartFile image) throws Exception;

    void clearOldWishes();

    List<BirthdayWishDTO> getBirthdayWishes(Long recipientId);

    Set<Long> getWishedUserIdsToday(Long senderId);

    UsersDTO updateProfilePhoto(Long userId, MultipartFile image) throws Exception;

    UsersDTO updateUserFullInfo(Long id, UserUpdateFullDTO dto);

    UsersDTO updateUserBasicInfo(Long id, UserUpdateBasicDTO dto);

    UsersDTO mapToDTO(Users user);
}