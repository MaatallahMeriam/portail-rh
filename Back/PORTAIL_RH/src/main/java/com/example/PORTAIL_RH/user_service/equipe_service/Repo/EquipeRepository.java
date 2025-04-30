package com.example.PORTAIL_RH.user_service.equipe_service.Repo;

import com.example.PORTAIL_RH.user_service.equipe_service.Entity.Equipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipeRepository extends JpaRepository<Equipe, Long> {
    List<Equipe> findByManagerId(Long managerId);

    Equipe findByNom(String equipeName);
}