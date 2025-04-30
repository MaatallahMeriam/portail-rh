package com.example.PORTAIL_RH.document_service.Service;

import com.example.PORTAIL_RH.document_service.dto.DocumentDTO;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {

        DocumentDTO saveDocument(MultipartFile file, String description, String categorie);
        void deleteDocument(Long id);
        DocumentDTO getDocumentById(Long id);
        List<DocumentDTO> getAllDocuments();

        // New methods for update functionality
        DocumentDTO updateDocument(Long id, MultipartFile file, String name, String description, String categorie); // With file
        DocumentDTO updateDocument(Long id, String name, String description, String url, String categorie); // Without file
        Resource downloadDocumentById(Long id);
}