package com.example.PORTAIL_RH.teletravail_service.service.impl;

import com.example.PORTAIL_RH.notification_service.Service.NotificationService;
import com.example.PORTAIL_RH.teletravail_service.dto.TeletravailPointageDTO;
import com.example.PORTAIL_RH.teletravail_service.entity.TeletravailPointage;
import com.example.PORTAIL_RH.teletravail_service.entity.UserTeletravail;
import com.example.PORTAIL_RH.user_service.equipe_service.Entity.Equipe;
import com.example.PORTAIL_RH.utils.EnhancedEmailService;
import com.example.PORTAIL_RH.teletravail_service.repo.TeletravailPointageRepository;
import com.example.PORTAIL_RH.teletravail_service.repo.UserTeletravailRepository;
import com.example.PORTAIL_RH.teletravail_service.service.TeletravailPointageService;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeletravailPointageServiceImpl implements TeletravailPointageService {

    private static final Logger logger = LoggerFactory.getLogger(TeletravailPointageServiceImpl.class);

    @Autowired
    private TeletravailPointageRepository pointageRepository;

    @Autowired
    private UserTeletravailRepository userTeletravailRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private EnhancedEmailService emailService;


    @Autowired
    private NotificationService notificationService;
    @Value("${app.qrcode.url}")
    private String qrCodeBaseUrl;

    @Value("${farid.app.jwtSecret}")
    private String jwtSecretBase64;

    private byte[] jwtSecret;

    @PostConstruct
    public void init() {
        this.jwtSecret = Base64.getDecoder().decode(jwtSecretBase64);
    }

    private String generatePointageToken(Long userId, LocalDate date) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("date", date.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    @Override
    public String generateQRCode(Long userId, LocalDate date) throws Exception {
        String token = generatePointageToken(userId, date);
        String qrCodeUrl = qrCodeBaseUrl + "?token=" + token;

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(qrCodeUrl, BarcodeFormat.QR_CODE, 200, 200);
        BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(qrImage, "png", baos);
        return Base64.getEncoder().encodeToString(baos.toByteArray());
    }

    private boolean sendQRCodeEmail(Users user, String qrCodeBase64, String token) {
        String confirmationUrl = qrCodeBaseUrl + "?token=" + token;
        return emailService.sendPointageEmail(user.getMail(), user.getPrenom() + " " + user.getNom(), qrCodeBase64, confirmationUrl);
    }

    @Scheduled(cron = "0 0 6 * * ?")
    @Transactional
    @Override
    public void generateAndSendQRCodes() throws Exception {
        LocalDate today = LocalDate.now();
        List<UserTeletravail> userTeletravails = userTeletravailRepository.findAll();
        for (UserTeletravail ut : userTeletravails) {
            if (ut.getJoursChoisis().contains(today.toString())) {
                Users user = ut.getUser();
                String qrCodeBase64 = generateQRCode(user.getId(), today);
                String token = generatePointageToken(user.getId(), today);
                sendQRCodeEmail(user, qrCodeBase64, token);
            }
        }
    }

    @Transactional
    @Override
    public void recordPointage(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .parseClaimsJws(token)
                    .getBody();
            Long userId = Long.parseLong(claims.getSubject());
            LocalDate date = LocalDate.parse(claims.get("date").toString());

            Users user = usersRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("Utilisateur non trouvé."));

            if (pointageRepository.existsByUserAndPointageDate(user, date)) {
                throw new IllegalStateException("Pointage déjà effectué aujourd’hui.");
            }

            UserTeletravail userTeletravail = userTeletravailRepository.findByUserIdAndJoursChoisisContaining(userId, date.toString())
                    .orElseThrow(() -> new IllegalStateException("Aujourd’hui n’est pas un jour de télétravail."));

            LocalTime now = LocalTime.now();
            TeletravailPointage pointage = new TeletravailPointage();
            pointage.setUser(user);
            pointage.setUserTeletravail(userTeletravail);
            pointage.setPointageDate(date);
            pointage.setPointageTime(now);
            pointageRepository.save(pointage);
            logger.info("Pointage enregistré pour userId={} à la date={}", userId, date);

            // Nouvelle logique : Notifier le manager
            notifyManagerOfPointage(user, date);
        } catch (Exception e) {
            logger.error("Erreur lors de l'enregistrement du pointage : {}", e.getMessage(), e);
            throw new IllegalStateException("Token invalide ou expiré : " + e.getMessage());
        }
    }

    private void notifyManagerOfPointage(Users user, LocalDate date) {
        try {
            // Récupérer l'équipe de l'utilisateur
            Equipe equipe = user.getEquipe();
            if (equipe != null) {
                Users manager = equipe.getManager();
                if (manager != null) {
                    String message = String.format("Votre membre %s %s a bien effectué son pointage TT le %s",
                            user.getPrenom(), user.getNom(), date.toString());
                    logger.info("Pointage notification for user: userId={}, prenom={}, nom={}, image={}",
                            user.getId(), user.getPrenom(), user.getNom(), user.getImage());
                    // Appeler le service de notification avec triggeredByUser
                    notificationService.createNotificationForUser(manager, message, "POINTAGE", null, user);
                    logger.info("Notification envoyée au manager {} pour le pointage de {}", manager.getId(), user.getId());
                } else {
                    logger.warn("Aucun manager assigné à l'équipe de l'utilisateur {}", user.getId());
                }
            } else {
                logger.warn("Aucune équipe assignée à l'utilisateur {}", user.getId());
            }
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de la notification au manager : {}", e.getMessage(), e);
        }
    }

    @Override
    public String getQRCodeForUser(Long userId, LocalDate date) throws Exception {
        UserTeletravail userTeletravail = userTeletravailRepository.findByUserIdAndJoursChoisisContaining(userId, date.toString())
                .orElse(null);
        if (userTeletravail != null) {
            return generateQRCode(userId, date);
        }
        return null;
    }

    @Override
    public List<TeletravailPointageDTO> getPointagesForPeriod(LocalDate start, LocalDate end, Long userId) {
        List<TeletravailPointage> pointages = pointageRepository.findByUserIdAndPointageDateBetween(userId, start, end);
        return pointages.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private TeletravailPointageDTO convertToDTO(TeletravailPointage pointage) {
        TeletravailPointageDTO dto = new TeletravailPointageDTO();
        dto.setId(pointage.getId());
        dto.setUserId(pointage.getUser().getId());
        dto.setUserTeletravailId(pointage.getUserTeletravail().getId());
        dto.setPointageDate(pointage.getPointageDate());
        dto.setPointageTime(pointage.getPointageTime());
        return dto;
    }

    @Override
    public boolean sendPointageEmail(Long userId, LocalDate date) throws Exception {
        UserTeletravail userTeletravail = userTeletravailRepository.findByUserIdAndJoursChoisisContaining(userId, date.toString())
                .orElse(null);
        if (userTeletravail == null) {
            return false;
        }
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Utilisateur non trouvé."));
        String qrCodeBase64 = generateQRCode(userId, date);
        String token = generatePointageToken(userId, date);
        return sendQRCodeEmail(user, qrCodeBase64, token);
    }
}