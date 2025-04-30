package com.example.PORTAIL_RH.request_service.Entity;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "demande")
@Inheritance(strategy = InheritanceType.JOINED)
public class Demande {
    public enum DemandeType {
        CONGES, LOGISTIQUE, DOCUMENT
    }
    public enum StatutType {
        EN_ATTENTE, VALIDEE, REFUSEE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DemandeType type;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatutType statut;

    @Column(name = "date_emis", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateEmission = new Date();

    @Column(name = "date_valid")
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateValidation; // Null jusqu'à validation
}