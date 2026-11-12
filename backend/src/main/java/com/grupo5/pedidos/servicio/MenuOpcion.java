package com.grupo5.pedidos.servicio;

/**
 * Una opción del menú de un día, tal como la necesita la pantalla Elegir menú:
 * la fila de menu_plato + los datos del plato + las porciones que quedan.
 * id = id_menu_plato. reservadas = porciones en pedidos no cancelados.
 * disponibles = stockDisponible − reservadas.
 */
public record MenuOpcion(Long id, Long idMenuDia, Long idPlato, String nombre, String descripcion,
                         String imagen, String categoria, Integer stockDisponible, Long reservadas,
                         Long disponibles) {
}
