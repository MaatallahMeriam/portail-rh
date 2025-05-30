package com.example.PORTAIL_RH.user_service.user_service.controller;

import com.example.PORTAIL_RH.conges_service.DTO.UserCongesDTO;
import com.example.PORTAIL_RH.user_service.user_service.Controller.UsersController;
import com.example.PORTAIL_RH.user_service.user_service.DTO.UsersDTO;
import com.example.PORTAIL_RH.user_service.user_service.Entity.UserUpdateBasicDTO;
import com.example.PORTAIL_RH.user_service.user_service.Service.UsersService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class UsersControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UsersService usersService;

    @InjectMocks
    private UsersController usersController;

    private ObjectMapper objectMapper;

    private UsersDTO userDTO;

    @BeforeEach
    void setUp() {
        // Initialize MockMvc manually
        mockMvc = MockMvcBuilders.standaloneSetup(usersController).build();
        objectMapper = new ObjectMapper();

        // Initialize test data
        userDTO = new UsersDTO();
        userDTO.setId(1L);
        userDTO.setUserName("testUser");
        userDTO.setNom("Test");
        userDTO.setPrenom("User");
        userDTO.setMail("test@example.com");
        userDTO.setDateNaissance("01/01/1990");
    }

    @Test
    void testGetUserById_Success() throws Exception {
        // Arrange
        Long userId = 1L;
        when(usersService.getUserById(userId)).thenReturn(userDTO);

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/api/users/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId))
                .andExpect(jsonPath("$.userName").value("testUser"))
                .andExpect(jsonPath("$.nom").value("Test"))
                .andExpect(jsonPath("$.prenom").value("User"))
                .andExpect(jsonPath("$.mail").value("test@example.com"));

        verify(usersService, times(1)).getUserById(userId);
    }

    @Test
    void testCreateUser_Success() throws Exception {
        // Arrange
        when(usersService.createUser(any(UsersDTO.class))).thenReturn(userDTO);

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.post("/api/users/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(userDTO.getId()))
                .andExpect(jsonPath("$.userName").value(userDTO.getUserName()))
                .andExpect(jsonPath("$.nom").value(userDTO.getNom()))
                .andExpect(jsonPath("$.prenom").value(userDTO.getPrenom()))
                .andExpect(jsonPath("$.mail").value(userDTO.getMail()));

        verify(usersService, times(1)).createUser(any(UsersDTO.class));
    }

    @Test
    void testUpdateUserBasicInfo_Success() throws Exception {
        // Arrange
        Long userId = 1L;
        UserUpdateBasicDTO dto = new UserUpdateBasicDTO();
        dto.setUserName("updatedUser");
        dto.setNom("Updated");
        dto.setPrenom("User");
        dto.setMail("updated@example.com");

        UsersDTO updatedUser = new UsersDTO();
        updatedUser.setId(userId);
        updatedUser.setUserName("updatedUser");
        updatedUser.setNom("Updated");
        updatedUser.setPrenom("User");
        updatedUser.setMail("updated@example.com");

        when(usersService.updateUserBasicInfo(eq(userId), any(UserUpdateBasicDTO.class))).thenReturn(updatedUser);

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.put("/api/users/{id}/update-basic", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId))
                .andExpect(jsonPath("$.userName").value("updatedUser"))
                .andExpect(jsonPath("$.nom").value("Updated"))
                .andExpect(jsonPath("$.prenom").value("User"))
                .andExpect(jsonPath("$.mail").value("updated@example.com"));

        verify(usersService, times(1)).updateUserBasicInfo(eq(userId), any(UserUpdateBasicDTO.class));
    }

    @Test
    void testUpdateProfilePhoto_Success() throws Exception {
        // Arrange
        Long userId = 1L;
        MockMultipartFile image = new MockMultipartFile("image", "photo.jpg", "image/jpeg", "content".getBytes());
        when(usersService.updateProfilePhoto(eq(userId), any(MockMultipartFile.class))).thenReturn(userDTO);

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/users/{id}/profile-photo", userId)
                        .file(image)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userDTO.getId()))
                .andExpect(jsonPath("$.userName").value(userDTO.getUserName()))
                .andExpect(jsonPath("$.nom").value(userDTO.getNom()))
                .andExpect(jsonPath("$.prenom").value(userDTO.getPrenom()))
                .andExpect(jsonPath("$.mail").value(userDTO.getMail()));

        verify(usersService, times(1)).updateProfilePhoto(eq(userId), any(MockMultipartFile.class));
    }

    @Test
    void testDeleteUser_Success() throws Exception {
        // Arrange
        Long userId = 1L;
        doNothing().when(usersService).deleteUser(userId);

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/users/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(usersService, times(1)).deleteUser(userId);
    }

    @Test
    void testGetAllUsers_Success() throws Exception {
        // Arrange
        List<UsersDTO> users = Collections.singletonList(userDTO);
        when(usersService.getAllUsers()).thenReturn(users);

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/api/users/get")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(userDTO.getId()))
                .andExpect(jsonPath("$[0].userName").value(userDTO.getUserName()))
                .andExpect(jsonPath("$[0].nom").value(userDTO.getNom()))
                .andExpect(jsonPath("$[0].prenom").value(userDTO.getPrenom()))
                .andExpect(jsonPath("$[0].mail").value(userDTO.getMail()));

        verify(usersService, times(1)).getAllUsers();
    }

    @Test
    void testGetAllActiveUsers_Success() throws Exception {
        // Arrange
        List<UsersDTO> activeUsers = Collections.singletonList(userDTO);
        when(usersService.getAllActiveUsers()).thenReturn(activeUsers);

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/api/users/get/active")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(userDTO.getId()))
                .andExpect(jsonPath("$[0].userName").value(userDTO.getUserName()))
                .andExpect(jsonPath("$[0].nom").value(userDTO.getNom()))
                .andExpect(jsonPath("$[0].prenom").value(userDTO.getPrenom()))
                .andExpect(jsonPath("$[0].mail").value(userDTO.getMail()));

        verify(usersService, times(1)).getAllActiveUsers();
    }

    @Test
    void testDeactivateUser_Success() throws Exception {
        // Arrange
        Long userId = 1L;
        UsersDTO deactivatedUser = new UsersDTO();
        deactivatedUser.setId(userId);
        deactivatedUser.setActive(false);
        when(usersService.deactivateUser(userId)).thenReturn(deactivatedUser);

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.put("/api/users/{id}/deactivate", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId))
                .andExpect(jsonPath("$.active").value(false));

        verify(usersService, times(1)).deactivateUser(userId);
    }

    @Test
    void testUpdatePassword_Success() throws Exception {
        // Arrange
        Long userId = 1L;
        String oldPassword = "oldPass";
        String newPassword = "newPass123";
        when(usersService.updatePassword(userId, oldPassword, newPassword)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.post("/api/users/{id}/update-password", userId)
                        .param("oldPassword", oldPassword)
                        .param("newPassword", newPassword)
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Mot de passe mis à jour avec succès."));

        verify(usersService, times(1)).updatePassword(userId, oldPassword, newPassword);
    }

    @Test
    void testUpdatePassword_Failure() throws Exception {
        // Arrange
        Long userId = 1L;
        String oldPassword = "wrongPass";
        String newPassword = "newPass123";
        when(usersService.updatePassword(userId, oldPassword, newPassword))
                .thenThrow(new IllegalArgumentException("L'ancien mot de passe est incorrect."));

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.post("/api/users/{id}/update-password", userId)
                        .param("oldPassword", oldPassword)
                        .param("newPassword", newPassword)
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("L'ancien mot de passe est incorrect."));

        verify(usersService, times(1)).updatePassword(userId, oldPassword, newPassword);
    }

    @Test
    void testExportUserCongesToCSV_Success() throws Exception {
        // Arrange
        byte[] csvData = "UserId;Conges\n1;10".getBytes();
        when(usersService.exportUserCongesToCSV()).thenReturn(csvData);

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/api/users/export-user-conges")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"user_conges.csv\""))
                .andExpect(content().bytes(csvData));

        verify(usersService, times(1)).exportUserCongesToCSV();
    }

    @Test
    void testGetUserConges_Success() throws Exception {
        // Arrange
        Long userId = 1L;
        List<UserCongesDTO> conges = Collections.singletonList(new UserCongesDTO());
        when(usersService.getUserConges(userId)).thenReturn(conges);

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/api/users/{id}/conges", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(usersService, times(1)).getUserConges(userId);
    }

    @Test
    void testSendBirthdayWish_Success() throws Exception {
        // Arrange
        Long recipientId = 1L;
        String message = "Happy Birthday!";
        MockMultipartFile image = new MockMultipartFile("image", "wish.jpg", "image/jpeg", "content".getBytes());
        doNothing().when(usersService).sendBirthdayWish(eq(recipientId), eq(message), eq(null), any(MockMultipartFile.class));

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/users/{id}/wish-birthday", recipientId)
                        .file(image)
                        .param("message", message)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());

        verify(usersService, times(1)).sendBirthdayWish(eq(recipientId), eq(message), eq(null), any(MockMultipartFile.class));
    }
}