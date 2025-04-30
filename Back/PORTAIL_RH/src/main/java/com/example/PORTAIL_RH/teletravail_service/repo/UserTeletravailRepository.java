package com.example.PORTAIL_RH.teletravail_service.repo;


import com.example.PORTAIL_RH.teletravail_service.entity.UserTeletravail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserTeletravailRepository extends JpaRepository<UserTeletravail, Long> {
    Optional<UserTeletravail> findByUserIdAndPlanningId(Long userId, Long planningId);
    List<UserTeletravail> findByPlanningId(Long planningId);
    List<UserTeletravail> findByUserId(Long userId);
}