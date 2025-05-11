package com.example.PORTAIL_RH.teletravail_service.entity;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "teletravail_pointage")
public class TeletravailPointage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonManagedReference
    private Users user;

    @ManyToOne
    @JoinColumn(name = "user_teletravail_id", nullable = false)
    @JsonManagedReference
    private UserTeletravail userTeletravail;

    @Column(name = "pointage_date", nullable = false)
    private LocalDate pointageDate;

    @Column(name = "pointage_time", nullable = false)
    private LocalTime pointageTime;
}