package com.example.PORTAIL_RH.conges_service.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(name = "conge_renouvelable")
public class CongeRenouvelable extends CongeType {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Periodicite periodicite;

    @Column(nullable = false)
    private int originalSoldeInitial;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date lastUpdated;

    @PostPersist
    @PostUpdate
    public void initOriginalSoldeInitial() {
        if (originalSoldeInitial == 0) {
            originalSoldeInitial = getSoldeInitial();
        }
    }
}