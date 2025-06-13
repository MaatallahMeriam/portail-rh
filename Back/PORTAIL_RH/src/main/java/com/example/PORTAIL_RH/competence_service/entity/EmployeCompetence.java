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


    @Column(nullable = false)
    private String niveau;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeCompetenceId implements java.io.Serializable {
        private Long employeId;

        @Column(name = "competence_nom", nullable = false)
        private String competenceNom;
    }
}