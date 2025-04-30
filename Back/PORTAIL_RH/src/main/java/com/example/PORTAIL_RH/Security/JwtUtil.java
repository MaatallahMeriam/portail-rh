package com.example.PORTAIL_RH.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;

@Component
public class JwtUtil {

    private final Key secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256); // Clé secrète générée automatiquement
    private final long JWT_EXPIRATION = 1000 * 60 * 60 * 10; // 10 heures

    // Générer un token JWT pour un utilisateur
    public String generateToken(Users user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name()); // Ajout du rôle
        claims.put("id", user.getId()); // Ajout de l'ID de l'utilisateur
        return createToken(claims, user.getMail());
    }

    // Créer un token avec les claims et le sujet (mail)
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(secretKey, SignatureAlgorithm.HS256) // Signature explicite
                .compact();
    }

    // Extraire l'email (sujet) du token
    public String extractMail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extraire le rôle du token
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    // Extraire l'ID de l'utilisateur du token (optionnel, si vous en avez besoin plus tard)
    public Long extractId(String token) {
        return extractClaim(token, claims -> claims.get("id", Long.class));
    }

    // Méthode générique pour extraire un claim
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Extraire tous les claims du token
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Vérifier si le token est valide
    public boolean isTokenValid(String token, Users user) {
        final String mail = extractMail(token);
        return (mail.equals(user.getMail()) && !isTokenExpired(token));
    }

    // Vérifier si le token est expiré
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Extraire la date d'expiration du token
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}