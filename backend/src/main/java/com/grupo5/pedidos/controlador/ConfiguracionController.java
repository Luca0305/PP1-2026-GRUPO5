package com.grupo5.pedidos.controlador;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grupo5.pedidos.servicio.ReglaHorario;

/**
 * Lo que el frontend necesita saber del servidor para mostrar las mismas reglas:
 *   GET /api/configuracion → { "horaCorte": "10:00" }
 * La hora se cambia en application.properties (pedidos.hora-corte) y se reinicia Spring.
 */
@RestController
@RequestMapping("/api/configuracion")
public class ConfiguracionController {

    public record Configuracion(String horaCorte) {
    }

    private final ReglaHorario reglaHorario;

    public ConfiguracionController(ReglaHorario reglaHorario) {
        this.reglaHorario = reglaHorario;
    }

    @GetMapping
    public Configuracion configuracion() {
        return new Configuracion(reglaHorario.horaCorteTexto());
    }
}
