package com.grupo5.pedidos.servicio;

/** Lo que se pidió no existe en la base (→ 404). */
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
