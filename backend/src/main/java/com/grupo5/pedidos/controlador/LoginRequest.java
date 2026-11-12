package com.grupo5.pedidos.controlador;

import jakarta.validation.constraints.NotBlank;

/** Cuerpo de POST /api/auth/login. */
public record LoginRequest(
        @NotBlank(message = "Ingresá tu correo.") String correo,
        @NotBlank(message = "Ingresá tu contraseña.") String contrasena) {
}
