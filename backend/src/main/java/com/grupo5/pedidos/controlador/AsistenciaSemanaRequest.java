package com.grupo5.pedidos.controlador;

import java.time.LocalDate;
import java.util.Set;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Lo que manda la pantalla Asistencia al guardar la semana:
 * { "idUsuario": 2, "semana": "2026-11-16", "fechas": ["2026-11-16", "2026-11-18"] }
 *
 * Bean Validation controla la FORMA (que no falte nada, que sean como mucho 5 días).
 * Las reglas del NEGOCIO (feriados, hora de corte) las controla el servicio.
 * Set: una fecha repetida cuenta una sola vez.
 */
public record AsistenciaSemanaRequest(

        @NotNull(message = "Falta el usuario.")
        @Positive(message = "El usuario no es válido.")
        Long idUsuario,

        @NotNull(message = "Falta la semana (la fecha de su lunes).")
        LocalDate semana,

        @NotEmpty(message = "Elegí al menos un día de asistencia.")
        @Size(max = 5, message = "Una semana tiene como mucho 5 días hábiles.")
        Set<@NotNull(message = "Hay una fecha vacía.") LocalDate> fechas) {
}
