package com.grupo5.pedidos.controlador;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.grupo5.pedidos.servicio.MenuAdminService;
import com.grupo5.pedidos.servicio.MenuDiaRespuesta;
import com.grupo5.pedidos.servicio.MenuService;
import com.grupo5.pedidos.servicio.ReglaNegocioException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

/**
 * M3 · Mis menús (cruce 1). Solo menús PUBLICADOS, con sus opciones y porciones disponibles.
 *   GET /api/menus?fecha=2026-10-27
 *   GET /api/menus?desde=2026-11-16&hasta=2026-11-20
 * Administrar menús (administrador):
 *   GET /api/menus/admin?idUsuario=1&desde&hasta   → también los borradores
 *   PUT /api/menus/semana                          → guarda/publica la semana
 */
@RestController
@RequestMapping("/api/menus")
public class MenuController {

    private final MenuService menuService;
    private final MenuAdminService menuAdminService;

    public MenuController(MenuService menuService, MenuAdminService menuAdminService) {
        this.menuService = menuService;
        this.menuAdminService = menuAdminService;
    }

    @GetMapping("/admin")
    public List<MenuDiaRespuesta> listarAdmin(
            @RequestParam @Positive Long idUsuario,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return menuAdminService.listar(idUsuario, desde, hasta);
    }

    @PutMapping("/semana")
    public List<MenuDiaRespuesta> guardarSemana(@Valid @RequestBody MenuSemanaRequest datos) {
        return menuAdminService.guardarSemana(datos.idUsuario(), datos.lunes(), datos.publicado(),
                datos.dias().stream().map(d -> new MenuAdminService.DiaNuevo(d.fecha(),
                        d.opciones().stream().map(o -> new MenuAdminService.OpcionNueva(o.idPlato(), o.nombre(),
                                o.descripcion(), o.categoria(), o.stockDisponible())).toList())).toList());
    }

    @GetMapping
    public List<MenuDiaRespuesta> publicados(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        if (fecha != null) {
            return menuService.publicados(fecha, fecha);
        }
        if (desde != null && hasta != null) {
            return menuService.publicados(desde, hasta);
        }
        throw new ReglaNegocioException("Indicá ?fecha=AAAA-MM-DD o ?desde=…&hasta=….");
    }
}
