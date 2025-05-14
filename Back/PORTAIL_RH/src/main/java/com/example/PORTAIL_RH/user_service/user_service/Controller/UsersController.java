package com.example.PORTAIL_RH.user_service.user_service.Controller;

import com.example.PORTAIL_RH.user_service.conges_service.DTO.UserCongesDTO;
import com.example.PORTAIL_RH.user_service.user_service.DTO.BirthdayWishDTO;
import com.example.PORTAIL_RH.user_service.user_service.DTO.UsersDTO;
import com.example.PORTAIL_RH.user_service.dossier_service.Entity.DossierUser;
import com.example.PORTAIL_RH.user_service.dossier_service.DTO.ResponseDossier;
import com.example.PORTAIL_RH.user_service.user_service.Entity.UserUpdateBasicDTO;
import com.example.PORTAIL_RH.user_service.user_service.Entity.UserUpdateFullDTO;
import com.example.PORTAIL_RH.user_service.user_service.Service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UsersController {

    @Autowired
    private UsersService usersService;

    @DeleteMapping("/{id}/profile-photo")
    public ResponseEntity<UsersDTO> deleteProfilePhoto(@PathVariable Long id) throws Exception {
        UsersDTO updatedUser = usersService.deleteProfilePhoto(id);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @PostMapping("/{id}/update-password")
    public ResponseEntity<Map<String, String>> updatePassword(@PathVariable Long id,
                                                              @RequestParam String oldPassword,
                                                              @RequestParam String newPassword) {
        try {
            boolean success = usersService.updatePassword(id, oldPassword, newPassword);
            if (success) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Mot de passe mis à jour avec succès.");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Échec de la mise à jour du mot de passe.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Une erreur est survenue.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @PutMapping("/{id}/update-basic")
    public ResponseEntity<UsersDTO> updateUserBasicInfo(
            @PathVariable Long id,
            @RequestBody UserUpdateBasicDTO dto) {
        UsersDTO updatedUser = usersService.updateUserBasicInfo(id, dto);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @PutMapping("/{id}/update-full")
    public ResponseEntity<UsersDTO> updateUserFullInfo(
            @PathVariable Long id,
            @RequestBody UserUpdateFullDTO dto) {
        UsersDTO updatedUser = usersService.updateUserFullInfo(id, dto);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @GetMapping("/get")
    public ResponseEntity<List<UsersDTO>> getAllUsers() {
        List<UsersDTO> users = usersService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/get/active")
    public ResponseEntity<List<UsersDTO>> getAllActiveUsers() {
        List<UsersDTO> users = usersService.getAllActiveUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/get/active/no-equipe")
    public ResponseEntity<List<UsersDTO>> getAllActiveUsersWithNoEquipe() {
        List<UsersDTO> users = usersService.getAllActiveUsersWithNoEquipe();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @PostMapping("/{id}/profile-photo")
    public ResponseEntity<UsersDTO> updateProfilePhoto(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image) throws Exception {
        UsersDTO updatedUser = usersService.updateProfilePhoto(id, image);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @GetMapping("/get/deactivated")
    public ResponseEntity<List<UsersDTO>> getAllDeactivatedUsers() {
        List<UsersDTO> users = usersService.getAllDeactivatedUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @PostMapping("/save")
    public ResponseEntity<UsersDTO> createUser(@RequestBody UsersDTO userDTO) {
        UsersDTO createdUser = usersService.createUser(userDTO);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsersDTO> updateUser(@PathVariable Long id, @RequestBody UsersDTO userDTO) {
        UsersDTO updatedUser = usersService.updateUser(id, userDTO);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<UsersDTO> activateUser(@PathVariable Long id) {
        UsersDTO activatedUser = usersService.activateUser(id);
        return new ResponseEntity<>(activatedUser, HttpStatus.OK);
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<UsersDTO> deactivateUser(@PathVariable Long id) {
        UsersDTO deactivatedUser = usersService.deactivateUser(id);
        return new ResponseEntity<>(deactivatedUser, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        usersService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{id}/dossier")
    public ResponseEntity<DossierUser> getDossierByUserId(@PathVariable Long id) {
        DossierUser dossier = usersService.getDossierByUserId(id);
        return new ResponseEntity<>(dossier, HttpStatus.OK);
    }

    @PutMapping("/{id}/dossier")
    public ResponseEntity<DossierUser> updateDossierByUserId(
            @PathVariable Long id, @RequestBody DossierUser updatedDossier) {
        DossierUser dossier = usersService.updateDossierByUserId(id, updatedDossier);
        return new ResponseEntity<>(dossier, HttpStatus.OK);
    }

    @DeleteMapping("/{id}/dossier")
    public ResponseEntity<Void> deleteDossierByUserId(@PathVariable Long id) {
        usersService.deleteDossierByUserId(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{id}/dossier/upload")
    public ResponseEntity<ResponseDossier> uploadDossierFiles(
            @PathVariable Long id,
            @RequestParam(value = "cv", required = false) MultipartFile cv,
            @RequestParam(value = "contrat", required = false) MultipartFile contrat,
            @RequestParam(value = "diplome", required = false) MultipartFile diplome) throws Exception {
        ResponseDossier response = usersService.uploadFilesForUser(id, cv, contrat, diplome);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsersDTO> getUserById(@PathVariable Long id) {
        UsersDTO user = usersService.getUserById(id);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/{id}/conges")
    public ResponseEntity<List<UserCongesDTO>> getUserConges(@PathVariable Long id) {
        List<UserCongesDTO> conges = usersService.getUserConges(id);
        return new ResponseEntity<>(conges, HttpStatus.OK);
    }

    @PostMapping("/{id}/wish-birthday")
    public ResponseEntity<Void> sendBirthdayWish(
            @PathVariable Long id,
            @RequestParam("message") String message,
            @RequestParam(value = "icon", required = false) String icon,
            @RequestParam(value = "image", required = false) MultipartFile image) throws Exception {
        usersService.sendBirthdayWish(id, message, icon, image);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/{id}/wishes")
    public ResponseEntity<List<BirthdayWishDTO>> getBirthdayWishes(@PathVariable Long id) {
        List<BirthdayWishDTO> wishes = usersService.getBirthdayWishes(id);
        return new ResponseEntity<>(wishes, HttpStatus.OK);
    }
    @GetMapping("/export-user-conges")
    public ResponseEntity<byte[]> exportUserCongesToCSV() {
        byte[] csvData = usersService.exportUserCongesToCSV();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "user_conges.csv");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }
    @GetMapping("/{senderId}/wished-users-today")
    public ResponseEntity<Set<Long>> getWishedUsersToday(@PathVariable Long senderId) {
        Set<Long> wishedUserIds = usersService.getWishedUserIdsToday(senderId);
        return new ResponseEntity<>(wishedUserIds, HttpStatus.OK);
    }
    @GetMapping("/export-active-users")
    public ResponseEntity<byte[]> exportActiveUsersToCSV() {
        byte[] csvData = usersService.exportActiveUsersToCSV();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "active_users.csv");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }
}