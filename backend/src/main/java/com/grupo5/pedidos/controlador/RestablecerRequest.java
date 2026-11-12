package com.grupo5.pedidos.controlador;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Cuerpo de POST /api/auth/restablecer. La contraseña cumple la misma política que el registro. */
public record RestablecerRequest(
        @NotBlank(message = "Falta el enlace de recuperación.")
        String token,

        @NotBlank(message = "Ingresá una contraseña.")
        @Size(min = 8, max = 64, message = "La contraseña va de 8 a 64 caracteres.")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s])\\S+$",
                message = "La contraseña necesita mayúscula, minúscula, número y símbolo, sin espacios.")
        String contrasena) {
}
