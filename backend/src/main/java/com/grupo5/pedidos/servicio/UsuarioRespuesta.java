package com.grupo5.pedidos.servicio;

import com.grupo5.pedidos.entidad.Usuario;

/**
 * Lo que el backend devuelve de un usuario: los atributos del modelo MENOS la contraseña.
 * Usar un DTO acá (y no la entidad) garantiza que contrasena nunca salga en un JSON.
 * pendiente = cuenta autorizada por el administrador que todavía no completó el registro.
 */
public record UsuarioRespuesta(Long id, String nombre, String apellido, String correo,
                               String telefono, String rol, Boolean activo, Boolean pendiente) {

    public static UsuarioRespuesta de(Usuario u) {
        return new UsuarioRespuesta(u.getId(), u.getNombre(), u.getApellido(), u.getCorreo(),
                u.getTelefono(), u.getRol(), u.getActivo(), UsuarioService.pendiente(u));
    }
}
