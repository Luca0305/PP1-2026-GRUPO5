package com.grupo5.pedidos.servicio;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grupo5.pedidos.repositorio.PedidoDiaRepository;

/**
 * M5 · Consolidado (solo lectura). No hay tabla "consolidado": se CUENTA cada vez.
 * Si se guardara un número, el día que alguien cancela ese número quedaría mal.
 * Solo cuentan los pedidos CONFIRMADO: un borrador no se le pide al restaurante.
 */
@Service
public class ConsolidadoService {

    private static final int MAXIMO_DIAS = 31;

    private final PedidoDiaRepository pedidoDiaRepository;
    private final UsuarioService usuarioService;

    public ConsolidadoService(PedidoDiaRepository pedidoDiaRepository, UsuarioService usuarioService) {
        this.pedidoDiaRepository = pedidoDiaRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public List<ConsolidadoFila> consolidar(Long idAdministrador, LocalDate desde, LocalDate hasta) {
        validar(idAdministrador, desde, hasta);
        return pedidoDiaRepository.consolidar(desde, hasta);
    }

    @Transactional(readOnly = true)
    public List<PedidoDetalle> detalle(Long idAdministrador, LocalDate desde, LocalDate hasta) {
        validar(idAdministrador, desde, hasta);
        return pedidoDiaRepository.detallar(desde, hasta);
    }

    private void validar(Long idAdministrador, LocalDate desde, LocalDate hasta) {
        usuarioService.buscarAdministrador(idAdministrador);
        if (hasta.isBefore(desde)) {
            throw new ReglaNegocioException("La fecha 'hasta' no puede ser anterior a 'desde'.");
        }
        if (desde.plusDays(MAXIMO_DIAS).isBefore(hasta)) {
            throw new ReglaNegocioException("Consultá como mucho " + MAXIMO_DIAS + " días por vez.");
        }
    }
}
