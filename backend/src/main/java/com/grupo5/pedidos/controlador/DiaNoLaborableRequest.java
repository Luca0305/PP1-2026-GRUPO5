package com.grupo5.pedidos.controlador;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Cuerpo de POST /api/dias-no-laborables: { "idUsuario": 1, "fecha": "2026-11-27", "motivo": "Cierre" }. */
public record DiaNoLaborableRequest(
        @NotNull(message = "Falta el administrador.") @Positive Long idUsuario,
        @NotNull(message = "Elegí una fecha.") LocalDate fecha,
        @NotBlank(message = "Ingresá un motivo.") @Size(max = 120, message = "El motivo admite hasta 120 caracteres.") String motivo) {
}
