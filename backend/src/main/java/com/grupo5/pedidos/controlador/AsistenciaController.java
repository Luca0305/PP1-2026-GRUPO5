package com.grupo5.pedidos.controlador;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.grupo5.pedidos.entidad.Asistencia;
import com.grupo5.pedidos.servicio.AsistenciaService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

/**
 * M2 · Mis días. El controller solo atiende la URL: recibe, valida la forma
 * y le pasa el trabajo al servicio. No tiene reglas ni toca el repositorio.
 *
 *   GET /api/asistencias?idUsuario=3&desde=2026-10-26&hasta=2026-10-30
 *   PUT /api/asistencias/semana   (cuerpo: AsistenciaSemanaRequest)
 *
 * CORS: lo resuelve config/CorsConfig para todo /api/** (no hace falta @CrossOrigin acá).
 */
@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @GetMapping
    public List<Asistencia> listar(
            @RequestParam @Positive(message = "El usuario no es válido.") Long idUsuario,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return asistenciaService.listar(idUsuario, desde, hasta);
    }

    // PUT y no POST: guardar dos veces la misma semana deja la base igual (idempotente).
    @PutMapping("/semana")
    public List<Asistencia> guardarSemana(@Valid @RequestBody AsistenciaSemanaRequest pedido) {
        return asistenciaService.guardarSemana(pedido.idUsuario(), pedido.semana(), pedido.fechas());
    }
}
