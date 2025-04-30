package com.example.PORTAIL_RH.user_service.user_service.Service.IMPL;

import com.example.PORTAIL_RH.KPI_service.Service.KpiService;
import com.example.PORTAIL_RH.user_service.conges_service.DTO.UserCongesDTO;
import com.example.PORTAIL_RH.user_service.conges_service.Service.UserCongesService;
import com.example.PORTAIL_RH.user_service.user_service.DTO.UsersDTO;
import com.example.PORTAIL_RH.user_service.equipe_service.Entity.Equipe;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.dossier_service.Entity.DossierUser;
import com.example.PORTAIL_RH.user_service.dossier_service.DTO.ResponseDossier;
import com.example.PORTAIL_RH.user_service.equipe_service.Repo.EquipeRepository;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.user_service.dossier_service.Repo.DossierUserRepository;
import com.example.PORTAIL_RH.user_service.user_service.Service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UsersServiceImpl implements UsersService {
    private static final String UPLOAD_DIR = "uploads/profile_photos/";

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private DossierUserRepository dossierUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserCongesService userCongesService;

    @Autowired
    private KpiService kpiService;

    @Override
    public UsersDTO mapToDTO(Users user) {
        UsersDTO dto = new UsersDTO();
        dto.setId(user.getId());
        dto.setUserName(user.getUserName());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setMail(user.getMail());

        // Format the dateNaissance as DD/MM/YYYY
        if (user.getDateNaissance() != null) {
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
            dto.setDateNaissance(dateFormat.format(user.getDateNaissance()));
        } else {
            dto.setDateNaissance(null);
        }

        dto.setAge(user.getAge());
        dto.setPoste(user.getPoste());
        dto.setDepartement(user.getDepartement());
        // Construct the full URL for the image
        String imageUrl = user.getImage() != null
                ? ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/" + user.getImage().replace("\\", "/"))
                .toUriString()
                : null;
        dto.setImage(imageUrl);
        dto.setRole(user.getRole());
        dto.setNumero(user.getNumero()); // Map the new phone number field
        dto.setEquipeId(user.getEquipe() != null ? user.getEquipe().getId() : null);
        dto.setDossierId(user.getDossier() != null ? user.getDossier().getId() : null);
        dto.setActive(user.isActive());
        return dto;
    }

    @Override
    public UsersDTO updateProfilePhoto(Long userId, MultipartFile image) throws Exception {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (image != null && !image.isEmpty()) {
            // Generate a unique file name
            String uniqueFileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFileName);

            // Create the directory if it doesn't exist
            Files.createDirectories(filePath.getParent());

            // Save the image file
            Files.write(filePath, image.getBytes());

            // Update the user's profile photo
            user.updateProfilePhoto(filePath.toString());
        }

        // Save the updated user
        Users updatedUser = usersRepository.save(user);
        return mapToDTO(updatedUser);
    }

    private Users mapToEntity(UsersDTO userDTO, Users user) {
        user.setUserName(userDTO.getUserName());
        user.setNom(userDTO.getNom());
        user.setPrenom(userDTO.getPrenom());
        user.setMail(userDTO.getMail());
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        // Parse the dateNaissance string back to Date
        if (userDTO.getDateNaissance() != null) {
            try {
                SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
                user.setDateNaissance(dateFormat.parse(userDTO.getDateNaissance()));
            } catch (Exception e) {
                throw new RuntimeException("Invalid date format for dateNaissance. Expected format: dd/MM/yyyy");
            }
        } else {
            user.setDateNaissance(null);
        }
        user.setPoste(userDTO.getPoste());
        user.setNumero(userDTO.getNumero()); // Map the new phone number field
        user.setDepartement(userDTO.getDepartement());
        user.setImage(userDTO.getImage());
        user.setRole(userDTO.getRole());
        user.setActive(userDTO.isActive());
        if (userDTO.getEquipeId() != null) {
            Equipe equipe = equipeRepository.findById(userDTO.getEquipeId())
                    .orElseThrow(() -> new RuntimeException("Equipe not found"));
            user.setEquipe(equipe);
        } else {
            user.setEquipe(null);
        }
        return user;
    }

    @Override
    public UsersDTO getUserById(Long id) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDTO(user);
    }

    @Override
    public UsersDTO createUser(UsersDTO userDTO) {
        Users user = new Users();
        user.setActive(true);
        mapToEntity(userDTO, user);
        DossierUser dossier = new DossierUser();
        user.setDossier(dossier);
        Users savedUser = usersRepository.save(user);
        return mapToDTO(savedUser);
    }

    @Override
    public List<UsersDTO> getAllUsers() {
        return usersRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UsersDTO> getAllActiveUsers() {
        return usersRepository.findAllByActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UsersDTO> getAllActiveUsersWithNoEquipe() {
        return usersRepository.findAllByActiveTrueAndEquipeIsNull().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UsersDTO> getAllDeactivatedUsers() {
        return usersRepository.findAllByActiveFalse().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UsersDTO updateUser(Long id, UsersDTO userDTO) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        mapToEntity(userDTO, user);
        Users updatedUser = usersRepository.save(user);
        return mapToDTO(updatedUser);
    }

    @Override
    public UsersDTO deactivateUser(Long id) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        Users updatedUser = usersRepository.save(user);
        return mapToDTO(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getEquipesGerees() != null) {
            List<Equipe> equipesCopy = new ArrayList<>(user.getEquipesGerees());
            equipesCopy.forEach(equipe -> {
                equipe.setManager(null);
                equipeRepository.save(equipe);
            });
            user.getEquipesGerees().clear();
        }

        if (user.getPublications() != null) user.getPublications().clear();
        if (user.getReactions() != null) user.getReactions().clear();
        if (user.getDemandes() != null) user.getDemandes().clear();
        if (user.getCongesList() != null) user.getCongesList().clear();

        if (user.getEquipe() != null) {
            user.setEquipe(null);
        }

        usersRepository.delete(user);
    }

    @Override
    public DossierUser getDossierByUserId(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getDossier();
    }
    @Override
    public UsersDTO activateUser(Long id) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.isActive()) {
            throw new RuntimeException("User is already active");
        }
        user.setActive(true);
        Users updatedUser = usersRepository.save(user);
        return mapToDTO(updatedUser);
    }
    @Override
    public DossierUser updateDossierByUserId(Long userId, DossierUser updatedDossier) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        DossierUser dossier = user.getDossier();
        if (dossier == null) {
            dossier = new DossierUser();
            user.setDossier(dossier);
        }
        dossier.setCv(updatedDossier.getCv());
        dossier.setContrat(updatedDossier.getContrat());
        dossier.setDiplome(updatedDossier.getDiplome());
        usersRepository.save(user);
        return dossier;
    }

    @Override
    public Users getUserEntityById(Long id) {
        return usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public void deleteDossierByUserId(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setDossier(null);
        usersRepository.save(user);
    }

    @Override
    public ResponseDossier uploadFilesForUser(Long userId, MultipartFile cv, MultipartFile contrat, MultipartFile diplome) throws Exception {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DossierUser dossier = user.getDossier();
        if (dossier == null) {
            dossier = new DossierUser();
            user.setDossier(dossier);
        }

        if (cv != null && !cv.isEmpty()) dossier.setCv(cv.getBytes());
        if (contrat != null && !contrat.isEmpty()) dossier.setContrat(contrat.getBytes());
        if (diplome != null && !diplome.isEmpty()) dossier.setDiplome(diplome.getBytes());

        usersRepository.save(user);

        String cvUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/dossier/download/" + dossier.getId() + "/cv")
                .toUriString();
        String contratUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/dossier/download/" + dossier.getId() + "/contrat")
                .toUriString();
        String diplomeUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/dossier/download/" + dossier.getId() + "/diplome")
                .toUriString();

        return new ResponseDossier(cvUrl, contratUrl, diplomeUrl);
    }

    @Override
    public List<UserCongesDTO> getUserConges(Long userId) {
        return userCongesService.getUserCongesByUserId(userId);
    }
}