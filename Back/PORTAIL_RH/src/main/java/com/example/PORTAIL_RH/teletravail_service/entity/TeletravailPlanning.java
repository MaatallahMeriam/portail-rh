package com.example.PORTAIL_RH.teletravail_service.entity;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import jakarta.persistence.*;
import lombok.*;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "teletravail_plannings")
public class TeletravailPlanning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public enum Politique {
        CHOIX_LIBRE, SEUIL_LIBRE, PLANNING_FIXE,PLANNING_FIXE_JOURS_LIBRES
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Politique politique;

    @Column(name = "nombre_jours_max", nullable = true)
    private Integer nombreJoursMax;

    @Column(nullable = false)
    @Convert(converter = YearMonthStringConverter.class)
    private YearMonth mois;

    @ElementCollection
    @CollectionTable(name = "teletravail_jours_fixes", joinColumns = @JoinColumn(name = "planning_id"))
    @Column(name = "jour")
    private List<String> joursFixes = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "rh_id", nullable = false)
    private Users rh;

    @OneToMany(mappedBy = "planning", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserTeletravail> userTeletravails = new ArrayList<>();

    // Convertisseur pour YearMonth
    @Converter
    public static class YearMonthStringConverter implements AttributeConverter<YearMonth, String> {
        @Override
        public String convertToDatabaseColumn(YearMonth yearMonth) {
            return yearMonth != null ? yearMonth.toString() : null;
        }

        @Override
        public YearMonth convertToEntityAttribute(String dbData) {
            return dbData != null ? YearMonth.parse(dbData) : null;
        }
    }
}