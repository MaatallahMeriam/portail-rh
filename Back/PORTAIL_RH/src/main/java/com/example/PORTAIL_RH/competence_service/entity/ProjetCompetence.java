package com.example.PORTAIL_RH.competence_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "projet_competences")
public class ProjetCompetence {

    @EmbeddedId
    private ProjetCompetenceId id;

    @ManyToOne
    @MapsId("projetId")
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @Column(nullable = false)
    private String niveauRequis;


    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjetCompetenceId implements java.io.Serializable {
        private Long projetId;

        @Column(name = "competence_nom", nullable = false)
        private String competenceNom;
    }
}