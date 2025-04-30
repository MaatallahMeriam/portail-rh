package com.example.PORTAIL_RH.request_service.Entity;

import jakarta.persistence.*;
import lombok.*;

@Setter
@Getter
@Entity
@Table(name = "dmd_doc")
@PrimaryKeyJoinColumn(name = "demande_id")
public class Dmd_Doc extends Demande {

    private String raison_dmd;
    private String type_document;
    private Integer nombre_copies;
}