package com.example.PORTAIL_RH.conges_service.DTO;

import com.example.PORTAIL_RH.conges_service.Entity.CongeType;
import com.example.PORTAIL_RH.conges_service.Entity.CongeType.TypeConge;
import com.example.PORTAIL_RH.conges_service.Entity.CongeType.Unite;
import com.example.PORTAIL_RH.conges_service.Entity.Periodicite;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Date;

@Data
public class CongeTypeDTO {

    private Long id;
    private TypeConge type;
    private CongeType.Unite unite ;

    private int soldeInitial;
    private String nom;
    private String abreviation;
    @JsonProperty("isGlobal")
    private boolean isGlobal;

    private int pasIncrementale; // For CongeIncrementale
    private Periodicite periodicite; // For CongeIncrementale and CongeRenouvelable

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") // Fixed: Removed trailing space
    private Date validite;

    // Getters and Setters (keeping your existing ones)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TypeConge getType() {
        return type;
    }

    public void setType(TypeConge type) {
        this.type = type;
    }

    public Unite getUnite() {
        return unite;
    }

    public void setUnite(Unite unite) {
        this.unite = unite;
    }

    public int getSoldeInitial() {
        return soldeInitial;
    }

    public void setSoldeInitial(int soldeInitial) {
        this.soldeInitial = soldeInitial;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getAbreviation() {
        return abreviation;
    }

    public void setAbreviation(String abreviation) {
        this.abreviation = abreviation;
    }

    public boolean isGlobal() {
        return isGlobal;
    }

    public void setGlobal(boolean global) {
        isGlobal = global;
    }

    public int getPasIncrementale() {
        return pasIncrementale;
    }

    public void setPasIncrementale(int pasIncrementale) {
        this.pasIncrementale = pasIncrementale;
    }

    public Periodicite getPeriodicite() {
        return periodicite;
    }

    public void setPeriodicite(Periodicite periodicite) {
        this.periodicite = periodicite;
    }

    public Date getValidite() {
        return validite;
    }

    public void setValidite(Date validite) {
        this.validite = validite;
    }
}