package com.example.PORTAIL_RH.competence_service.entity;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "employe_competences")
public class EmployeCompetence {

    @EmbeddedId
    private EmployeCompetenceId id;

    @ManyToOne
    @MapsId("employeId")
    @JoinColumn(name = "employe_id")
    private Users employe;

    // Ne pas remapper competenceNom ici, car il est déjà dans la clé composite
    // La valeur sera accessible via id.competenceNom

    @Column(nullable = false)
    private String niveau; // Débutant, Intermédiaire, Expert

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeCompetenceId implements java.io.Serializable {
        private Long employeId;

        @Column(name = "competence_nom", nullable = false) // La colonne est mappée ici
        private String competenceNom; // Utiliser le nom de la compétence comme partie de la clé
    }
}