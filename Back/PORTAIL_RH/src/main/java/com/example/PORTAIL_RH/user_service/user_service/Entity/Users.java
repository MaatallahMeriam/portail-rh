package com.example.PORTAIL_RH.user_service.user_service.Entity;

import com.example.PORTAIL_RH.user_service.conges_service.Entity.UserConges;
import com.example.PORTAIL_RH.request_service.Entity.Demande;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Comment;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Reaction;
import com.example.PORTAIL_RH.user_service.dossier_service.Entity.DossierUser;
import com.example.PORTAIL_RH.user_service.equipe_service.Entity.Equipe;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public enum Role {
        RH, ADMIN, MANAGER, COLLAB
    }

    private String userName;
    private String nom;
    private String prenom;
    private String mail;
    private String password;
    private Date dateNaissance;
    private String poste;
    private String departement;
    private String image;
    private String numero; // Phone number field
    private String adresse; // New address field

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private boolean active = true;

    @Enumerated(EnumType.STRING)
    private Role role;

    @ManyToOne
    @JoinColumn(name = "equipe_id")
    private Equipe equipe;

    @OneToMany(mappedBy = "manager")
    private List<Equipe> equipesGerees = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<UserConges> congesList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Demande> demandes = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Publication> publications = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reaction> reactions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "dossier_id", referencedColumnName = "id")
    private DossierUser dossier;

    public int getAge() {
        if (dateNaissance == null) return 0;
        LocalDate birthDate = dateNaissance.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
        LocalDate currentDate = LocalDate.now();
        return Period.between(birthDate, currentDate).getYears();
    }

    public void setDossier(DossierUser dossier) {
        this.dossier = dossier;
        if (dossier != null) {
            dossier.setUser(this);
        }
    }

    public void updateProfilePhoto(String imagePath) {
        this.image = imagePath;
    }

    public void addEquipeGeree(Equipe equipe) {
        equipesGerees.add(equipe);
        equipe.setManager(this);
    }

    public void removeEquipeGeree(Equipe equipe) {
        equipesGerees.remove(equipe);
        equipe.setManager(null);
    }

    public void addDemande(Demande demande) {
        demandes.add(demande);
        demande.setUser(this);
    }

    public void removeDemande(Demande demande) {
        demandes.remove(demande);
        demande.setUser(null);
    }

    public void addPublication(Publication publication) {
        publications.add(publication);
        publication.setUser(this);
    }

    public void removePublication(Publication publication) {
        publications.remove(publication);
        publication.setUser(null);
    }

    public void addReaction(Reaction reaction) {
        reactions.add(reaction);
        reaction.setUser(this);
    }

    public void removeReaction(Reaction reaction) {
        reactions.remove(reaction);
        reaction.setUser(null);
    }

    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setUser(this);
    }

    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setUser(null);
    }
}