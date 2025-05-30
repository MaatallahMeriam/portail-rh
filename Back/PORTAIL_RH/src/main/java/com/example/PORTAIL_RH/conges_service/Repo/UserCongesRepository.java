package com.example.PORTAIL_RH.conges_service.Repo;

import com.example.PORTAIL_RH.conges_service.Entity.CongeType;
import com.example.PORTAIL_RH.conges_service.Entity.UserConges;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCongesRepository extends JpaRepository<UserConges, Long> {
    List<UserConges> findByUserId(Long userId);
    List<UserConges> findByCongeType(CongeType congeType);
    Optional<UserConges> findByUserIdAndCongeTypeId(Long userId, Long congeTypeId);
    @Modifying
    @Query("DELETE FROM UserConges uc WHERE uc.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
    void deleteByCongeTypeId(Long id);
}