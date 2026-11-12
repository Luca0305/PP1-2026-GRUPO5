package com.grupo5.pedidos.controlador;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de POST /api/auth/registro. Las claves son las columnas de usuario en camelCase.
 * Las reglas de formato son las mismas que valida el frontend (validation.js):
 * el backend las repite porque al servidor le puede llegar cualquier cosa (Postman, otro cliente).
 */
public record RegistroRequest(

        @NotBlank(message = "Ingresá tu nombre.")
        @Size(min = 2, max = 60, message = "El nombre va de 2 a 60 caracteres.")
        @Pattern(regexp = "^[\\p{L}]+([ '\\-][\\p{L}]+)*$", message = "El nombre solo admite letras.")
        String nombre,

        @NotBlank(message = "Ingresá tu apellido.")
        @Size(min = 2, max = 60, message = "El apellido va de 2 a 60 caracteres.")
        @Pattern(regexp = "^[\\p{L}]+([ '\\-][\\p{L}]+)*$", message = "El apellido solo admite letras.")
        String apellido,

        @NotBlank(message = "Ingresá tu correo.")
        @Email(message = "El correo no tiene un formato válido.")
        @Size(max = 120, message = "El correo admite hasta 120 caracteres.")
        String correo,

        @NotBlank(message = "Ingresá una contraseña.")
        @Size(min = 8, max = 64, message = "La contraseña va de 8 a 64 caracteres.")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s])\\S+$",
                message = "La contraseña necesita mayúscula, minúscula, número y símbolo, sin espacios.")
        String contrasena,

        @Size(max = 30, message = "El teléfono admite hasta 30 caracteres.")
        String telefono) {
}
