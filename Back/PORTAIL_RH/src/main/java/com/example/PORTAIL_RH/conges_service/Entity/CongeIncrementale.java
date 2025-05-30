package com.example.PORTAIL_RH.conges_service.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(name = "conge_incrementale")
public class CongeIncrementale extends CongeType {

    @Column(nullable = false)
    private int pasIncrementale;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Periodicite periodicite;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date lastUpdated;
}