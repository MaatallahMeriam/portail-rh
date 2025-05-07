package com.example.PORTAIL_RH.user_service.user_service.Repo;

import com.example.PORTAIL_RH.user_service.user_service.Entity.BirthdayWish;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BirthdayWishRepository extends JpaRepository<BirthdayWish, Long> {
    Optional<BirthdayWish> findBySenderAndRecipientAndCreatedAtBetween(
            Users sender, Users recipient, LocalDateTime startOfDay, LocalDateTime endOfDay
    );
    List<BirthdayWish> findBySenderAndCreatedAtBetween(Users sender, LocalDateTime start, LocalDateTime end);
    @Query("SELECT w FROM BirthdayWish w WHERE w.createdAt < :cutoffDate")
    List<BirthdayWish> findOldWishes(@Param("cutoffDate") LocalDateTime cutoffDate);

    List<BirthdayWish> findByRecipient(Users recipient);
}