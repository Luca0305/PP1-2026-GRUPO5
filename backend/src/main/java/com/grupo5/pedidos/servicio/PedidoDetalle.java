package com.grupo5.pedidos.servicio;

import java.time.LocalDate;

/** Una línea de pedido no cancelada, con el nombre de quien la pidió (vista del administrador). */
public record PedidoDetalle(LocalDate fecha, Long idPlato, String empleado, String plato,
                            String estado, String comentario) {
}
