package com.grupo5.pedidos.servicio;

import java.time.LocalDate;
import java.util.List;

/** La cabecera del pedido con sus líneas adentro: "va dentro del pedido" (tabla de traducción). */
public record PedidoRespuesta(Long id, Long idUsuario, LocalDate fechaPedido, String estado,
                              List<PedidoDiaRespuesta> dias) {
}
