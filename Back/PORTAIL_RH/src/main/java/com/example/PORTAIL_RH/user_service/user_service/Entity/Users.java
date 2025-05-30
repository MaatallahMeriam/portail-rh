package com.example.PORTAIL_RH.user_service.user_service.Entity;

import com.example.PORTAIL_RH.teletravail_service.entity.UserTeletravail;
import com.example.PORTAIL_RH.conges_service.Entity.UserConges;
import com.example.PORTAIL_RH.request_service.Entity.Demande;
import com.example.PORTAIL_RH.feed_service.pub_service.Entity.Publication;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Comment;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.Reaction;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Entity.IdeaRating;
import com.example.PORTAIL_RH.user_service.dossier_service.Entity.DossierUser;
import com.example.PORTAIL_RH.equipe_service.Entity.Equipe;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.Period;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

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
    private Set<Equipe> equipesGerees = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private Set<UserConges> congesList = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Demande> demandes = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Publication> publications = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Reaction> reactions = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<IdeaRating> ratings = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private Set<UserTeletravail> userTeletravail = new HashSet<>();

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

    public void addIdeaRating(IdeaRating rating) {
        ratings.add(rating);
        rating.setUser(this);
    }

    public void removeIdeaRating(IdeaRating rating) {
        ratings.remove(rating);
        rating.setUser(null);
    }

    public void addUserTeletravail(UserTeletravail teletravail) {
        userTeletravail.add(teletravail);
        teletravail.setUser(this);
    }

    public void removeUserTeletravail(UserTeletravail teletravail) {
        userTeletravail.remove(teletravail);
        teletravail.setUser(null);
    }
}