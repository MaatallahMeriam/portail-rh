package com.example.PORTAIL_RH.user_service.dossier_service.service.impl;

import com.example.PORTAIL_RH.user_service.dossier_service.DTO.ResponseDossier;
import com.example.PORTAIL_RH.user_service.dossier_service.Entity.DossierUser;
import com.example.PORTAIL_RH.user_service.dossier_service.Repo.DossierUserRepository;
import com.example.PORTAIL_RH.user_service.dossier_service.Service.IMPL.DossierUserServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DossierUserServiceImplTest {

    @Mock
    private DossierUserRepository dossierUserRepository;

    @InjectMocks
    private DossierUserServiceImpl dossierUserService;

    private MockMultipartFile cv;
    private MockMultipartFile contrat;
    private MockMultipartFile diplome;
    private DossierUser dossier;

    @BeforeEach
    void setUp() {
        // Initialize sample files
        cv = new MockMultipartFile("cv", "cv.pdf", "application/pdf", "cv content".getBytes());
        contrat = new MockMultipartFile("contrat", "contrat.pdf", "application/pdf", "contrat content".getBytes());
        diplome = new MockMultipartFile("diplome", "diplome.pdf", "application/pdf", "diplome content".getBytes());

        // Initialize sample DossierUser
        dossier = new DossierUser();
        dossier.setId(1L);
        dossier.setCv("cv content".getBytes());
        dossier.setContrat("contrat content".getBytes());
        dossier.setDiplome("diplome content".getBytes());

        // Set up a mock servlet request context
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setScheme("http");
        request.setServerName("localhost");
        request.setServerPort(8080);
        request.setContextPath("/api");
        ServletRequestAttributes attributes = new ServletRequestAttributes(request);
        RequestContextHolder.setRequestAttributes(attributes);
    }

    @AfterEach
    void tearDown() {
        // Clean up the request context after each test
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void testUploadFiles_Success() throws Exception {
        // Arrange
        when(dossierUserRepository.save(any(DossierUser.class))).thenReturn(dossier);

        // Act
        ResponseDossier response = dossierUserService.uploadFiles(cv, contrat, diplome);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getCvDownloadUrl()).contains("/download/1/cv");
        assertThat(response.getContratDownloadUrl()).contains("/download/1/contrat");
        assertThat(response.getDiplomeDownloadUrl()).contains("/download/1/diplome");
        verify(dossierUserRepository, times(1)).save(any(DossierUser.class));
    }

    @Test
    void testUploadFiles_NullFiles() throws Exception {
        // Arrange
        when(dossierUserRepository.save(any(DossierUser.class))).thenReturn(new DossierUser(1L, null, null, null, null));

        // Act
        ResponseDossier response = dossierUserService.uploadFiles(null, null, null);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getCvDownloadUrl()).contains("/download/1/cv");
        assertThat(response.getContratDownloadUrl()).contains("/download/1/contrat");
        assertThat(response.getDiplomeDownloadUrl()).contains("/download/1/diplome");
        verify(dossierUserRepository, times(1)).save(any(DossierUser.class));
    }

    @Test
    void testDownloadFile_Success_Cv() throws Exception {
        // Arrange
        when(dossierUserRepository.findById(1L)).thenReturn(Optional.of(dossier));

        // Act
        byte[] fileData = dossierUserService.downloadFile(1L, "cv");

        // Assert
        assertThat(fileData).isEqualTo("cv content".getBytes());
        verify(dossierUserRepository, times(1)).findById(1L);
    }

    @Test
    void testDownloadFile_DossierNotFound() {
        // Arrange
        when(dossierUserRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> dossierUserService.downloadFile(1L, "cv"))
                .isInstanceOf(Exception.class)
                .hasMessage("Dossier not found for id: 1");
        verify(dossierUserRepository, times(1)).findById(1L);
    }

    @Test
    void testDownloadFile_InvalidFileType() {
        // Arrange
        when(dossierUserRepository.findById(1L)).thenReturn(Optional.of(dossier));

        // Act & Assert
        assertThatThrownBy(() -> dossierUserService.downloadFile(1L, "invalid"))
                .isInstanceOf(Exception.class)
                .hasMessage("Invalid file type");
        verify(dossierUserRepository, times(1)).findById(1L);
    }

    @Test
    void testDeleteDossier_Success() {
        // Arrange
        doNothing().when(dossierUserRepository).deleteById(1L);

        // Act
        dossierUserService.deleteDossier(1L);

        // Assert
        verify(dossierUserRepository, times(1)).deleteById(1L);
    }

    @Test
    void testUploadSingleFile_Success() throws Exception {
        // Arrange
        when(dossierUserRepository.findById(1L)).thenReturn(Optional.of(dossier));
        when(dossierUserRepository.save(any(DossierUser.class))).thenReturn(dossier);

        // Act
        ResponseDossier response = dossierUserService.uploadSingleFile(1L, "cv", cv);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getCvDownloadUrl()).contains("/api/dossier/download/1/cv");
        verify(dossierUserRepository, times(1)).findById(1L);
        verify(dossierUserRepository, times(1)).save(any(DossierUser.class));
    }

    @Test
    void testUploadSingleFile_DossierNotFound() {
        // Arrange
        when(dossierUserRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> dossierUserService.uploadSingleFile(1L, "cv", cv))
                .isInstanceOf(Exception.class)
                .hasMessage("Dossier not found for id: 1");
        verify(dossierUserRepository, times(1)).findById(1L);
    }

    @Test
    void testUploadSingleFile_NullFile() {
        // Act & Assert
        assertThatThrownBy(() -> dossierUserService.uploadSingleFile(1L, "cv", null))
                .isInstanceOf(Exception.class)
                .hasMessage("No file provided for upload");
        // No interaction with repository expected due to early exception
        verifyNoInteractions(dossierUserRepository);
    }

    @Test
    void testDeleteSingleFile_Success() throws Exception {
        // Arrange
        when(dossierUserRepository.findById(1L)).thenReturn(Optional.of(dossier));
        when(dossierUserRepository.save(any(DossierUser.class))).thenReturn(dossier);

        // Act
        dossierUserService.deleteSingleFile(1L, "cv");

        // Assert
        verify(dossierUserRepository, times(1)).findById(1L);
        verify(dossierUserRepository, times(1)).save(any(DossierUser.class));
    }

    @Test
    void testDeleteSingleFile_DossierNotFound() {
        // Arrange
        when(dossierUserRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> dossierUserService.deleteSingleFile(1L, "cv"))
                .isInstanceOf(Exception.class)
                .hasMessage("Dossier not found for id: 1");
        verify(dossierUserRepository, times(1)).findById(1L);
    }

    @Test
    void testDeleteSingleFile_InvalidFileType() {
        // Arrange
        when(dossierUserRepository.findById(1L)).thenReturn(Optional.of(dossier));

        // Act & Assert
        assertThatThrownBy(() -> dossierUserService.deleteSingleFile(1L, "invalid"))
                .isInstanceOf(Exception.class)
                .hasMessage("Invalid file type: invalid");
        verify(dossierUserRepository, times(1)).findById(1L);
    }
}