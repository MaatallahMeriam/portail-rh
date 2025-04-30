package com.example.PORTAIL_RH.user_service.conges_service.Repo;

import com.example.PORTAIL_RH.user_service.conges_service.Entity.CongeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public interface CongeTypeRepository extends JpaRepository<CongeType, Long> {
    List<CongeType> findByIsGlobalTrue();
    List<CongeType> findByType(CongeType.TypeConge type);
    List<CongeType> findByTypeIn(List<CongeType.TypeConge> types);
}