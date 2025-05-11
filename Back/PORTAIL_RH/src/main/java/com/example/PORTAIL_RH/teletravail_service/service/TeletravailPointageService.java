package com.example.PORTAIL_RH.teletravail_service.service;

import com.example.PORTAIL_RH.teletravail_service.dto.TeletravailPointageDTO;

import java.time.LocalDate;
import java.util.List;

public interface TeletravailPointageService {
    String getQRCodeForUser(Long userId, LocalDate date) throws Exception;
    void recordPointage(String token);
    List<TeletravailPointageDTO> getPointagesForPeriod(LocalDate start, LocalDate end, Long userId); // Ajout de userId
    boolean sendPointageEmail(Long userId, LocalDate date) throws Exception;
    void generateAndSendQRCodes() throws Exception;
    String generateQRCode(Long userId, LocalDate date) throws Exception;
}