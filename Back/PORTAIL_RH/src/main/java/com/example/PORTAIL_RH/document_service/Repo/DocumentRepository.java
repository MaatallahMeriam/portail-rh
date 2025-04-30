package com.example.PORTAIL_RH.document_service.Repo;

import com.example.PORTAIL_RH.document_service.Entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
}

