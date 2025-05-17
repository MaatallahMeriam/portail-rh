package com.example.PORTAIL_RH.notification_service.Repo;

import com.example.PORTAIL_RH.notification_service.Entity.PointageNotification;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PointageNotificationRepository extends JpaRepository<PointageNotification, Long> {
    Optional<PointageNotification> findByUserAndPointageDateAndIsAcknowledgedFalse(Users user, LocalDate date);
    boolean existsByUserAndPointageDateAndIsAcknowledgedFalse(Users user, LocalDate date);
    void deleteByUser(Users user); // Add this method
}