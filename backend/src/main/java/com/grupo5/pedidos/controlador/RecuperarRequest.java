package com.grupo5.pedidos.controlador;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Cuerpo de POST /api/auth/recuperar. */
public record RecuperarRequest(
        @NotBlank(message = "Ingresá tu email.")
        @Email(message = "El email no tiene un formato válido.")
        String correo) {
}
