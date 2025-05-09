package com.example.PORTAIL_RH.auth_service.Service;

import com.example.PORTAIL_RH.auth_service.DTO.NewRegisterRequest;
import com.example.PORTAIL_RH.auth_service.DTO.RegisterResponse;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import org.springframework.security.core.userdetails.UserDetails;

public interface EnhancedUserService {
    Users findByMail(String mail);
    UserDetails loadUserByUsername(String mail);
    RegisterResponse register(NewRegisterRequest registerRequest);
}