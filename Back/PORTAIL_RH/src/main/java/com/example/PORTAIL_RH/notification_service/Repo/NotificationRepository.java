package com.example.PORTAIL_RH.notification_service.Repo;

import com.example.PORTAIL_RH.notification_service.Entity.Notification;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdAndIsRead(Long userId, boolean isRead, Sort sort);
    List<Notification> findByUserId(Long userId, Sort sort);
    List<Notification> findByUserIdAndIsRead(Long userId, boolean isRead);
    List<Notification> findByUserId(Long userId);
}