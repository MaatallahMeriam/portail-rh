package com.example.PORTAIL_RH.request_service.Repo;

import com.example.PORTAIL_RH.request_service.Entity.Demande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DemandeRepository extends JpaRepository<Demande, Long> {
    List<Demande> findByUserId(Long userId);
    List<Demande> findByUserIdAndType(Long userId, Demande.DemandeType type);
    List<Demande> findByUserIdIn(List<Long> userIds);
    @Modifying
    @Query("DELETE FROM Demande d WHERE d.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}