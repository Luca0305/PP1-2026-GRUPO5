package com.grupo5.pedidos.servicio;

/** Correo o contraseña incorrectos, o cuenta inactiva (→ 401). */
public class AccesoDenegadoException extends RuntimeException {
    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}
