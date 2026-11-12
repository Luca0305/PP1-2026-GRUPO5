package com.grupo5.pedidos.controlador;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.grupo5.pedidos.servicio.PedidoRespuesta;
import com.grupo5.pedidos.servicio.PedidoService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

/**
 * M4 · Mi pedido.
 *   GET    /api/pedidos?idUsuario=3                       → mis pedidos (cruce 3)
 *   POST   /api/pedidos                                   → guardar un día en BORRADOR (201)
 *   PUT    /api/pedidos/{id}/confirmar?idUsuario=3        → BORRADOR → CONFIRMADO
 *   PUT    /api/pedidos/{id}/cancelar?idUsuario=3         → CANCELADO
 *   DELETE /api/pedidos/{id}/dias/{idDia}?idUsuario=3     → quitar un día del borrador (204)
 *   POST   /api/pedidos/fuera-de-horario                  → el ADMINISTRADOR carga el pedido
 *                                                           de un empleado después del corte (201)
 * Las líneas van DENTRO del pedido ("dias"), como dice la tabla de traducción.
 */
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public List<PedidoRespuesta> listar(@RequestParam @Positive Long idUsuario) {
        return pedidoService.listar(idUsuario);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoRespuesta guardarDia(@Valid @RequestBody PedidoDiaRequest datos) {
        return pedidoService.guardarDia(datos.idUsuario(), datos.idMenuDia(), datos.idPlato(), datos.comentario());
    }

    @PostMapping("/fuera-de-horario")
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoRespuesta cargarFueraDeHorario(@Valid @RequestBody PedidoFueraDeHorarioRequest datos) {
        return pedidoService.cargarFueraDeHorario(datos.idAdministrador(), datos.idEmpleado(),
                datos.idMenuDia(), datos.idPlato(), datos.comentario());
    }

    @PutMapping("/{id}/confirmar")
    public PedidoRespuesta confirmar(@PathVariable Long id, @RequestParam @Positive Long idUsuario) {
        return pedidoService.confirmar(id, idUsuario);
    }

    @PutMapping("/{id}/cancelar")
    public PedidoRespuesta cancelar(@PathVariable Long id, @RequestParam @Positive Long idUsuario) {
        return pedidoService.cancelar(id, idUsuario);
    }

    @DeleteMapping("/{id}/dias/{idDia}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void quitarDia(@PathVariable Long id, @PathVariable Long idDia,
                          @RequestParam @Positive Long idUsuario) {
        pedidoService.quitarDia(id, idDia, idUsuario);
    }
}
