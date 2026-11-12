package com.grupo5.pedidos.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * La hora de corte (pedidos.hora-corte) es hora de Argentina, aunque el servidor esté en otra zona.
 * Como bean, en un test JUnit se reemplaza por Clock.fixed(...) y la regla se prueba
 * a cualquier hora.
 */
@Configuration
public class RelojConfig {

    public static final ZoneId ZONA_ARGENTINA = ZoneId.of("America/Argentina/Buenos_Aires");

    @Bean
    public Clock reloj() {
        return Clock.system(ZONA_ARGENTINA);
    }
}
