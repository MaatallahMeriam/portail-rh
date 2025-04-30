package com.example.PORTAIL_RH.user_service.conges_service.Repo;

import com.example.PORTAIL_RH.user_service.conges_service.Entity.CongeType;
import com.example.PORTAIL_RH.user_service.conges_service.Entity.UserConges;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCongesRepository extends JpaRepository<UserConges, Long> {
    List<UserConges> findByUserId(Long userId);
    List<UserConges> findByCongeType(CongeType congeType);
    Optional<UserConges> findByUserIdAndCongeTypeId(Long userId, Long congeTypeId);

    void deleteByCongeTypeId(Long id);
}