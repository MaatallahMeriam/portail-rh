package com.example.PORTAIL_RH.conges_service.Entity;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(name = "user_conges")
public class UserConges {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conge_type_id", nullable = false)
    private CongeType congeType;

    @Column(nullable = false)
    private int soldeActuel;

    // Optional: Track last update for synchronization with CongeType periodic updates
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "last_updated")
    private Date lastUpdated;

    @PrePersist
    public void prePersist() {
        if (lastUpdated == null) {
            lastUpdated = new Date();
        }
    }
}