package com.grupo5.pedidos.controlador;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de POST /api/pedidos/fuera-de-horario (solo administrador):
 * { "idAdministrador": 1, "idEmpleado": 3, "idMenuDia": 8, "idPlato": 2, "comentario": "Llegó tarde" }
 */
public record PedidoFueraDeHorarioRequest(
        @NotNull(message = "Falta el administrador.") @Positive Long idAdministrador,
        @NotNull(message = "Elegí un empleado.") @Positive Long idEmpleado,
        @NotNull(message = "Falta el menú del día.") @Positive Long idMenuDia,
        @NotNull(message = "Elegí un plato.") @Positive Long idPlato,
        @Size(max = 200, message = "El comentario admite hasta 200 caracteres.") String comentario) {
}
