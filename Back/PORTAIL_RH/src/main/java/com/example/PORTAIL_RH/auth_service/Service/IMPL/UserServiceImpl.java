package com.example.PORTAIL_RH.auth_service.Service.IMPL;

import com.example.PORTAIL_RH.KPI_service.Service.KpiService;
import com.example.PORTAIL_RH.auth_service.DTO.RegisterRequest;
import com.example.PORTAIL_RH.auth_service.DTO.RegisterResponse;
import com.example.PORTAIL_RH.user_service.conges_service.Entity.CongeType;
import com.example.PORTAIL_RH.user_service.conges_service.Entity.UserConges;
import com.example.PORTAIL_RH.user_service.conges_service.Repo.CongeTypeRepository;
import com.example.PORTAIL_RH.user_service.dossier_service.Entity.DossierUser;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.auth_service.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CongeTypeRepository congeTypeRepository;

    @Autowired
    private KpiService kpiService;

    @Override
    public UserDetails loadUserByUsername(String mail) throws UsernameNotFoundException {
        Users user = findByMail(mail);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with mail: " + mail);
        }
        return new User(user.getMail(), user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
    }

    @Override
    public Users findByMail(String mail) {
        return usersRepository.findByMail(mail).orElse(null);
    }

    @Override
    public RegisterResponse register(RegisterRequest registerRequest) {
        if (registerRequest.getMail() == null || registerRequest.getMail().isEmpty()) {
            throw new IllegalArgumentException("L'email est requis");
        }
        if (registerRequest.getPassword() == null || registerRequest.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Le mot de passe est requis");
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
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
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