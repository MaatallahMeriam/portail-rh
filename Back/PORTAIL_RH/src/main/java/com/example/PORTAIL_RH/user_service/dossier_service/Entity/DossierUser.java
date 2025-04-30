package com.example.PORTAIL_RH.user_service.dossier_service.Entity;

import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dossier_user")
public class DossierUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    private byte[] cv;

    @Lob
    private byte[] contrat;

    @Lob
    private byte[] diplome;

    @OneToOne(mappedBy = "dossier")
    private Users user;
}