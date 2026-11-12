package com.grupo5.pedidos.servicio;

/** El pedido está bien formado, pero rompe una regla del negocio (→ 409). */
public class ReglaNegocioException extends RuntimeException {
    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
