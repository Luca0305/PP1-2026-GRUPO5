package com.grupo5.pedidos.servicio;

import java.time.LocalDate;
import java.util.List;

/** Un menu_dia con sus opciones adentro (resultado del cruce 1). */
public record MenuDiaRespuesta(Long id, LocalDate fecha, String descripcion, Boolean publicado,
                               List<MenuOpcion> opciones) {
}
