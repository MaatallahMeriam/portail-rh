package com.example.PORTAIL_RH.auth_service.Service;


import com.example.PORTAIL_RH.auth_service.DTO.RegisterRequest;
import com.example.PORTAIL_RH.auth_service.DTO.RegisterResponse;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {
    Users findByMail(String mail);
    RegisterResponse register(RegisterRequest registerRequest);

}