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
                    "<h3>Bienvenue, " + username + " !</h3>" +
                            "<p>Votre compte a été créé avec succès sur notre plateforme PORTAIL RH Excellia Solutions.</p>" +
                            "<p>Votre mot de passe est : <strong>" + password + "</strong></p>" +
                            "<p>Veuillez utiliser ce mot de passe pour vous connecter et le modifier dès que possible.</p>" +
                            "<p>Cordialement,<br>L'équipe PORTAIL RH.</p><br>" +
                            "<strong> Contact : contact@excellia.tn </strong>",

                    true
            );

            mailSender.send(message);
            logger.info("E-mail envoyé avec succès à {}", to);
            return true;
        } catch (MessagingException e) {
            logger.error("Erreur lors de l'envoi de l'e-mail à {} : {}", to, e.getMessage());
            return false;
        }
    }
}