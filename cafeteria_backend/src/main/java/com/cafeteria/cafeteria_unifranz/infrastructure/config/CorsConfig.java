package com.cafeteria.cafeteria_unifranz.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
<<<<<<< HEAD
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
=======
                .allowedOriginPatterns("http://localhost:*")
                .allowedMethods("GET", "POST", "PATCH", "OPTIONS")
>>>>>>> 522e744 (Módulo cajero aun falta pero ya con lo basico)
                .allowedHeaders("*");
    }
}