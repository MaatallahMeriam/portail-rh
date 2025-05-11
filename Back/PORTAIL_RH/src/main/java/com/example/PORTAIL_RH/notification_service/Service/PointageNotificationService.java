package com.example.PORTAIL_RH.notification_service.Service;

import com.example.PORTAIL_RH.notification_service.DTO.PointageNotificationDTO;

import java.time.LocalDate;

public interface PointageNotificationService {
    PointageNotificationDTO checkPendingPointageNotification(Long userId, LocalDate date);
    void acknowledgeNotification(Long notificationId);
}
