package com.example.PORTAIL_RH.teletravail_service.service.impl;

import com.example.PORTAIL_RH.teletravail_service.entity.TeletravailPointage;
import com.example.PORTAIL_RH.teletravail_service.entity.UserTeletravail;
import com.example.PORTAIL_RH.teletravail_service.repo.TeletravailPointageRepository;
import com.example.PORTAIL_RH.teletravail_service.repo.UserTeletravailRepository;
import com.example.PORTAIL_RH.teletravail_service.service.TeletravailPointageService;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.utils.EnhancedEmailService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
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

@Service
public class TeletravailPointageServiceImpl implements TeletravailPointageService {

    @Autowired
    private TeletravailPointageRepository pointageRepository;

    @Autowired
    private UserTeletravailRepository userTeletravailRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private EnhancedEmailService emailService;

    @Value("${app.qrcode.url}")
    private String qrCodeBaseUrl; // Ex: http://localhost:8080/api/teletravail/pointage/confirm

    @Value("${farid.app.jwtSecret}")
    private String jwtSecretBase64;

    private byte[] jwtSecret;

    @PostConstruct
    public void init() {
        this.jwtSecret = Base64.getDecoder().decode(jwtSecretBase64);
    }

    // Générer un token JWT pour le pointage
    private String generatePointageToken(Long userId, LocalDate date) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("date", date.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000)) // 24h
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    // Générer une image QR code
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

    // Envoyer le QR code par email
    private boolean sendQRCodeEmail(Users user, String qrCodeBase64, String token) {
        String htmlContent = "<h3>Bonjour, " + user.getPrenom() + " " + user.getNom() + " !</h3>" +
                "<p>Vous êtes en télétravail aujourd’hui. Veuillez scanner le QR code ci-dessous pour confirmer votre pointage :</p>" +
                "<img src='data:image/png;base64," + qrCodeBase64 + "' alt='QR Code' />" +
                "<p>Si vous ne pouvez pas scanner, <a href='" + qrCodeBaseUrl + "?token=" + token + "'>cliquez ici</a> pour confirmer.</p>" +
                "<p>Cordialement,<br>L'équipe PORTAIL_RH</p>" +
                "<strong>Contact : contact@excellia.tn</strong>";

        return emailService.sendPasswordEmail(user.getMail(), user.getUserName(), htmlContent);
    }

    // Scheduler pour générer et envoyer les QR codes quotidiennement
    @Scheduled(cron = "0 0 6 * * ?") // Chaque jour à 6h
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

    // Valider et enregistrer le pointage
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

            // Comment out the time window check for testing
            /*
            LocalTime now = LocalTime.now();
            if (now.isBefore(LocalTime.of(8, 0)) || now.isAfter(LocalTime.of(12, 0))) {
                throw new IllegalStateException("Pointage hors plage horaire (8h-12h).");
            }
            */

            LocalTime now = LocalTime.now();
            TeletravailPointage pointage = new TeletravailPointage();
            pointage.setUser(user);
            pointage.setUserTeletravail(userTeletravail);
            pointage.setPointageDate(date);
            pointage.setPointageTime(now);
            pointageRepository.save(pointage);
        } catch (Exception e) {
            throw new IllegalStateException("Token invalide ou expiré : " + e.getMessage());
        }
    }

    // Récupérer le QR code pour affichage dans le portail
    @Override
    public String getQRCodeForUser(Long userId, LocalDate date) throws Exception {
        UserTeletravail userTeletravail = userTeletravailRepository.findByUserIdAndJoursChoisisContaining(userId, date.toString())
                .orElse(null);
        if (userTeletravail != null) {
            return generateQRCode(userId, date);
        }
        return null;
    }

    // Récupérer les pointages pour une période
    @Override
    public List<TeletravailPointage> getPointagesForPeriod(LocalDate start, LocalDate end) {
        return pointageRepository.findAll().stream()
                .filter(p -> !p.getPointageDate().isBefore(start) && !p.getPointageDate().isAfter(end))
                .toList();
    }

    // Envoyer l'email de pointage à la demande
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