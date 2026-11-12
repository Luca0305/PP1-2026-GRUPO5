package com.grupo5.pedidos.controlador;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de PUT /api/menus/semana (Administrar menús):
 * { "idUsuario": 1, "lunes": "2026-11-23", "publicado": true,
 *   "dias": [ { "fecha": "2026-11-23", "opciones": [ { "idPlato": 4, "stockDisponible": 20 },
 *                                                    { "nombre": "Pizza", "categoria": "minutas", "stockDisponible": 15 } ] } ] }
 */
public record MenuSemanaRequest(
        @NotNull(message = "Falta el administrador.") @Positive Long idUsuario,
        @NotNull(message = "Falta la semana (su lunes).") LocalDate lunes,
        @NotNull(message = "Indicá si se publica o queda en borrador.") Boolean publicado,
        @NotNull(message = "Faltan los días.") @Size(max = 5) List<@Valid Dia> dias) {

    public record Dia(
            @NotNull(message = "Falta la fecha del día.") LocalDate fecha,
            @NotNull @Size(max = 30, message = "Como mucho 30 opciones por día.") List<@Valid Opcion> opciones) {
    }

    public record Opcion(
            @Positive Long idPlato,
            @Size(max = 120, message = "El nombre del plato admite hasta 120 caracteres.") String nombre,
            @Size(max = 300, message = "La descripción admite hasta 300 caracteres.") String descripcion,
            @Size(max = 60) String categoria,
            @NotNull(message = "Indicá las porciones de cada opción.")
            @Min(value = 0, message = "Las porciones no pueden ser negativas.")
            @Max(value = 9999, message = "Como mucho 9999 porciones.") Integer stockDisponible) {
    }
}
