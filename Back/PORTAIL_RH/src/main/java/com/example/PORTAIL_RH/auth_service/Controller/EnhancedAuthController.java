package com.example.PORTAIL_RH.auth_service.Controller;

import com.example.PORTAIL_RH.auth_service.DTO.NewRegisterRequest;
import com.example.PORTAIL_RH.auth_service.DTO.RegisterResponse;
import com.example.PORTAIL_RH.auth_service.Service.IMPL.EnhancedUserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class EnhancedAuthController {

    @Autowired
    private EnhancedUserServiceImpl enhancedUserService;

    @PostMapping("/register-new")
    public ResponseEntity<RegisterResponse> register(@RequestBody NewRegisterRequest registerRequest) {
        return ResponseEntity.ok(enhancedUserService.register(registerRequest));
    }
}