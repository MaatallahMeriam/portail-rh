package com.example.PORTAIL_RH.notification_service.DTO;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PointageNotificationDTO {
    private Long id;
    private Long userId;
    private LocalDate pointageDate;
    private boolean isAcknowledged;

    public void setIsAcknowledged(boolean acknowledged) {

    }
}