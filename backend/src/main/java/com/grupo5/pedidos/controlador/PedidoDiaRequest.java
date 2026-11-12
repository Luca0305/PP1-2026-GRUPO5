package com.grupo5.pedidos.controlador;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de POST /api/pedidos: la elección de UN día.
 * { "idUsuario": 2, "idMenuDia": 7, "idPlato": 1, "comentario": "Sin sal" }
 * Las claves son las de pedido_dia (más idUsuario, que es de la cabecera pedido).
 */
public record PedidoDiaRequest(
        @NotNull(message = "Falta el usuario.") @Positive Long idUsuario,
        @NotNull(message = "Falta el menú del día.") @Positive Long idMenuDia,
        @NotNull(message = "Elegí un plato.") @Positive Long idPlato,
        @Size(max = 200, message = "El comentario admite hasta 200 caracteres.") String comentario) {
}
