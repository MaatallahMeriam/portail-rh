package com.example.PORTAIL_RH.user_service.user_service.Service.IMPL;
import com.example.PORTAIL_RH.notification_service.Repo.PointageNotificationRepository;
import com.example.PORTAIL_RH.KPI_service.Service.KpiService;
import com.example.PORTAIL_RH.notification_service.Repo.NotificationRepository; // Add this import
import com.example.PORTAIL_RH.request_service.Entity.Demande;
import com.example.PORTAIL_RH.request_service.Entity.Dmd_Conges;
import com.example.PORTAIL_RH.user_service.conges_service.DTO.UserCongesDTO;
import com.example.PORTAIL_RH.user_service.conges_service.Entity.CongeType;
import com.example.PORTAIL_RH.user_service.conges_service.Entity.UserConges;
import com.example.PORTAIL_RH.user_service.conges_service.Repo.UserCongesRepository;
import com.example.PORTAIL_RH.user_service.conges_service.Service.UserCongesService;
import com.example.PORTAIL_RH.user_service.user_service.DTO.BirthdayWishDTO;
import com.example.PORTAIL_RH.user_service.user_service.DTO.UsersDTO;
import com.example.PORTAIL_RH.user_service.equipe_service.Entity.Equipe;
import com.example.PORTAIL_RH.user_service.user_service.Entity.BirthdayWish;
import com.example.PORTAIL_RH.user_service.user_service.Entity.UserUpdateBasicDTO;
import com.example.PORTAIL_RH.user_service.user_service.Entity.UserUpdateFullDTO;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.dossier_service.Entity.DossierUser;
import com.example.PORTAIL_RH.user_service.dossier_service.DTO.ResponseDossier;
import com.example.PORTAIL_RH.user_service.equipe_service.Repo.EquipeRepository;
import com.example.PORTAIL_RH.user_service.user_service.Repo.BirthdayWishRepository;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.user_service.dossier_service.Repo.DossierUserRepository;
import com.example.PORTAIL_RH.feed_service.pub_service.Repo.PublicationRepository;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Repo.CommentRepository;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Repo.ReactionRepository;
import com.example.PORTAIL_RH.feed_service.Reaction_service.Repo.IdeaRatingRepository;
import com.example.PORTAIL_RH.request_service.Repo.DemandeRepository;
import com.example.PORTAIL_RH.user_service.user_service.Service.UsersService;
import com.opencsv.CSVWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.StringWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UsersServiceImpl implements UsersService {
    private static final String UPLOAD_DIR = "Uploads/profile_photos/";
    private static final String WISH_UPLOAD_DIR = "Uploads/birthday_wishes/";

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PointageNotificationRepository pointageNotificationRepository;

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private DossierUserRepository dossierUserRepository;

    @Autowired
    private PublicationRepository publicationRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private IdeaRatingRepository ideaRatingRepository;

    @Autowired
    private DemandeRepository demandeRepository;

    @Autowired
    private UserCongesRepository userCongesRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserCongesService userCongesService;

    @Autowired
    private KpiService kpiService;

    @Autowired
    private BirthdayWishRepository birthdayWishRepository;


    @Override
    public UsersDTO updateUserFullInfo(Long id, UserUpdateFullDTO dto) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Champs communs
        if (dto.getUserName() != null) user.setUserName(dto.getUserName());
        if (dto.getNom() != null) user.setNom(dto.getNom());
        if (dto.getPrenom() != null) user.setPrenom(dto.getPrenom());
        if (dto.getAdresse() != null) user.setAdresse(dto.getAdresse());

        if (dto.getMail() != null) user.setMail(dto.getMail());
        if (dto.getNumero() != null) user.setNumero(dto.getNumero());
        if (dto.getDateNaissance() != null) {
            try {
                SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
                user.setDateNaissance(dateFormat.parse(dto.getDateNaissance()));
            } catch (Exception e) {
                throw new RuntimeException("Invalid date format for dateNaissance. Expected format: dd/MM/yyyy");
            }
        }

        // Champs supplémentaires
        if (dto.getPoste() != null) user.setPoste(dto.getPoste());
        if (dto.getDepartement() != null) user.setDepartement(dto.getDepartement());
        if (dto.getRole() != null) user.setRole(Users.Role.valueOf(dto.getRole()));

        Users updatedUser = usersRepository.save(user);
        return mapToDTO(updatedUser);
    }
    @Override
    public UsersDTO deleteProfilePhoto(Long userId) throws Exception {
        // Récupérer l'utilisateur
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Supprimer le fichier de la photo du système de fichiers (si nécessaire)
        if (user.getImage() != null && !user.getImage().isEmpty()) {
            Path filePath = Paths.get(user.getImage());
            try {
                Files.deleteIfExists(filePath);
            } catch (Exception e) {
                throw new RuntimeException("Failed to delete profile photo file: " + e.getMessage());
            }
        }

        // Mettre le champ image à null
        user.setImage(null);

        // Sauvegarder l'utilisateur mis à jour
        Users updatedUser = usersRepository.save(user);

        // Retourner le DTO mis à jour
        return mapToDTO(updatedUser);
    }
    @Override
    public boolean updatePassword(Long userId, String oldPassword, String newPassword) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("L'ancien mot de passe est incorrect.");
        }

        // Valider le nouveau mot de passe (exemple : minimum 8 caractères)
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Le nouveau mot de passe doit contenir au moins 8 caractères.");
        }

        // Encoder et mettre à jour le nouveau mot de passe
        user.setPassword(passwordEncoder.encode(newPassword));
        usersRepository.save(user);

        return true;
    }
    @Override
    public UsersDTO updateUserBasicInfo(Long id, UserUpdateBasicDTO dto) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getUserName() != null) user.setUserName(dto.getUserName());
        if (dto.getNom() != null) user.setNom(dto.getNom());
        if (dto.getPrenom() != null) user.setPrenom(dto.getPrenom());
        if (dto.getMail() != null) user.setMail(dto.getMail());
        if (dto.getNumero() != null) user.setNumero(dto.getNumero());
        if (dto.getAdresse() != null) user.setAdresse(dto.getAdresse());


        if (dto.getDateNaissance() != null) {
            try {
                SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
                user.setDateNaissance(dateFormat.parse(dto.getDateNaissance()));
            } catch (Exception e) {
                throw new RuntimeException("Invalid date format for dateNaissance. Expected format: dd/MM/yyyy");
            }
        }

        Users updatedUser = usersRepository.save(user);
        return mapToDTO(updatedUser);
    }




    @Override
    public UsersDTO mapToDTO(Users user) {
        UsersDTO dto = new UsersDTO();
        dto.setId(user.getId());
        dto.setUserName(user.getUserName());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setMail(user.getMail());

        if (user.getDateNaissance() != null) {
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
            dto.setDateNaissance(dateFormat.format(user.getDateNaissance()));
        } else {
            dto.setDateNaissance(null);
        }

        dto.setAge(user.getAge());
        dto.setPoste(user.getPoste());
        dto.setDepartement(user.getDepartement());
        String imageUrl = user.getImage() != null
                ? ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/" + user.getImage().replace("\\", "/"))
                .toUriString()
                : null;
        dto.setImage(imageUrl);
        dto.setRole(user.getRole());
        dto.setNumero(user.getNumero());
        dto.setAdresse(user.getAdresse());
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
            String uniqueFileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, image.getBytes());
            user.updateProfilePhoto(filePath.toString());
        }

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
        user.setNumero(userDTO.getNumero());
        user.setAdresse(userDTO.getAdresse());
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
    public byte[] exportActiveUsersToCSV() {
        List<Users> activeUsers = usersRepository.findAllByActiveTrue();

        try (StringWriter stringWriter = new StringWriter();
             CSVWriter csvWriter = new CSVWriter(stringWriter, ';', CSVWriter.NO_QUOTE_CHARACTER, CSVWriter.DEFAULT_ESCAPE_CHARACTER, CSVWriter.DEFAULT_LINE_END)) {

            // Write CSV header
            String[] header = {"Nom", "Prenom", "Mail", "Numero", "Adresse", "Poste", "Departement", "Nom Equipe"};
            csvWriter.writeNext(header);

            // Write user data
            for (Users user : activeUsers) {
                String equipeName = user.getEquipe() != null ? user.getEquipe().getNom() : "";
                String[] data = {
                        user.getNom() != null ? user.getNom() : "",
                        user.getPrenom() != null ? user.getPrenom() : "",
                        user.getMail() != null ? user.getMail() : "",
                        user.getNumero() != null ? user.getNumero() : "",
                        user.getAdresse() != null ? user.getAdresse() : "",
                        user.getPoste() != null ? user.getPoste() : "",
                        user.getDepartement() != null ? user.getDepartement() : "",
                        equipeName
                };
                csvWriter.writeNext(data);
            }

            // Convert to byte array
            return stringWriter.toString().getBytes("UTF-8");
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV file: " + e.getMessage());
        }
    }

    @Override
    public byte[] exportUserCongesToCSV() {
        List<Users> activeUsers = usersRepository.findAllByActiveTrue();

        try (StringWriter stringWriter = new StringWriter();
             CSVWriter csvWriter = new CSVWriter(stringWriter, ';', CSVWriter.NO_QUOTE_CHARACTER, CSVWriter.DEFAULT_ESCAPE_CHARACTER, CSVWriter.DEFAULT_LINE_END)) {

            // Write CSV header
            String[] header = {"Nom", "Prenom", "Departement", "Poste", "Liste de Conges"};
            csvWriter.writeNext(header);

            // Write user data with their conges
            for (Users user : activeUsers) {
                List<UserConges> userCongesList = userCongesRepository.findByUserId(user.getId());
                String congesListString = userCongesList.stream()
                        .map(uc -> {
                            CongeType ct = uc.getCongeType();
                            return String.format("%s (Solde: %d, Validite: %s)",
                                    ct.getNom(),
                                    uc.getSoldeActuel(),
                                    ct.getValidite() != null ? new SimpleDateFormat("yyyy-MM-dd").format(ct.getValidite()) : "N/A");
                        })
                        .collect(Collectors.joining(" | "));

                String[] data = {
                        user.getNom() != null ? user.getNom() : "",
                        user.getPrenom() != null ? user.getPrenom() : "",
                        user.getDepartement() != null ? user.getDepartement() : "",
                        user.getPoste() != null ? user.getPoste() : "",
                        congesListString.isEmpty() ? "Aucun congé" : congesListString
                };
                csvWriter.writeNext(data);
            }

            // Convert to byte array
            return stringWriter.toString().getBytes("UTF-8");
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV file: " + e.getMessage());
        }
    }
    @Override
    @Transactional
    public void deleteUser(Long id) {
        Users user = usersRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Clear managed teams
        if (user.getEquipesGerees() != null && !user.getEquipesGerees().isEmpty()) {
            user.getEquipesGerees().forEach(equipe -> equipe.setManager(null));
            user.getEquipesGerees().clear();
        }

        // Handle Dmd_Conges with null userConges
        if (user.getDemandes() != null) {
            List<Demande> demandesToRemove = new ArrayList<>();
            for (Demande demande : user.getDemandes()) {
                if (demande instanceof Dmd_Conges conges && conges.getUserConges() == null) {
                    demandesToRemove.add(demande);
                }
            }
            user.getDemandes().removeAll(demandesToRemove);
            demandesToRemove.forEach(demande -> demandeRepository.delete(demande));
        }

        // Delete associated PointageNotification records
        pointageNotificationRepository.deleteByUser(user);

        // Delete associated Notification records
        notificationRepository.deleteByUser(user); // Delete where user is the recipient
        notificationRepository.deleteByTriggeredByUser(user); // Delete where user is the triggerer

        // Clear other collections
        if (user.getComments() != null) user.getComments().clear();
        if (user.getReactions() != null) user.getReactions().clear();
        if (user.getRatings() != null) user.getRatings().clear();
        if (user.getPublications() != null) user.getPublications().clear();
        if (user.getDemandes() != null) user.getDemandes().clear();
        if (user.getCongesList() != null) user.getCongesList().clear();
        if (user.getUserTeletravail() != null) user.getUserTeletravail().clear();
        if (user.getEquipe() != null) user.setEquipe(null);
        if (user.getDossier() != null) user.setDossier(null);

        // Delete the user
        usersRepository.delete(user);
    }


    @Override
    public boolean modifierPWD(Long userId, String newPassword) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Valider le nouveau mot de passe (exemple : minimum 8 caractères)
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Le nouveau mot de passe doit contenir au moins 8 caractères.");
        }

        // Encoder et mettre à jour le nouveau mot de passe
        user.setPassword(passwordEncoder.encode(newPassword));
        usersRepository.save(user);

        return true;
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
        if (user.isActive()) throw new RuntimeException("User is already active");
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

    @Override
    @Transactional
    public void sendBirthdayWish(Long recipientId, String message, String icon, MultipartFile image) throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String currentUserEmail = auth.getName();
        Users sender = usersRepository.findByMail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Expéditeur non trouvé"));

        Users recipient = usersRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Destinataire non trouvé"));

        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
        if (birthdayWishRepository.findBySenderAndRecipientAndCreatedAtBetween(sender, recipient, startOfDay, endOfDay).isPresent()) {
            throw new RuntimeException("Un souhait a déjà été envoyé aujourd'hui à cet utilisateur");
        }

        BirthdayWish wish = new BirthdayWish();
        wish.setSender(sender);
        wish.setRecipient(recipient);
        wish.setMessage(message);

        if (image != null && !image.isEmpty()) {
            String uniqueFileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(WISH_UPLOAD_DIR + uniqueFileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, image.getBytes());
        }

        birthdayWishRepository.save(wish);
    }

    @Override
    @Transactional
    public void clearOldWishes() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<BirthdayWish> oldWishes = birthdayWishRepository.findOldWishes(cutoffDate);
        birthdayWishRepository.deleteAll(oldWishes);
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void cleanupBirthdayWishes() {
        clearOldWishes();
    }

    @Override
    public List<BirthdayWishDTO> getBirthdayWishes(Long recipientId) {
        Users recipient = usersRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));
        List<BirthdayWish> wishes = birthdayWishRepository.findByRecipient(recipient);

        return wishes.stream().map(wish -> {
            BirthdayWishDTO dto = new BirthdayWishDTO();
            dto.setMessage(wish.getMessage());
            Users sender = wish.getSender();
            dto.setSenderNom(sender.getNom());
            dto.setSenderPrenom(sender.getPrenom());
            String senderPhotoUrl = sender.getImage() != null
                    ? ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/" + sender.getImage().replace("\\", "/"))
                    .toUriString()
                    : null;
            dto.setSenderPhotoUrl(senderPhotoUrl);
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public Set<Long> getWishedUserIdsToday(Long senderId) {
        Users sender = usersRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
        List<BirthdayWish> wishes = birthdayWishRepository.findBySenderAndCreatedAtBetween(sender, startOfDay, endOfDay);
        return wishes.stream()
                .map(wish -> wish.getRecipient().getId())
                .collect(Collectors.toSet());
    }
}