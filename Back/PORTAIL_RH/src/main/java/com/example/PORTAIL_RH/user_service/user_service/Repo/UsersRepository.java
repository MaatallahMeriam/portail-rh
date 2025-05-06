package com.example.PORTAIL_RH.user_service.user_service.Repo;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByMail(String mail);
    List<Users> findAllByActiveTrue();
    List<Users> findAllByActiveFalse();
    List<Users> findAllByActiveTrueAndEquipeIsNull();

    List<Users> findByRole(Users.Role targetRole);

    List<Users> findAllByRoleNot(Users.Role role);

    @Query("SELECT u FROM Users u LEFT JOIN FETCH u.congesList LEFT JOIN FETCH u.comments LEFT JOIN FETCH u.reactions LEFT JOIN FETCH u.ratings LEFT JOIN FETCH u.publications LEFT JOIN FETCH u.demandes LEFT JOIN FETCH u.dossier LEFT JOIN FETCH u.equipesGerees LEFT JOIN FETCH u.userTeletravail WHERE u.id = :id")
    Optional<Users> findByIdWithRelations(@Param("id") Long id);
}