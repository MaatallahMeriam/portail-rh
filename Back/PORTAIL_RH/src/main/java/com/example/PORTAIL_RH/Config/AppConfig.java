package com.example.PORTAIL_RH.Config;

import com.example.PORTAIL_RH.utils.PasswordGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public PasswordGenerator passwordGenerator() {
        return new PasswordGenerator();
    }
}