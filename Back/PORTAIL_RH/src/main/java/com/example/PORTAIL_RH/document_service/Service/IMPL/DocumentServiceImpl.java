package com.example.PORTAIL_RH.document_service.Service.IMPL;

import com.example.PORTAIL_RH.document_service.dto.DocumentDTO;
import com.example.PORTAIL_RH.document_service.Entity.Document;
import com.example.PORTAIL_RH.document_service.Repo.DocumentRepository;
import com.example.PORTAIL_RH.document_service.Service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;

    private static final String UPLOAD_DIR = "uploads/";

    @Override
    public DocumentDTO saveDocument(MultipartFile file, String description, String categorie) {
        try {
            String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFileName);

            Files.createDirectories(filePath.getParent());
            Files.write(filePath, file.getBytes());

            Document document = new Document();
            document.setName(file.getOriginalFilename());
            document.setType(file.getContentType());
            document.setUrl(filePath.toString());
            document.setDescription(description);
            document.setCategorie(categorie);

            Document savedDocument = documentRepository.save(document);
            return new DocumentDTO(savedDocument.getId(), savedDocument.getName(), savedDocument.getType(), savedDocument.getUrl(), savedDocument.getDescription(), savedDocument.getCategorie());
        } catch (Exception e) {
            throw new RuntimeException("Impossible de sauvegarder le document", e);
        }
    }

    @Override
    public Resource downloadDocumentById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));

        Path filePath = Paths.get(document.getUrl());
        if (!Files.exists(filePath)) {
            throw new RuntimeException("Le fichier n'existe pas sur le serveur: " + filePath);
        }

        return new FileSystemResource(filePath);
    }

    @Override
    public void deleteDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));

        try {
            Path filePath = Paths.get(document.getUrl());
            Files.deleteIfExists(filePath);
            documentRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la suppression du document", e);
        }
    }

    @Override
    public DocumentDTO getDocumentById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));

        return new DocumentDTO(document.getId(), document.getName(), document.getType(), document.getUrl(), document.getDescription(), document.getCategorie());
    }

    @Override
    public List<DocumentDTO> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(doc -> new DocumentDTO(doc.getId(), doc.getName(), doc.getType(), doc.getUrl(), doc.getDescription(), doc.getCategorie()))
                .collect(Collectors.toList());
    }

    @Override
    public DocumentDTO updateDocument(Long id, MultipartFile file, String name, String description, String categorie) {
        try {
            Document document = documentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document introuvable"));

            // Update name, description, and categorie if provided
            if (name != null) document.setName(name);
            if (description != null) document.setDescription(description);
            if (categorie != null) document.setCategorie(categorie);

            // Handle file update if provided
            if (file != null && !file.isEmpty()) {
                // Delete the old file
                Path oldFilePath = Paths.get(document.getUrl());
                Files.deleteIfExists(oldFilePath);

                // Upload the new file
                String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path newFilePath = Paths.get(UPLOAD_DIR + uniqueFileName);
                Files.createDirectories(newFilePath.getParent());
                Files.write(newFilePath, file.getBytes());

                document.setUrl(newFilePath.toString());
                document.setType(file.getContentType());
            }

            Document updatedDocument = documentRepository.save(document);
            return new DocumentDTO(updatedDocument.getId(), updatedDocument.getName(), updatedDocument.getType(), updatedDocument.getUrl(), updatedDocument.getDescription(), updatedDocument.getCategorie());
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la mise à jour du document avec fichier", e);
        }
    }

    @Override
    public DocumentDTO updateDocument(Long id, String name, String description, String url, String categorie) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));

        // Update name, description, url, and categorie if provided
        if (name != null) document.setName(name);
        if (description != null) document.setDescription(description);
        if (url != null) document.setUrl(url);
        if (categorie != null) document.setCategorie(categorie);

        Document updatedDocument = documentRepository.save(document);
        return new DocumentDTO(updatedDocument.getId(), updatedDocument.getName(), updatedDocument.getType(), updatedDocument.getUrl(), updatedDocument.getDescription(), updatedDocument.getCategorie());
    }
}