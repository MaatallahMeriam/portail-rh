package com.example.PORTAIL_RH.user_service.dossier_service.DTO;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class ResponseDossier {
    private String cvDownloadUrl;
    private String contratDownloadUrl;
    private String diplomeDownloadUrl;

    public ResponseDossier(String cvDownloadUrl, String contratDownloadUrl, String diplomeDownloadUrl) {
        this.cvDownloadUrl = cvDownloadUrl;
        this.contratDownloadUrl = contratDownloadUrl;
        this.diplomeDownloadUrl = diplomeDownloadUrl;
    }
}