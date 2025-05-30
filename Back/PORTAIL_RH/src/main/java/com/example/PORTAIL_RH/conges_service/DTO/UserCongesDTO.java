package com.example.PORTAIL_RH.conges_service.DTO;

import com.example.PORTAIL_RH.conges_service.Entity.CongeType;
import com.example.PORTAIL_RH.conges_service.Entity.CongeType.TypeConge;
import com.example.PORTAIL_RH.conges_service.Entity.Periodicite;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

@Data
public class UserCongesDTO {
    private Long id;
    private Long userId;
    private Long congeTypeId;
    private int soldeActuel;
    private TypeConge type;
    private boolean isGlobal;
    private String nom;
    private CongeType.Unite unite ;
    private String abreviation;
    private Periodicite periodicite; // For CongeRenouvelable and CongeIncrementale
    private int pasIncrementale; // For CongeIncrementale


    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") // Fixed: Removed trailing space
    private Date validite;


    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Date lastUpdated;

    public CongeType.Unite getUnite() {
        return this.unite;
    }
}