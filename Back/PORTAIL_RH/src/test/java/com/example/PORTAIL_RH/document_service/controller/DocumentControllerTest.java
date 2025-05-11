package com.example.PORTAIL_RH.document_service.controller;

import com.example.PORTAIL_RH.document_service.Controller.DocumentController;
import com.example.PORTAIL_RH.document_service.dto.DocumentDTO;
import com.example.PORTAIL_RH.document_service.Service.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class) // Ajout de l'extension Mockito
public class DocumentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DocumentService documentService; // Remplace @MockBean par @Mock

    @Autowired
    private WebApplicationContext webApplicationContext;

    @BeforeEach
    void setUp() {
        // Initialiser le contrôleur manuellement avec le mock
        DocumentController documentController = new DocumentController();
        documentController.setDocumentService(documentService); // Injection manuelle via setter

        // Configurer MockMvc
        mockMvc = MockMvcBuilders.standaloneSetup(documentController).build();
    }

    @Test
    void testUploadDocument_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "content".getBytes());
        DocumentDTO documentDTO = new DocumentDTO(1L, "test.txt", "text/plain", "uploads/test.txt", "Test doc", "Test");
        when(documentService.saveDocument(any(), anyString(), anyString())).thenReturn(documentDTO);

        mockMvc.perform(multipart("/api/documents/upload")
                        .file(file)
                        .param("description", "Test doc")
                        .param("categorie", "Test"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("test.txt"));
    }

    @Test
    void testDownloadDocument_Success() throws Exception {
        DocumentDTO documentDTO = new DocumentDTO(1L, "test.txt", "text/plain", "uploads/test.txt", "Test doc", "Test");
        when(documentService.getDocumentById(anyLong())).thenReturn(documentDTO);
        when(documentService.downloadDocumentById(anyLong())).thenReturn(null); // Simuler un Resource (simplifié)

        mockMvc.perform(get("/api/documents/download/1"))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteDocument_Success() throws Exception {
        mockMvc.perform(delete("/api/documents/delete/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testUpdateDocumentWithFile_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "new.txt", "text/plain", "new content".getBytes());
        DocumentDTO documentDTO = new DocumentDTO(1L, "new.txt", "text/plain", "uploads/new.txt", "New doc", "New");
        when(documentService.updateDocument(anyLong(), (MultipartFile) any(), anyString(), anyString(), anyString())).thenReturn(documentDTO);

        mockMvc.perform(multipart("/api/documents/update/1")
                        .file(file)
                        .param("name", "new.txt")
                        .param("description", "New doc")
                        .param("categorie", "New")
                        .with(request -> { request.setMethod("PUT"); return request; })) // <-- Ajout nécessaire
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("new.txt"));

    }
}