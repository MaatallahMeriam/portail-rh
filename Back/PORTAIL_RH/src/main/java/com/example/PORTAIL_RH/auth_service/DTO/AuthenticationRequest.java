package com.example.PORTAIL_RH.auth_service.DTO;

public class AuthenticationRequest {
    private String mail;
    private String password;

    // Getters, Setters, Constructors
    public AuthenticationRequest() {}
    public AuthenticationRequest(String mail, String password) {
        this.mail = mail;
        this.password = password;
    }
    public String getMail() { return mail; }
    public void setMail(String mail) { this.mail = mail; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}