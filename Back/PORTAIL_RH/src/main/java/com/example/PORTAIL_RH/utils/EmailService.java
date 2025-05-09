package com.example.PORTAIL_RH.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordEmail(String to, String username, String password) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject("Votre mot de passe pour PORTAIL_RH");
        helper.setText(
                "<h3>Bienvenue, " + username + " !</h3>" +
                        "<p>Votre compte a été créé avec succès sur PORTAIL_RH EXCELLIA.</p>" +
                        "<p>Votre mot de passe est : <strong>" + password + "</strong></p>" +
                        "<p>Veuillez utiliser ce mot de passe pour vous connecter et le modifier dès que possible.</p>" +
                        "<p>Cordialement,<br>L'équipe PORTAIL_RH</p>",
                true
        );

        mailSender.send(message);
    }
}