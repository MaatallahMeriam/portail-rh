package com.example.PORTAIL_RH.competence_service.repo;


import com.example.PORTAIL_RH.competence_service.entity.Projet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjetRepository extends JpaRepository<Projet, Long> {
}
