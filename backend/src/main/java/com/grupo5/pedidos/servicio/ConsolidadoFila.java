package com.grupo5.pedidos.servicio;

import java.time.LocalDate;

/**
 * Una fila del consolidado (cruce 2): cuántas porciones de un plato hay que pedir un día.
 * Las claves del cruce son plato y porciones; fecha e idPlato sirven para ver una semana.
 * No se guarda en ninguna tabla: se cuenta cada vez (COUNT ... GROUP BY).
 */
public record ConsolidadoFila(LocalDate fecha, Long idPlato, String plato, Long porciones) {
}
