package com.example.PORTAIL_RH.teletravail_service.entity;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_teletravail")
public class UserTeletravail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "planning_id", nullable = false)
    private TeletravailPlanning planning;

    @ElementCollection
    @CollectionTable(name = "user_teletravail_jours", joinColumns = @JoinColumn(name = "user_teletravail_id"))
    @Column(name = "jour")
    private List<String> joursChoisis = new ArrayList<>(); // Format: "2025-05-01"
}