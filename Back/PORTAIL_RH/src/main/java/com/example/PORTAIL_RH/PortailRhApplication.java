package com.example.PORTAIL_RH;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import javax.crypto.SecretKey;

@SpringBootApplication
@EnableScheduling
public class PortailRhApplication {

	public static void main(String[] args) {
		SpringApplication.run(PortailRhApplication.class, args);
		SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS512);
		System.out.println(Encoders.BASE64.encode(key.getEncoded()));
	}
}