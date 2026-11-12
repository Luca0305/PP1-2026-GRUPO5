package com.grupo5.pedidos.controlador;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.grupo5.pedidos.servicio.AccesoDenegadoException;
import com.grupo5.pedidos.servicio.RecursoNoEncontradoException;
import com.grupo5.pedidos.servicio.ReglaNegocioException;

/**
 * Convierte las excepciones en respuestas JSON con una sola clave: { "mensaje": "..." }.
 * El frontend muestra ese mensaje en su estado de error.
 *   400 → el pedido vino mal formado (Bean Validation, JSON roto, parámetro faltante)
 *   401 → correo/contraseña incorrectos, o el rol no tiene permiso
 *   404 → no existe lo que se pidió
 *   409 → está bien formado pero rompe una regla del negocio
 */
@RestControllerAdvice
public class ManejadorDeErrores {

    public record ErrorRespuesta(String mensaje) {
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ErrorRespuesta> reglaDeNegocio(ReglaNegocioException e) {
        return responder(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<ErrorRespuesta> accesoDenegado(AccesoDenegadoException e) {
        return responder(HttpStatus.UNAUTHORIZED, e.getMessage());
    }

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorRespuesta> noEncontrado(RecursoNoEncontradoException e) {
        return responder(HttpStatus.NOT_FOUND, e.getMessage());
    }

    // @Valid @RequestBody: falló una anotación del record (por ejemplo @NotEmpty en fechas).
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorRespuesta> cuerpoInvalido(MethodArgumentNotValidException e) {
        String mensaje = e.getBindingResult().getAllErrors().stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("Revisá los datos enviados.");
        return responder(HttpStatus.BAD_REQUEST, mensaje);
    }

    // Anotaciones sobre @RequestParam (por ejemplo @Positive en idUsuario).
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorRespuesta> parametroInvalido(HandlerMethodValidationException e) {
        String mensaje = e.getAllErrors().stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("Revisá los parámetros enviados.");
        return responder(HttpStatus.BAD_REQUEST, mensaje);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorRespuesta> parametroFaltante(MissingServletRequestParameterException e) {
        return responder(HttpStatus.BAD_REQUEST, "Falta el parámetro '" + e.getParameterName() + "'.");
    }

    // Ej.: ?desde=26/10/2026 en vez de ?desde=2026-10-26
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorRespuesta> tipoInvalido(MethodArgumentTypeMismatchException e) {
        return responder(HttpStatus.BAD_REQUEST, "El parámetro '" + e.getName()
                + "' tiene un formato inválido (las fechas van como AAAA-MM-DD).");
    }

    // JSON mal escrito o una fecha que no es AAAA-MM-DD dentro del cuerpo.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorRespuesta> jsonInvalido(HttpMessageNotReadableException e) {
        return responder(HttpStatus.BAD_REQUEST,
                "El cuerpo no es un JSON válido o tiene una fecha mal escrita (AAAA-MM-DD).");
    }

    private static ResponseEntity<ErrorRespuesta> responder(HttpStatus estado, String mensaje) {
        return ResponseEntity.status(estado).body(new ErrorRespuesta(mensaje));
    }
}
