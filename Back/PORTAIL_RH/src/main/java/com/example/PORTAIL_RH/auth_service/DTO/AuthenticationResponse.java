package com.example.PORTAIL_RH.auth_service.DTO;

public class AuthenticationResponse {
    private String token;

    // Getters, Setters, Constructors
    public AuthenticationResponse() {}
    public AuthenticationResponse(String token) {
        this.token = token;
    }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}