package com.example.PORTAIL_RH.teletravail_service.repo;

import com.example.PORTAIL_RH.teletravail_service.entity.TeletravailPointage;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface TeletravailPointageRepository extends JpaRepository<TeletravailPointage, Long> {
    boolean existsByUserAndPointageDate(Users user, LocalDate date);
    Optional<TeletravailPointage> findByUserAndPointageDate(Users user, LocalDate date);
}