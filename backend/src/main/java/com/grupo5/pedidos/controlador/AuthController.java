package com.grupo5.pedidos.controlador;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.grupo5.pedidos.servicio.RecuperacionService;
import com.grupo5.pedidos.servicio.RecuperacionService.CorreoSimulado;
import com.grupo5.pedidos.servicio.UsuarioRespuesta;
import com.grupo5.pedidos.servicio.UsuarioService;

import jakarta.validation.Valid;

/**
 * M1 · Acceso.
 *   POST /api/auth/registro → 201 con el usuario creado (sin contraseña)
 *   POST /api/auth/login    → 200 con el usuario, o 401 si no coincide
 *   POST /api/auth/recuperar            → pide un enlace para cambiar la contraseña
 *   GET  /api/auth/recuperar/{token}    → ¿el enlace sigue vigente?
 *   POST /api/auth/restablecer          → guarda la contraseña nueva
 * El frontend guarda ese usuario en sessionStorage y manda su id en cada pedido.
 * (Sin tokens: Spring Security / JWT sería el M6 opcional.)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /** Mensaje de recuperar: es el mismo exista o no el correo, para no revelar qué cuentas hay. */
    static final String MENSAJE_RECUPERAR =
            "Si el email corresponde a una cuenta activa, se generó un enlace para cambiar la contraseña.";

    /**
     * Respuesta de recuperar.
     *  - modoDemo = false (producción): solo el mensaje. El enlace se mandaría por mail, nunca en la respuesta.
     *  - modoDemo = true  (demo de clase, sin servicio de email): además viaja el correo simulado
     *    para mostrarlo en pantalla. Es una simulación DECLARADA y se apaga desde application.properties.
     */
    public record RecuperarRespuesta(String mensaje, boolean modoDemo, CorreoSimulado correoSimulado) {
    }

    public record Mensaje(String mensaje) {
    }

    private final UsuarioService usuarioService;
    private final RecuperacionService recuperacionService;
    private final boolean modoDemo;

    public AuthController(UsuarioService usuarioService, RecuperacionService recuperacionService,
                          @Value("${pedidos.recuperacion.modo-demo:false}") boolean modoDemo) {
        this.usuarioService = usuarioService;
        this.recuperacionService = recuperacionService;
        this.modoDemo = modoDemo;
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioRespuesta registrar(@Valid @RequestBody RegistroRequest datos) {
        return usuarioService.registrar(datos.nombre(), datos.apellido(), datos.correo(),
                datos.contrasena(), datos.telefono());
    }

    @PostMapping("/login")
    public UsuarioRespuesta ingresar(@Valid @RequestBody LoginRequest datos) {
        return usuarioService.ingresar(datos.correo(), datos.contrasena());
    }

    @PostMapping("/recuperar")
    public RecuperarRespuesta recuperar(@Valid @RequestBody RecuperarRequest datos) {
        CorreoSimulado correo = recuperacionService.solicitar(datos.correo());
        // Fuera del modo demo la respuesta es idéntica exista o no la cuenta:
        // no se filtra ni el token ni qué correos están registrados.
        return new RecuperarRespuesta(MENSAJE_RECUPERAR, modoDemo, modoDemo ? correo : null);
    }

    @GetMapping("/recuperar/{token}")
    public Mensaje validarEnlace(@PathVariable String token) {
        recuperacionService.validar(token);
        return new Mensaje("Enlace vigente.");
    }

    @PostMapping("/restablecer")
    public Mensaje restablecer(@Valid @RequestBody RestablecerRequest datos) {
        recuperacionService.restablecer(datos.token(), datos.contrasena());
        return new Mensaje("Contraseña actualizada. Ya podés iniciar sesión con la nueva.");
    }
}
