package com.example.PORTAIL_RH.auth_service.Controller;

import com.example.PORTAIL_RH.auth_service.DTO.AuthenticationRequest;
import com.example.PORTAIL_RH.auth_service.DTO.AuthenticationResponse;
import com.example.PORTAIL_RH.auth_service.DTO.RegisterRequest;
import com.example.PORTAIL_RH.auth_service.DTO.RegisterResponse;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.Security.JwtUtil;
import com.example.PORTAIL_RH.auth_service.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthenticationRequest authRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getMail(), authRequest.getPassword())
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Incorrect mail or password");
        }

        final Users user = userService.findByMail(authRequest.getMail());
        final String jwt = jwtUtil.generateToken(user);

        return ResponseEntity.ok(new AuthenticationResponse(jwt));
    }
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(userService.register(registerRequest));
    }
}