package com.example.PORTAIL_RH.user_service.equipe_service.Entity;

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
@Table(name = "equipe")
public class Equipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    @Column(nullable = false)
    private String departement;

    @OneToMany(mappedBy = "equipe", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Users> users = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "manager_id", referencedColumnName = "id")
    private Users manager;

    public void setManager(Users manager) {
        if (this.manager != null) {
            this.manager.getEquipesGerees().remove(this);
        }
        this.manager = manager;
        if (manager != null && !manager.getEquipesGerees().contains(this)) {
            manager.getEquipesGerees().add(this);
        }
    }
}
