package com.example.PORTAIL_RH.document_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    private Long id;
    private String name;
    private String type;
    private String url;
    private String description;
    private String categorie;
}