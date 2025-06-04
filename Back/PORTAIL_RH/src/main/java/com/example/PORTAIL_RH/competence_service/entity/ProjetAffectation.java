package com.example.PORTAIL_RH.competence_service.entity;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "projet_affectations")
public class ProjetAffectation {

    @EmbeddedId
    private ProjetAffectationId id;

    @ManyToOne
    @MapsId("projetId")
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @ManyToOne
    @MapsId("employeId")
    @JoinColumn(name = "employe_id")
    private Users employe;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjetAffectationId implements java.io.Serializable {
        private Long projetId;
        private Long employeId;
    }
}