package com.example.PORTAIL_RH.document_service.Controller;

import com.example.PORTAIL_RH.document_service.dto.DocumentDTO;
import com.example.PORTAIL_RH.document_service.dto.DocumentUpdateRequest;
import com.example.PORTAIL_RH.document_service.Service.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    // Injection par constructeur
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDTO> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("description") String description,
            @RequestParam("categorie") String categorie) {
        DocumentDTO documentDTO = documentService.saveDocument(file, description, categorie);
        return new ResponseEntity<>(documentDTO, HttpStatus.CREATED);
    }

    @GetMapping("/get")
    public ResponseEntity<List<DocumentDTO>> getAllDocuments() {
        List<DocumentDTO> documents = documentService.getAllDocuments();
        return new ResponseEntity<>(documents, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<DocumentDTO> getDocumentById(@PathVariable Long id) {
        DocumentDTO documentDTO = documentService.getDocumentById(id);
        return new ResponseEntity<>(documentDTO, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDTO> updateDocumentWithFile(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "categorie", required = false) String categorie) {
        DocumentDTO updatedDocument = documentService.updateDocument(id, file, name, description, categorie);
        return new ResponseEntity<>(updatedDocument, HttpStatus.OK);
    }

    @PutMapping(value = "/update/{id}/json", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DocumentDTO> updateDocument(
            @PathVariable Long id,
            @RequestBody DocumentUpdateRequest updateRequest) {
        DocumentDTO updatedDocument = documentService.updateDocument(id, updateRequest.getName(), updateRequest.getDescription(), updateRequest.getUrl(), updateRequest.getCategorie());
        return new ResponseEntity<>(updatedDocument, HttpStatus.OK);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        Resource fileResource = documentService.downloadDocumentById(id);

        DocumentDTO documentDTO = documentService.getDocumentById(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(documentDTO.getType() != null ? documentDTO.getType() : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + documentDTO.getName() + "\"")
                .body(fileResource);
    }
}