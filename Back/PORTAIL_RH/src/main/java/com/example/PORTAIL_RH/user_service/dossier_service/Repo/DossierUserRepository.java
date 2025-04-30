package com.example.PORTAIL_RH.user_service.dossier_service.Repo;

import com.example.PORTAIL_RH.user_service.dossier_service.Entity.DossierUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DossierUserRepository extends JpaRepository<DossierUser, Long> {
}