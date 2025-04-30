package com.example.PORTAIL_RH;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PortailRhApplication {

	public static void main(String[] args) {
		SpringApplication.run(PortailRhApplication.class, args);
	}

}
