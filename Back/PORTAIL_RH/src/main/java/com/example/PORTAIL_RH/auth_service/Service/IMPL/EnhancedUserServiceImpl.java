package com.example.PORTAIL_RH.auth_service.Service.IMPL;

import com.example.PORTAIL_RH.auth_service.DTO.NewRegisterRequest;
import com.example.PORTAIL_RH.auth_service.DTO.RegisterResponse;
import com.example.PORTAIL_RH.auth_service.Service.EnhancedUserService;
import com.example.PORTAIL_RH.conges_service.Entity.CongeType;
import com.example.PORTAIL_RH.conges_service.Entity.UserConges;
import com.example.PORTAIL_RH.conges_service.Repo.CongeTypeRepository;
import com.example.PORTAIL_RH.user_service.dossier_service.Entity.DossierUser;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.utils.EnhancedEmailService;
import com.example.PORTAIL_RH.utils.PasswordGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Service
public class EnhancedUserServiceImpl implements EnhancedUserService {

    @Autowired
    private UsersRepository usersRepository;
    @Autowired
    private PasswordGenerator passwordGenerator;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CongeTypeRepository congeTypeRepository;

    @Autowired
    private EnhancedEmailService emailService;

    @Override
    public Users findByMail(String mail) {
        return usersRepository.findByMail(mail).orElse(null);
    }

    @Override
    public UserDetails loadUserByUsername(String mail) {
        Users user = findByMail(mail);
        if (user == null) {
            throw new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found with mail: " + mail);
        }
        return new org.springframework.security.core.userdetails.User(
                user.getMail(),
                user.getPassword(),
                java.util.Collections.singletonList(
                        new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                )
        );
    }

    @Override
    public RegisterResponse register(NewRegisterRequest registerRequest) {
        // Validation des champs requis
        if (registerRequest.getMail() == null || registerRequest.getMail().isEmpty()) {
            throw new IllegalArgumentException("L'email est requis");
        }
        if (registerRequest.getUserName() == null || registerRequest.getUserName().isEmpty()) {
            throw new IllegalArgumentException("Le nom d'utilisateur est requis");
        }
        if (usersRepository.findByMail(registerRequest.getMail()).isPresent()) {
            throw new IllegalArgumentException("Cet email est déjà utilisé");
        }

        Users user = new Users();
        user.setUserName(registerRequest.getUserName());
        user.setNom(registerRequest.getNom() != null ? registerRequest.getNom() : "");
        user.setPrenom(registerRequest.getPrenom() != null ? registerRequest.getPrenom() : "");
        user.setMail(registerRequest.getMail());

        // Générer un mot de passe si aucun n'est fourni
        String password = registerRequest.getPassword();
        if (password == null || password.isEmpty()) {
            password = passwordGenerator.generateRandomPassword();
            if (!emailService.sendPasswordEmail(user.getMail(), user.getUserName(), password)) {
                throw new RuntimeException("L'envoi de l'e-mail a échoué. Veuillez réessayer plus tard.");
            }
        }
        user.setPassword(passwordEncoder.encode(password));

        user.setPoste(registerRequest.getPoste() != null ? registerRequest.getPoste() : "");
        user.setDepartement(registerRequest.getDepartement() != null ? registerRequest.getDepartement() : "");
        user.setActive(true);

        if (registerRequest.getDateNaissance() != null && !registerRequest.getDateNaissance().isEmpty()) {
            try {
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                Date dateNaissance = dateFormat.parse(registerRequest.getDateNaissance());
                user.setDateNaissance(dateNaissance);
            } catch (ParseException e) {
                throw new IllegalArgumentException("Format de date invalide (attendu : yyyy-MM-dd)");
            }
        }

        if (registerRequest.getRole() == null || registerRequest.getRole().isEmpty()) {
            throw new IllegalArgumentException("Le rôle est requis");
        }
        try {
            user.setRole(Users.Role.valueOf(registerRequest.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Rôle invalide. Les valeurs autorisées sont : RH, ADMIN, MANAGER, COLLAB");
        }

        DossierUser dossier = new DossierUser();
        user.setDossier(dossier);

        user = usersRepository.save(user);

        initializeUserConges(user);

        RegisterResponse response = new RegisterResponse();
        response.setId(user.getId());
        response.setUserName(user.getUserName());
        response.setMail(user.getMail());
        response.setRole(user.getRole().toString());
        response.setMessage("Utilisateur créé avec succès");

        return response;
    }

    private void initializeUserConges(Users user) {
        List<CongeType> congeTypes = congeTypeRepository.findByIsGlobalTrue();
        for (CongeType congeType : congeTypes) {
            UserConges userConges = new UserConges();
            userConges.setUser(user);
            userConges.setCongeType(congeType);
            userConges.setSoldeActuel(congeType.getSoldeInitial());
            user.getCongesList().add(userConges);
        }
        usersRepository.save(user);
    }
}