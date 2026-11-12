package com.grupo5.pedidos.controlador;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.grupo5.pedidos.servicio.ConsolidadoFila;
import com.grupo5.pedidos.servicio.ConsolidadoService;
import com.grupo5.pedidos.servicio.PedidoDetalle;
import com.grupo5.pedidos.servicio.ReglaNegocioException;

import jakarta.validation.constraints.Positive;

/**
 * M5 · Consolidado (solo lectura, solo administrador). Es el cruce 2.
 *   GET /api/consolidado?idUsuario=1&fecha=2026-10-28
 *   GET /api/consolidado?idUsuario=1&desde=2026-10-26&hasta=2026-10-30
 *   GET /api/consolidado/detalle?idUsuario=1&desde=…&hasta=…   (quién pidió qué)
 */
@RestController
@RequestMapping("/api/consolidado")
public class ConsolidadoController {

    private final ConsolidadoService consolidadoService;

    public ConsolidadoController(ConsolidadoService consolidadoService) {
        this.consolidadoService = consolidadoService;
    }

    @GetMapping
    public List<ConsolidadoFila> consolidar(
            @RequestParam @Positive Long idUsuario,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        LocalDate[] rango = rango(fecha, desde, hasta);
        return consolidadoService.consolidar(idUsuario, rango[0], rango[1]);
    }

    @GetMapping("/detalle")
    public List<PedidoDetalle> detalle(
            @RequestParam @Positive Long idUsuario,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        LocalDate[] rango = rango(fecha, desde, hasta);
        return consolidadoService.detalle(idUsuario, rango[0], rango[1]);
    }

    private static LocalDate[] rango(LocalDate fecha, LocalDate desde, LocalDate hasta) {
        if (fecha != null) {
            return new LocalDate[] { fecha, fecha };
        }
        if (desde != null && hasta != null) {
            return new LocalDate[] { desde, hasta };
        }
        throw new ReglaNegocioException("Indicá ?fecha=AAAA-MM-DD o ?desde=…&hasta=….");
    }
}
