package com.grupo5.pedidos.servicio;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grupo5.pedidos.entidad.MenuDia;
import com.grupo5.pedidos.entidad.MenuPlato;
import com.grupo5.pedidos.entidad.Plato;
import com.grupo5.pedidos.repositorio.MenuDiaRepository;
import com.grupo5.pedidos.repositorio.MenuPlatoRepository;
import com.grupo5.pedidos.repositorio.PedidoDiaRepository;
import com.grupo5.pedidos.repositorio.PlatoRepository;

/**
 * M3 · Mis menús. Es el cruce 1 del modelo explicado:
 * menu_dia (publicado) JOIN menu_plato JOIN plato, para una fecha o un rango.
 * Un menú sin publicar NO sale: el empleado no ve borradores.
 */
@Service
public class MenuService {

    private final MenuDiaRepository menuDiaRepository;
    private final MenuPlatoRepository menuPlatoRepository;
    private final PlatoRepository platoRepository;
    private final PedidoDiaRepository pedidoDiaRepository;

    public MenuService(MenuDiaRepository menuDiaRepository, MenuPlatoRepository menuPlatoRepository,
                       PlatoRepository platoRepository, PedidoDiaRepository pedidoDiaRepository) {
        this.menuDiaRepository = menuDiaRepository;
        this.menuPlatoRepository = menuPlatoRepository;
        this.platoRepository = platoRepository;
        this.pedidoDiaRepository = pedidoDiaRepository;
    }

    @Transactional(readOnly = true)
    public List<MenuDiaRespuesta> publicados(LocalDate desde, LocalDate hasta) {
        if (hasta.isBefore(desde)) {
            throw new ReglaNegocioException("La fecha 'hasta' no puede ser anterior a 'desde'.");
        }
        List<MenuDia> menus = desde.equals(hasta)
                ? menuDiaRepository.findByFechaAndPublicadoTrue(desde)
                : menuDiaRepository.findByFechaBetweenAndPublicadoTrueOrderByFechaAsc(desde, hasta);
        return respuestas(menus);
    }

    /** Arma la respuesta (menú + opciones + porciones) de una lista de menu_dia. */
    @Transactional(readOnly = true)
    public List<MenuDiaRespuesta> respuestas(List<MenuDia> menus) {
        if (menus.isEmpty()) {
            return List.of();
        }
        List<MenuPlato> opciones = menuPlatoRepository
                .findByIdMenuDiaInOrderByIdAsc(menus.stream().map(MenuDia::getId).toList());
        Map<Long, Plato> platos = platoRepository
                .findAllById(opciones.stream().map(MenuPlato::getIdPlato).distinct().toList()).stream()
                .collect(Collectors.toMap(Plato::getId, Function.identity()));

        return menus.stream().map(menu -> new MenuDiaRespuesta(
                menu.getId(), menu.getFecha(), menu.getDescripcion(), menu.getPublicado(),
                opciones.stream()
                        .filter(op -> op.getIdMenuDia().equals(menu.getId()))
                        .map(op -> opcion(op, platos.get(op.getIdPlato())))
                        .toList()))
                .toList();
    }

    private MenuOpcion opcion(MenuPlato op, Plato plato) {
        long reservadas = pedidoDiaRepository.contarReservadas(op.getIdMenuDia(), op.getIdPlato(), 0L);
        long disponibles = Math.max(0, op.getStockDisponible() - reservadas);
        return new MenuOpcion(op.getId(), op.getIdMenuDia(), op.getIdPlato(),
                plato.getNombre(), plato.getDescripcion(), plato.getImagen(), plato.getCategoria(),
                op.getStockDisponible(), reservadas, disponibles);
    }
}
