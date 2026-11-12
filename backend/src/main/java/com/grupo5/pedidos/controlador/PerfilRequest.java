package com.grupo5.pedidos.controlador;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de PUT /api/usuarios/{id}/perfil (Mi perfil).
 * contrasenaActual y contrasenaNueva van vacías si no se cambia la contraseña.
 */
public record PerfilRequest(
        @NotBlank(message = "Ingresá tu nombre.") @Size(max = 60, message = "El nombre admite hasta 60 caracteres.") String nombre,
        @NotBlank(message = "Ingresá tu apellido.") @Size(max = 60, message = "El apellido admite hasta 60 caracteres.") String apellido,
        @NotBlank(message = "Ingresá tu correo.") @Email(message = "El correo no tiene un formato válido.")
        @Size(max = 120, message = "El correo admite hasta 120 caracteres.") String correo,
        @Size(max = 30, message = "El teléfono admite hasta 30 caracteres.") String telefono,
        @Size(max = 64) String contrasenaActual,
        @Size(max = 64, message = "La contraseña admite hasta 64 caracteres.") String contrasenaNueva) {
}
