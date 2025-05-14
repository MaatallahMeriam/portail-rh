package com.example.PORTAIL_RH.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EnhancedEmailService {

    private static final Logger logger = LoggerFactory.getLogger(EnhancedEmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public boolean sendPasswordEmail(String to, String username, String password) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject("Votre mot de passe pour PORTAIL_RH");
            helper.setText(
                    "<h3 style='color: #230046;'>Bienvenue, " + username + " !</h3>" +
                            "<p>Votre compte a été créé avec succès sur notre plateforme <strong>PORTAIL RH Excellia Solutions</strong>.</p>" +
                            "<p>Votre mot de passe est : <strong style='color: #c1006a;'>" + password + "</strong></p>" +
                            "<p>Veuillez utiliser ce mot de passe pour vous connecter et le modifier dès que possible.</p>" +
                            "<p style='font-style: italic;'>Cordialement,<br>L'équipe PORTAIL RH</p>" +
                            "<p><strong>Contact : <a href='mailto:contact@excellia.tn' style='color: #230046;'>contact@excellia.tn</a></strong></p>",
                    true
            );

            mailSender.send(message);
            logger.info("E-mail de mot de passe envoyé avec succès à {}", to);
            return true;
        } catch (MessagingException e) {
            logger.error("Erreur lors de l'envoi de l'e-mail de mot de passe à {} : {}", to, e.getMessage());
            return false;
        }
    }

    public boolean sendPointageEmail(String to, String username, String qrCodeBase64, String confirmationUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject("Votre QR Code pour le pointage en télétravail");
            helper.setText(
                    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;'>" +
                            "<h3 style='color: #322881; text-align: center;'>Bonjour, " + username + " !</h3>" +
                            "<p style='color: #333; text-align: center;'>Vous êtes en télétravail aujourd’hui.</p>" +
                            "<div style='text-align: center; margin: 20px 0;'>" +
                            "</div>" +
                            "<p style='color: #333; text-align: center;'>Veuillez confirmer votre pointage en cliquant sur le lien : <a href='" + confirmationUrl + "' style='color: #c1006a; font-weight: bold; text-decoration: none;'>POINTAGE</a></p>" +
                            "<p style='color: #230046; font-style: italic; text-align: center;'>Cordialement,<br>L'équipe PORTAIL RH</p>" +
                            "<p style='text-align: center; style='color: #322881 ;'><strong>Contact : <a href='mailto:contact@excellia.tn' style='color: #322881; text-decoration: none;'>contact@excellia.tn</a></strong></p>" +
                            "</div>",
                    true
            );

            mailSender.send(message);
            logger.info("E-mail de pointage envoyé avec succès à {}", to);
            return true;
        } catch (MessagingException e) {
            logger.error("Erreur lors de l'envoi de l'e-mail de pointage à {} : {}", to, e.getMessage());
            return false;
        }
    }
}