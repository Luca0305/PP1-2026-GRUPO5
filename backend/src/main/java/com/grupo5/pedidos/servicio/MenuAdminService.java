package com.grupo5.pedidos.servicio;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grupo5.pedidos.entidad.MenuDia;
import com.grupo5.pedidos.entidad.MenuPlato;
import com.grupo5.pedidos.entidad.Plato;
import com.grupo5.pedidos.repositorio.DiaNoLaborableRepository;
import com.grupo5.pedidos.repositorio.MenuDiaRepository;
import com.grupo5.pedidos.repositorio.MenuPlatoRepository;
import com.grupo5.pedidos.repositorio.PedidoDiaRepository;
import com.grupo5.pedidos.repositorio.PlatoRepository;

/**
 * Administrar menús (administrador): arma la semana en menu_dia + menu_plato.
 *
 * Reglas:
 *  - Solo se tocan los días con plazo abierto; los cerrados quedan de lectura.
 *  - Un día no laborable no lleva menú.
 *  - Día sin opciones = sin menú: se borra, salvo que tenga pedidos activos.
 *  - Un plato escrito a mano se busca por nombre en el catálogo; si no existe, se crea en plato.
 *  - No se repite un plato en el mismo día. Porciones de 0 a 9999.
 *  - Si una opción ya tiene pedidos: no se puede quitar, ni bajar sus porciones por debajo
 *    de lo reservado. Un menú con pedidos tampoco se puede despublicar.
 *  - publicado = true → los empleados lo ven (M3); false → borrador del administrador.
 */
@Service
public class MenuAdminService {

    private static final DateTimeFormatter DD_MM_AAAA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String[] NOMBRES_DIA = { "lunes", "martes", "miércoles", "jueves", "viernes" };

    /** Una opción tal como la manda la pantalla. idPlato vacío = plato escrito a mano. */
    public record OpcionNueva(Long idPlato, String nombre, String descripcion, String categoria, Integer stockDisponible) {
    }

    /** Un día de la semana con sus opciones. Lista vacía = sin servicio (sin menú). */
    public record DiaNuevo(LocalDate fecha, List<OpcionNueva> opciones) {
    }

    private final MenuDiaRepository menuDiaRepository;
    private final MenuPlatoRepository menuPlatoRepository;
    private final PlatoRepository platoRepository;
    private final PedidoDiaRepository pedidoDiaRepository;
    private final DiaNoLaborableRepository diaNoLaborableRepository;
    private final UsuarioService usuarioService;
    private final MenuService menuService;
    private final ReglaHorario reglaHorario;

    public MenuAdminService(MenuDiaRepository menuDiaRepository, MenuPlatoRepository menuPlatoRepository,
                            PlatoRepository platoRepository, PedidoDiaRepository pedidoDiaRepository,
                            DiaNoLaborableRepository diaNoLaborableRepository, UsuarioService usuarioService,
                            MenuService menuService, ReglaHorario reglaHorario) {
        this.menuDiaRepository = menuDiaRepository;
        this.menuPlatoRepository = menuPlatoRepository;
        this.platoRepository = platoRepository;
        this.pedidoDiaRepository = pedidoDiaRepository;
        this.diaNoLaborableRepository = diaNoLaborableRepository;
        this.usuarioService = usuarioService;
        this.menuService = menuService;
        this.reglaHorario = reglaHorario;
    }

    /** Todos los menús de un rango, publicados o no, con sus opciones y porciones reservadas. */
    @Transactional(readOnly = true)
    public List<MenuDiaRespuesta> listar(Long idAdministrador, LocalDate desde, LocalDate hasta) {
        usuarioService.buscarAdministrador(idAdministrador);
        if (hasta.isBefore(desde) || desde.plusDays(92).isBefore(hasta)) {
            throw new ReglaNegocioException("Elegí un rango de fechas válido (como mucho 3 meses).");
        }
        return menuService.respuestas(menuDiaRepository.findByFechaBetweenOrderByFechaAsc(desde, hasta));
    }

    /** Guarda la semana. publicado = true publica todos los días con menú; false los deja en borrador. */
    @Transactional
    public List<MenuDiaRespuesta> guardarSemana(Long idAdministrador, LocalDate lunes, boolean publicado,
                                                List<DiaNuevo> dias) {
        Long idCreador = usuarioService.buscarAdministrador(idAdministrador).getId();
        if (lunes.getDayOfWeek() != DayOfWeek.MONDAY) {
            throw new ReglaNegocioException("La semana se indica con la fecha de su lunes.");
        }
        LocalDate viernes = lunes.plusDays(4);
        Set<LocalDate> vistos = new HashSet<>();
        for (DiaNuevo dia : dias) {
            if (dia.fecha().isBefore(lunes) || dia.fecha().isAfter(viernes) || !vistos.add(dia.fecha())) {
                throw new ReglaNegocioException("El " + texto(dia.fecha()) + " no es un día hábil de esta semana.");
            }
        }
        for (DiaNuevo dia : dias) {
            if (!reglaHorario.estaCerrado(dia.fecha())) {
                guardarDia(dia, publicado, idCreador);
            }
        }
        return menuService.respuestas(menuDiaRepository.findByFechaBetweenOrderByFechaAsc(lunes, viernes));
    }

    private void guardarDia(DiaNuevo dia, boolean publicado, Long idCreador) {
        LocalDate fecha = dia.fecha();
        MenuDia menu = menuDiaRepository.findByFecha(fecha).orElse(null);
        List<MenuPlato> actuales = menu == null ? List.of() : menuPlatoRepository.findByIdMenuDiaOrderByIdAsc(menu.getId());

        // Sin opciones = sin servicio ese día: se borra el menú (si no tiene pedidos).
        if (dia.opciones() == null || dia.opciones().isEmpty()) {
            if (menu != null) {
                if (pedidoDiaRepository.contarActivasDelDia(fecha) > 0) {
                    throw new ReglaNegocioException("El " + texto(fecha)
                            + " tiene pedidos activos: no se puede dejar sin menú.");
                }
                actuales.forEach(menuPlatoRepository::delete);
                if (pedidoDiaRepository.countByIdMenuDia(menu.getId()) > 0) {
                    // Hubo pedidos (ya cancelados) que apuntan a este menú: la FK no deja borrarlo,
                    // así que queda como borrador sin opciones (los empleados no lo ven).
                    menu.setPublicado(false);
                    menuDiaRepository.save(menu);
                } else {
                    menuDiaRepository.delete(menu);
                }
            }
            return;
        }
        if (diaNoLaborableRepository.existsByFecha(fecha)) {
            throw new ReglaNegocioException("El " + texto(fecha)
                    + " es un día sin servicio (calendario): quitá sus opciones o habilitá el día.");
        }

        // Resolver cada opción a un plato del catálogo (o crearlo).
        Map<Long, Integer> elegidos = new java.util.LinkedHashMap<>();
        for (OpcionNueva opcion : dia.opciones()) {
            Plato plato = resolverPlato(opcion);
            if (elegidos.put(plato.getId(), opcion.stockDisponible()) != null) {
                throw new ReglaNegocioException("El " + texto(fecha) + " tiene repetido «" + plato.getNombre() + "».");
            }
        }

        boolean hayPedidos = pedidoDiaRepository.contarActivasDelDia(fecha) > 0;
        if (menu == null) {
            menu = new MenuDia();
            menu.setFecha(fecha);
            menu.setIdUsuarioCreador(idCreador);
        } else if (!publicado && Boolean.TRUE.equals(menu.getPublicado()) && hayPedidos) {
            throw new ReglaNegocioException("El menú del " + texto(fecha)
                    + " ya tiene pedidos: no se puede volver a borrador.");
        }
        menu.setDescripcion("Menú del " + NOMBRES_DIA[fecha.getDayOfWeek().getValue() - 1]);
        menu.setPublicado(publicado);
        menu = menuDiaRepository.save(menu);

        // Sincronizar menu_plato con lo elegido.
        Map<Long, MenuPlato> porPlato = actuales.stream()
                .collect(Collectors.toMap(MenuPlato::getIdPlato, Function.identity()));
        for (MenuPlato actual : actuales) {
            long reservadas = pedidoDiaRepository.contarReservadas(menu.getId(), actual.getIdPlato(), 0L);
            Integer nuevoStock = elegidos.get(actual.getIdPlato());
            if (nuevoStock == null) {
                if (reservadas > 0) {
                    throw new ReglaNegocioException("No se puede quitar «" + nombre(actual.getIdPlato()) + "» del "
                            + texto(fecha) + ": tiene " + reservadas + " pedido(s).");
                }
                menuPlatoRepository.delete(actual);
            } else {
                if (nuevoStock < reservadas) {
                    throw new ReglaNegocioException("«" + nombre(actual.getIdPlato()) + "» del " + texto(fecha)
                            + " ya tiene " + reservadas + " porciones reservadas: no puede tener menos.");
                }
                actual.setStockDisponible(nuevoStock);
                menuPlatoRepository.save(actual);
            }
        }
        List<MenuPlato> nuevas = new ArrayList<>();
        for (Map.Entry<Long, Integer> elegido : elegidos.entrySet()) {
            if (!porPlato.containsKey(elegido.getKey())) {
                MenuPlato nueva = new MenuPlato();
                nueva.setIdMenuDia(menu.getId());
                nueva.setIdPlato(elegido.getKey());
                nueva.setStockDisponible(elegido.getValue());
                nuevas.add(nueva);
            }
        }
        menuPlatoRepository.saveAll(nuevas);
    }

    private Plato resolverPlato(OpcionNueva opcion) {
        if (opcion.idPlato() != null) {
            return platoRepository.findById(opcion.idPlato())
                    .orElseThrow(() -> new RecursoNoEncontradoException("No existe el plato " + opcion.idPlato() + "."));
        }
        String nombre = opcion.nombre() == null ? "" : opcion.nombre().trim();
        if (nombre.isEmpty()) {
            throw new ReglaNegocioException("Hay una opción sin nombre de plato.");
        }
        return platoRepository.findFirstByNombreIgnoreCase(nombre).orElseGet(() -> {
            Plato nuevo = new Plato();
            nuevo.setNombre(nombre);
            nuevo.setDescripcion(opcion.descripcion() == null || opcion.descripcion().isBlank()
                    ? null : opcion.descripcion().trim());
            nuevo.setCategoria(opcion.categoria() == null || opcion.categoria().isBlank()
                    ? "otros" : opcion.categoria().trim());
            return platoRepository.save(nuevo);
        });
    }

    private String nombre(Long idPlato) {
        return platoRepository.findById(idPlato).map(Plato::getNombre).orElse("ese plato");
    }

    private static String texto(LocalDate fecha) {
        return fecha.format(DD_MM_AAAA);
    }
}
