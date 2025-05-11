package com.example.PORTAIL_RH.notification_service.Entity;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pointage_notifications")
public class PointageNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(name = "pointage_date", nullable = false)
    private LocalDate pointageDate;

    @Column(name = "is_acknowledged", nullable = false)
    private boolean isAcknowledged = false; // Indique si l'utilisateur a vu ou traité la notification

    public void setIsAcknowledged(boolean b) {

    }
}