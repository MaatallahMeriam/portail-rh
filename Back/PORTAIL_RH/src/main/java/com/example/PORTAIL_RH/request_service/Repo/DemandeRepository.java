package com.example.PORTAIL_RH.request_service.Repo;

import com.example.PORTAIL_RH.request_service.Entity.Demande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DemandeRepository extends JpaRepository<Demande, Long> {
    List<Demande> findByUserId(Long userId);
    List<Demande> findByUserIdAndType(Long userId, Demande.DemandeType type);
    List<Demande> findByUserIdIn(List<Long> userIds);
}