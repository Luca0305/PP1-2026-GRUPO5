package com.grupo5.pedidos.controlador;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.grupo5.pedidos.servicio.UsuarioRespuesta;
import com.grupo5.pedidos.servicio.UsuarioService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

/**
 * Usuarios. Ninguna respuesta incluye la contraseña (UsuarioRespuesta).
 *   GET  /api/usuarios?idUsuario=1                 → todos (administrador)
 *   GET  /api/usuarios/empleados?idUsuario=1       → empleados activos (administrador)
 *   POST /api/usuarios                             → autorizar un email + rol (queda pendiente)
 *   PUT  /api/usuarios/{id}                        → editar nombre, apellido, correo y rol
 *   PUT  /api/usuarios/{id}/activo                 → activar / desactivar
 *   PUT  /api/usuarios/{id}/perfil                 → Mi perfil (el propio usuario)
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<UsuarioRespuesta> listar(@RequestParam @Positive Long idUsuario) {
        return usuarioService.listar(idUsuario);
    }

    @GetMapping("/empleados")
    public List<UsuarioRespuesta> empleados(@RequestParam @Positive Long idUsuario) {
        return usuarioService.empleadosActivos(idUsuario);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioRespuesta autorizar(@Valid @RequestBody UsuarioAdminRequest datos) {
        return usuarioService.autorizar(datos.idAdministrador(), datos.nombre(), datos.apellido(),
                datos.correo(), datos.rol());
    }

    @PutMapping("/{id}")
    public UsuarioRespuesta editar(@PathVariable Long id, @Valid @RequestBody UsuarioAdminRequest datos) {
        return usuarioService.editar(datos.idAdministrador(), id, datos.nombre(), datos.apellido(),
                datos.correo(), datos.rol());
    }

    @PutMapping("/{id}/activo")
    public UsuarioRespuesta cambiarActivo(@PathVariable Long id, @Valid @RequestBody ActivoRequest datos) {
        return usuarioService.cambiarActivo(datos.idAdministrador(), id, datos.activo());
    }

    @PutMapping("/{id}/perfil")
    public UsuarioRespuesta actualizarPerfil(@PathVariable Long id, @Valid @RequestBody PerfilRequest datos) {
        return usuarioService.actualizarPerfil(id, datos.nombre(), datos.apellido(), datos.correo(),
                datos.telefono(), datos.contrasenaActual(), datos.contrasenaNueva());
    }
}
