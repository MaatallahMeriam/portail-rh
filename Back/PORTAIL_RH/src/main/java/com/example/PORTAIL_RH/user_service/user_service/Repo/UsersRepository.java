package com.example.PORTAIL_RH.user_service.user_service.Repo;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByMail(String mail);
    List<Users> findAllByActiveTrue();
    List<Users> findAllByActiveFalse();
    List<Users> findAllByActiveTrueAndEquipeIsNull();

    List<Users> findByRole(Users.Role targetRole);

    List<Users> findAllByRoleNot(Users.Role role);
}