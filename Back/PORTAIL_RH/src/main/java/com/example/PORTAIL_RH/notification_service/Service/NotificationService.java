package com.example.PORTAIL_RH.notification_service.Service;

import com.example.PORTAIL_RH.notification_service.DTO.NotificationDTO;
import com.example.PORTAIL_RH.request_service.Entity.Demande;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;

import java.util.List;

public interface NotificationService {
    void createNotificationForRole(Demande demande);
    void createNotificationForUser(Users user, String message, String type, Long demandeId);
    void createNotificationForRoleUsers(Users.Role role, String message, String type, Long demandeId);
    void notifyRequesterStatusChange(Demande demande, String status); // Added
    List<NotificationDTO> getNotificationsByUserId(Long userId, boolean isRead);
    List<NotificationDTO> getNotificationsByUserId(Long userId);
    NotificationDTO markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}