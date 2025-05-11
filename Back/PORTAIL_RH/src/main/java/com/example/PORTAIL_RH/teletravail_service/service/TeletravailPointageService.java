package com.example.PORTAIL_RH.teletravail_service.service;

import com.example.PORTAIL_RH.teletravail_service.entity.TeletravailPointage;
import java.time.LocalDate;
import java.util.List;

public interface TeletravailPointageService {

    String generateQRCode(Long userId, LocalDate date) throws Exception;

    void recordPointage(String token);

    String getQRCodeForUser(Long userId, LocalDate date) throws Exception;

    List<TeletravailPointage> getPointagesForPeriod(LocalDate start, LocalDate end);

    void generateAndSendQRCodes() throws Exception;

    boolean sendPointageEmail(Long userId, LocalDate date) throws Exception;
}