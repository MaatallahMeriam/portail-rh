package com.example.PORTAIL_RH.notification_service.Repo;

import com.example.PORTAIL_RH.notification_service.Entity.ReactionNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReactionNotificationRepository extends JpaRepository<ReactionNotification, Long> {
    List<ReactionNotification> findByRecipientId(Long recipientId);
}