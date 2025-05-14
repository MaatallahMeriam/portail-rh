package com.example.PORTAIL_RH.document_service.controller;

import com.example.PORTAIL_RH.document_service.Controller.DocumentController;
import com.example.PORTAIL_RH.document_service.Service.DocumentService;
import com.example.PORTAIL_RH.document_service.dto.DocumentDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentControllerTest {

    @Mock
    private DocumentService documentService;

    @InjectMocks
    private DocumentController documentController;

    @BeforeEach
    void setUp() {
        // MockitoExtension will automatically initialize mocks and inject them into documentController
    }

    @Test
    void testGetDocumentById() {
        // Arrange
        Long documentId = 1L;
        DocumentDTO mockDocument = new DocumentDTO(documentId, "test.pdf", "application/pdf", "uploads/test.pdf", "Test document", "General");
        when(documentService.getDocumentById(documentId)).thenReturn(mockDocument);

        // Act
        DocumentDTO result = documentController.getDocumentById(documentId).getBody();

        // Assert
        assertEquals(mockDocument, result);
        verify(documentService, times(1)).getDocumentById(documentId);
    }
}
