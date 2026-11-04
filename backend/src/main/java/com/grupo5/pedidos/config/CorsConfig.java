package com.grupo5.pedidos.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS: el navegador bloquea que una página de un origen (Live Server)
 * lea respuestas de otro (Spring, puerto 8080) salvo que el backend lo autorice.
 * localhost y 127.0.0.1 son orígenes distintos para el navegador: van los dos.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        // Live Server (puerto por defecto y el de .vscode/settings.json)
                        "http://127.0.0.1:5500", "http://localhost:5500",
                        "http://127.0.0.1:5502", "http://localhost:5502",
                        // npm start (scripts/serve.mjs)
                        "http://127.0.0.1:4173", "http://localhost:4173")
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
