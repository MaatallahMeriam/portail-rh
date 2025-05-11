package com.example.PORTAIL_RH.teletravail_service.repo;

import com.example.PORTAIL_RH.teletravail_service.entity.UserTeletravail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserTeletravailRepository extends JpaRepository<UserTeletravail, Long> {
    Optional<UserTeletravail> findByUserIdAndPlanningId(Long userId, Long planningId);
    List<UserTeletravail> findByPlanningId(Long planningId);
    List<UserTeletravail> findByUserId(Long userId);

    @Query("SELECT ut FROM UserTeletravail ut JOIN ut.joursChoisis jc WHERE ut.user.id = :userId AND jc = :jour")
    Optional<UserTeletravail> findByUserIdAndJoursChoisisContaining(@Param("userId") Long userId, @Param("jour") String jour);
}