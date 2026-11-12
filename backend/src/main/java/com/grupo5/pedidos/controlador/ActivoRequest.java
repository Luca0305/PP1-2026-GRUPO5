package com.grupo5.pedidos.controlador;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Cuerpo de PUT /api/usuarios/{id}/activo: { "idAdministrador": 1, "activo": false }. */
public record ActivoRequest(
        @NotNull(message = "Falta el administrador.") @Positive Long idAdministrador,
        @NotNull(message = "Indicá si la cuenta queda activa.") Boolean activo) {
}
