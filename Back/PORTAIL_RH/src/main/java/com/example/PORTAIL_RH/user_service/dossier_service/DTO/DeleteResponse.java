package com.example.PORTAIL_RH.user_service.dossier_service.DTO;

public class DeleteResponse {
    private String message;

    public DeleteResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}