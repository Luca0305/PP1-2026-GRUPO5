package com.grupo5.pedidos.controlador;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Cuerpo de POST /api/usuarios (autorizar) y PUT /api/usuarios/{id} (editar). Solo administrador. */
public record UsuarioAdminRequest(
        @NotNull(message = "Falta el administrador.") @Positive Long idAdministrador,
        @NotBlank(message = "Ingresá el nombre.") @Size(max = 60) String nombre,
        @NotBlank(message = "Ingresá el apellido.") @Size(max = 60) String apellido,
        @NotBlank(message = "Ingresá el correo.") @Email(message = "El correo no tiene un formato válido.") @Size(max = 120) String correo,
        @NotBlank(message = "Elegí un rol.")
        @Pattern(regexp = "EMPLEADO|ADMINISTRADOR", message = "El rol es EMPLEADO o ADMINISTRADOR.") String rol) {
}
