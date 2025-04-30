package com.example.PORTAIL_RH.document_service.dto;

public class DocumentUpdateRequest {
    private String name;
    private String description;
    private String url;
    private String categorie;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }
}