package com.grupo5.pedidos.servicio;

import java.time.LocalDate;

/** Una línea de pedido_dia, con el nombre del plato para mostrar (cruce 3). */
public record PedidoDiaRespuesta(Long id, Long idPedido, Long idMenuDia, Long idPlato, String plato,
                                 LocalDate fechaEntrega, String comentario) {
}
