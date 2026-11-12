package com.grupo5.pedidos.servicio;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grupo5.pedidos.entidad.Usuario;
import com.grupo5.pedidos.repositorio.UsuarioRepository;

/**
 * Recuperar contraseña (complemento de M1).
 *
 *  1. POST /api/auth/recuperar  { correo } → si la cuenta existe y está activa, se genera
 *     un enlace de un solo uso que vence a los 15 minutos. Pedir otro invalida el anterior.
 *  2. GET  /api/auth/recuperar/{token}    → ¿el enlace sigue vigente?
 *  3. POST /api/auth/restablecer { token, contrasena } → guarda la nueva contraseña
 *     (como huella PBKDF2) en la tabla usuario y el enlace deja de servir.
 *
 * Dos decisiones, para la defensa:
 *  - No hay servicio de email (las notificaciones están fuera del alcance de la entrega), así
 *    que el enlace se devuelve como "correo simulado" para mostrarlo en pantalla, igual que
 *    en el prototipo. En producción se enviaría por mail y NO se devolvería en la respuesta.
 *  - Los enlaces viven en memoria: el script no tiene una tabla para ellos y el modelo no se
 *    cambia. Si se reinicia Spring, los enlaces pendientes dejan de valer (se pide otro).
 */
@Service
public class RecuperacionService {

    public static final Duration VIGENCIA = Duration.ofMinutes(15);

    /** El "correo" que se mostraría: a quién, con qué enlace y hasta cuándo vale. */
    public record CorreoSimulado(String destinatario, String token, Instant vence) {
    }

    private record Enlace(Long idUsuario, Instant vence) {
    }

    private final UsuarioRepository usuarioRepository;
    private final ContrasenaService contrasenaService;
    private final Clock reloj;
    private final SecureRandom azar = new SecureRandom();
    private final Map<String, Enlace> enlaces = new ConcurrentHashMap<>();

    public RecuperacionService(UsuarioRepository usuarioRepository, ContrasenaService contrasenaService,
                               Clock reloj) {
        this.usuarioRepository = usuarioRepository;
        this.contrasenaService = contrasenaService;
        this.reloj = reloj;
    }

    /** Devuelve el correo simulado, o null si el correo no es de una cuenta activa. */
    public CorreoSimulado solicitar(String correo) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo.trim())
                .filter(u -> Boolean.TRUE.equals(u.getActivo()) && !UsuarioService.pendiente(u))
                .orElse(null);
        if (usuario == null) {
            return null;
        }
        // Pedir otro invalida el anterior: se borran los enlaces previos de esa cuenta.
        enlaces.values().removeIf(e -> e.idUsuario().equals(usuario.getId()));
        byte[] bytes = new byte[32];
        azar.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        Instant vence = Instant.now(reloj).plus(VIGENCIA);
        enlaces.put(token, new Enlace(usuario.getId(), vence));
        return new CorreoSimulado(usuario.getCorreo(), token, vence);
    }

    public void validar(String token) {
        vigente(token);
    }

    @Transactional
    public void restablecer(String token, String contrasenaNueva) {
        Enlace enlace = vigente(token);
        Usuario usuario = usuarioRepository.findById(enlace.idUsuario())
                .filter(u -> Boolean.TRUE.equals(u.getActivo()))
                .orElseThrow(() -> new ReglaNegocioException("La cuenta ya no está activa. Consultá al administrador."));
        usuario.setContrasena(contrasenaService.huella(contrasenaNueva));
        usuarioRepository.save(usuario);
        enlaces.remove(token); // un solo uso
    }

    private Enlace vigente(String token) {
        Enlace enlace = token == null ? null : enlaces.get(token);
        if (enlace == null) {
            throw new RecursoNoEncontradoException("El enlace no es válido o ya se usó. Pedí uno nuevo.");
        }
        if (Instant.now(reloj).isAfter(enlace.vence())) {
            enlaces.remove(token);
            throw new ReglaNegocioException("El enlace venció (dura 15 minutos). Pedí uno nuevo.");
        }
        return enlace;
    }
}
