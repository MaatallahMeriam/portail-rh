package com.example.PORTAIL_RH.document_service.serviceImpl;

import com.example.PORTAIL_RH.document_service.Service.IMPL.DocumentServiceImpl;
import com.example.PORTAIL_RH.document_service.dto.DocumentDTO;
import com.example.PORTAIL_RH.document_service.Entity.Document;
import com.example.PORTAIL_RH.document_service.Repo.DocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DocumentServiceImplTest {

    @InjectMocks
    private DocumentServiceImpl documentService;

    @Mock
    private DocumentRepository documentRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }
    @Test
    void testSaveDocument_Failure() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "content".getBytes());
        String description = "Test document";
        String categorie = "Test";

        try (var mockedFiles = mockStatic(Files.class)) {
            mockedFiles.when(() -> Files.createDirectories(any(Path.class))).thenThrow(new IOException("Directory creation failed"));

            assertThrows(RuntimeException.class, () -> documentService.saveDocument(file, description, categorie));
            verify(documentRepository, never()).save(any(Document.class));
        }
    }

    @Test
    void testDeleteDocument_Failure() throws Exception {
        Document document = new Document();
        document.setId(1L);
        document.setUrl("uploads/test.txt");
        when(documentRepository.findById(1L)).thenReturn(Optional.of(document));

        try (var mockedFiles = mockStatic(Files.class)) {
            mockedFiles.when(() -> Files.deleteIfExists(any(Path.class))).thenThrow(new IOException("File deletion failed"));

            assertThrows(RuntimeException.class, () -> documentService.deleteDocument(1L));
            verify(documentRepository, never()).deleteById(1L);
        }
    }

    @Test
    void testDownloadDocumentById_Failure() throws Exception {
        Document document = new Document();
        document.setId(1L);
        document.setUrl("uploads/test.txt");

        when(documentRepository.findById(1L)).thenReturn(Optional.of(document));

        try (var mockedFiles = mockStatic(Files.class)) {
            mockedFiles.when(() -> Files.exists(any(Path.class))).thenReturn(false);

            assertThrows(RuntimeException.class, () -> documentService.downloadDocumentById(1L));
        }
    }
    @Test
    void testSaveDocument_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "content".getBytes());
        String description = "Test document";
        String categorie = "Test";

        try (var mockedFiles = mockStatic(Files.class)) {
            Path uploadPath = Paths.get("uploads");
            Path filePath = uploadPath.resolve("test.txt");

            mockedFiles.when(() -> Files.createDirectories(uploadPath)).thenReturn(uploadPath);
            mockedFiles.when(() -> Files.write(filePath, file.getBytes())).thenReturn(filePath);

            Document savedDocument = new Document();
            savedDocument.setId(1L);
            savedDocument.setName("test.txt");
            savedDocument.setType("text/plain");
            savedDocument.setUrl(filePath.toString());
            savedDocument.setDescription(description);
            savedDocument.setCategorie(categorie);

            when(documentRepository.save(any(Document.class))).thenReturn(savedDocument);

            DocumentDTO result = documentService.saveDocument(file, description, categorie);

            assertNotNull(result);
            assertEquals(1L, result.getId());
            assertEquals("test.txt", result.getName());
            assertEquals("text/plain", result.getType());
            assertEquals("uploads/test.txt", result.getUrl().replace("\\", "/"));  // Normalize path
            assertEquals(description, result.getDescription());
            assertEquals(categorie, result.getCategorie());
        }
    }

    @Test
    void testDeleteDocument_Success() throws Exception {
        Document document = new Document();
        document.setId(1L);
        document.setUrl("uploads/test.txt");
        when(documentRepository.findById(1L)).thenReturn(Optional.of(document));

        try (var mockedFiles = mockStatic(Files.class)) {
            mockedFiles.when(() -> Files.deleteIfExists(any(Path.class))).thenReturn(true);

            documentService.deleteDocument(1L);

            verify(documentRepository).findById(1L);
            verify(documentRepository).deleteById(1L);
            mockedFiles.verify(() -> Files.deleteIfExists(any(Path.class)), times(1));
        }
    }

    @Test
    void testDownloadDocumentById_Success() throws Exception {
        Document document = new Document();
        document.setId(1L);
        document.setUrl("uploads/test.txt");

        Path filePath = Paths.get(document.getUrl());

        when(documentRepository.findById(1L)).thenReturn(Optional.of(document));

        try (var mockedFiles = mockStatic(Files.class)) {
            mockedFiles.when(() -> Files.exists(filePath)).thenReturn(true);

            FileSystemResource result = (FileSystemResource) documentService.downloadDocumentById(1L);

            assertNotNull(result);
            assertEquals(filePath, result.getFile().toPath());
        }
    }

    @Test
    void testUpdateDocumentWithFile_Success() throws Exception {
        Document existingDocument = new Document();
        existingDocument.setId(1L);
        existingDocument.setUrl("uploads/old.txt");

        when(documentRepository.findById(1L)).thenReturn(Optional.of(existingDocument));

        MockMultipartFile file = new MockMultipartFile("file", "new.txt", "text/plain", "new content".getBytes());
        String name = "new name";
        String description = "new description";
        String categorie = "new category";

        Path oldPath = Paths.get(existingDocument.getUrl());
        Path newPath = Paths.get("uploads").resolve(file.getOriginalFilename());

        try (var mockedFiles = mockStatic(Files.class)) {
            mockedFiles.when(() -> Files.deleteIfExists(oldPath)).thenReturn(true);
            mockedFiles.when(() -> Files.createDirectories(Paths.get("uploads"))).thenReturn(Paths.get("uploads"));
            mockedFiles.when(() -> Files.write(newPath, file.getBytes())).thenReturn(newPath);

            Document updatedDocument = new Document();
            updatedDocument.setId(1L);
            updatedDocument.setName(name);
            updatedDocument.setType("text/plain");
            updatedDocument.setUrl(newPath.toString());
            updatedDocument.setDescription(description);
            updatedDocument.setCategorie(categorie);

            when(documentRepository.save(any(Document.class))).thenReturn(updatedDocument);

            DocumentDTO result = documentService.updateDocument(1L, file, name, description, categorie);

            assertNotNull(result);
            assertEquals(1L, result.getId());
            assertEquals(name, result.getName());
            assertEquals("text/plain", result.getType());
            assertEquals("uploads/new.txt", result.getUrl().replace("\\", "/"));  // Normalize path
            assertEquals(description, result.getDescription());
            assertEquals(categorie, result.getCategorie());
        }
    }
}
