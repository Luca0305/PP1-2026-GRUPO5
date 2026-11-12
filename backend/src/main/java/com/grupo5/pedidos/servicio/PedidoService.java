package com.grupo5.pedidos.servicio;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grupo5.pedidos.entidad.Asistencia;
import com.grupo5.pedidos.entidad.MenuDia;
import com.grupo5.pedidos.entidad.MenuPlato;
import com.grupo5.pedidos.entidad.Pedido;
import com.grupo5.pedidos.entidad.PedidoDia;
import com.grupo5.pedidos.entidad.Plato;
import com.grupo5.pedidos.repositorio.AsistenciaRepository;
import com.grupo5.pedidos.repositorio.DiaNoLaborableRepository;
import com.grupo5.pedidos.repositorio.MenuDiaRepository;
import com.grupo5.pedidos.repositorio.MenuPlatoRepository;
import com.grupo5.pedidos.repositorio.PedidoDiaRepository;
import com.grupo5.pedidos.repositorio.PedidoRepository;
import com.grupo5.pedidos.repositorio.PlatoRepository;

/**
 * M4 · Mi pedido. Cómo se usa el modelo:
 *   pedido     = la cabecera de la SEMANA del empleado (nace en BORRADOR).
 *   pedido_dia = una línea por día: qué plato eligió y su comentario.
 *
 * Reglas al guardar un día (todas acá, en el servicio; la base no las conoce):
 *  1. Solo un empleado activo.
 *  2. El menú de ese día existe y está PUBLICADO, y el plato es una de sus opciones.
 *  3. Ese día no es no laborable.
 *  4. El empleado registró que viene ese día (asistencia, M2).
 *  5. No pasó la hora de corte de ese día (ReglaHorario, configurable).
 *  6. Queda stock: porciones ofrecidas − porciones ya reservadas > 0.
 *  7. Una sola opción por día: si ya hay una línea en BORRADOR, se reemplaza.
 *     Si ese día ya estaba CONFIRMADO, se saca de ese pedido y vuelve a BORRADOR con la
 *     opción nueva (hay que confirmarlo otra vez); los demás días siguen confirmados.
 */
@Service
public class PedidoService {

    private static final DateTimeFormatter DD_MM_AAAA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    // No hay línea a excluir: ningún id real es 0.
    private static final Long NINGUNA = 0L;

    private final PedidoRepository pedidoRepository;
    private final PedidoDiaRepository pedidoDiaRepository;
    private final MenuDiaRepository menuDiaRepository;
    private final MenuPlatoRepository menuPlatoRepository;
    private final PlatoRepository platoRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final DiaNoLaborableRepository diaNoLaborableRepository;
    private final UsuarioService usuarioService;
    private final ReglaHorario reglaHorario;

    public PedidoService(PedidoRepository pedidoRepository, PedidoDiaRepository pedidoDiaRepository,
                         MenuDiaRepository menuDiaRepository, MenuPlatoRepository menuPlatoRepository,
                         PlatoRepository platoRepository, AsistenciaRepository asistenciaRepository,
                         DiaNoLaborableRepository diaNoLaborableRepository,
                         UsuarioService usuarioService, ReglaHorario reglaHorario) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoDiaRepository = pedidoDiaRepository;
        this.menuDiaRepository = menuDiaRepository;
        this.menuPlatoRepository = menuPlatoRepository;
        this.platoRepository = platoRepository;
        this.asistenciaRepository = asistenciaRepository;
        this.diaNoLaborableRepository = diaNoLaborableRepository;
        this.usuarioService = usuarioService;
        this.reglaHorario = reglaHorario;
    }

    /** Cruce 3 · Mis pedidos: cada pedido del empleado, con sus días adentro. */
    @Transactional(readOnly = true)
    public List<PedidoRespuesta> listar(Long idUsuario) {
        usuarioService.buscarEmpleadoActivo(idUsuario);
        List<Pedido> pedidos = pedidoRepository.findByIdUsuarioOrderByIdDesc(idUsuario);
        if (pedidos.isEmpty()) {
            return List.of();
        }
        List<PedidoDia> lineas = pedidoDiaRepository
                .findByIdPedidoInOrderByFechaEntregaAsc(pedidos.stream().map(Pedido::getId).toList());
        Map<Long, String> nombres = nombresDePlatos(lineas);
        return pedidos.stream()
                .map(p -> respuesta(p, lineas.stream().filter(l -> l.getIdPedido().equals(p.getId())).toList(), nombres))
                // Los más nuevos primero, según el primer día que cubren.
                .sorted(Comparator.comparing((PedidoRespuesta r) -> r.dias().isEmpty()
                        ? LocalDate.MIN : r.dias().get(0).fechaEntrega()).reversed())
                .toList();
    }

    /** Guarda (o reemplaza) la elección de UN día. El pedido queda en BORRADOR. */
    @Transactional
    public PedidoRespuesta guardarDia(Long idUsuario, Long idMenuDia, Long idPlato, String comentario) {
        usuarioService.buscarEmpleadoActivo(idUsuario);

        MenuDia menu = menuDiaRepository.findById(idMenuDia)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el menú " + idMenuDia + "."));
        LocalDate fecha = menu.getFecha();
        if (!Boolean.TRUE.equals(menu.getPublicado())) {
            throw new ReglaNegocioException("El menú del " + texto(fecha) + " todavía no está publicado.");
        }
        MenuPlato opcion = menuPlatoRepository.findByIdMenuDiaAndIdPlato(idMenuDia, idPlato)
                .orElseThrow(() -> new ReglaNegocioException(
                        "Ese plato no es una opción del menú del " + texto(fecha) + "."));
        if (diaNoLaborableRepository.existsByFecha(fecha)) {
            throw new ReglaNegocioException("El " + texto(fecha) + " no hay servicio.");
        }
        boolean viene = asistenciaRepository.findByIdUsuarioAndFecha(idUsuario, fecha)
                .map(a -> Boolean.TRUE.equals(a.getAsiste()))
                .orElse(false);
        if (!viene) {
            throw new ReglaNegocioException("Primero registrá tu asistencia para el " + texto(fecha) + ".");
        }
        if (reglaHorario.estaCerrado(fecha)) {
            throw new ReglaNegocioException("El plazo para el " + texto(fecha) + " cerró a las " + reglaHorario.horaCorteTexto() + ".");
        }

        PedidoDia existente = pedidoDiaRepository.buscarActivas(idUsuario, fecha).stream().findFirst().orElse(null);
        Long excluir = existente == null ? NINGUNA : existente.getId();
        long reservadas = pedidoDiaRepository.contarReservadas(idMenuDia, idPlato, excluir);
        if (reservadas >= opcion.getStockDisponible()) {
            throw new ReglaNegocioException("Esa opción no tiene más porciones. Elegí otra.");
        }

        String texto = comentario == null || comentario.isBlank() ? null : comentario.trim();
        Pedido pedido;
        Pedido suyo = existente == null ? null : pedidoRepository.findById(existente.getIdPedido()).orElseThrow();
        if (existente != null && Pedido.BORRADOR.equals(suyo.getEstado())) {
            // Ya estaba en borrador: se reemplaza la elección de ese día.
            existente.setIdPlato(idPlato);
            existente.setComentario(texto);
            pedidoDiaRepository.save(existente);
            pedido = suyo;
        } else {
            if (existente != null) {
                // Estaba CONFIRMADO: ese día sale del pedido confirmado y vuelve a borrador.
                sacarLinea(existente, suyo);
            }
            pedido = borradorDeLaSemana(idUsuario, fecha);
            pedidoDiaRepository.save(new PedidoDia(pedido.getId(), idMenuDia, idPlato, fecha, texto));
        }
        return respuesta(pedido);
    }

    /** BORRADOR → CONFIRMADO. Recién ahí entra en el consolidado. */
    @Transactional
    public PedidoRespuesta confirmar(Long idPedido, Long idUsuario) {
        Pedido pedido = pedidoDelEmpleado(idPedido, idUsuario);
        if (!Pedido.BORRADOR.equals(pedido.getEstado())) {
            throw new ReglaNegocioException("Solo se confirma un pedido en BORRADOR (este está "
                    + pedido.getEstado() + ").");
        }
        List<PedidoDia> lineas = pedidoDiaRepository.findByIdPedidoOrderByFechaEntregaAsc(idPedido);
        if (lineas.isEmpty()) {
            throw new ReglaNegocioException("El pedido no tiene días elegidos.");
        }
        for (PedidoDia linea : lineas) {
            if (reglaHorario.estaCerrado(linea.getFechaEntrega())) {
                throw new ReglaNegocioException("El plazo del " + texto(linea.getFechaEntrega())
                        + " ya cerró. Quitá ese día del pedido y volvé a confirmar.");
            }
            MenuPlato opcion = menuPlatoRepository.findByIdMenuDiaAndIdPlato(linea.getIdMenuDia(), linea.getIdPlato())
                    .orElseThrow(() -> new ReglaNegocioException("Una opción del pedido ya no está en el menú."));
            long otras = pedidoDiaRepository.contarReservadas(linea.getIdMenuDia(), linea.getIdPlato(), linea.getId());
            if (otras >= opcion.getStockDisponible()) {
                throw new ReglaNegocioException("Se agotó una opción del " + texto(linea.getFechaEntrega())
                        + ". Elegí otra para ese día.");
            }
        }
        pedido.setEstado(Pedido.CONFIRMADO);
        return respuesta(pedidoRepository.save(pedido));
    }

    /** Cancela el pedido entero; sus porciones vuelven a estar disponibles. */
    @Transactional
    public PedidoRespuesta cancelar(Long idPedido, Long idUsuario) {
        Pedido pedido = pedidoDelEmpleado(idPedido, idUsuario);
        if (Pedido.CANCELADO.equals(pedido.getEstado())) {
            throw new ReglaNegocioException("El pedido ya estaba cancelado.");
        }
        for (PedidoDia linea : pedidoDiaRepository.findByIdPedidoOrderByFechaEntregaAsc(idPedido)) {
            if (reglaHorario.estaCerrado(linea.getFechaEntrega())) {
                throw new ReglaNegocioException("No se puede cancelar: el plazo del "
                        + texto(linea.getFechaEntrega()) + " ya cerró.");
            }
        }
        pedido.setEstado(Pedido.CANCELADO);
        return respuesta(pedidoRepository.save(pedido));
    }

    /**
     * Quita (o cancela) un día del pedido, en BORRADOR o CONFIRMADO, mientras su plazo esté abierto.
     * Si el pedido se queda sin días: un borrador se borra; uno confirmado pasa a CANCELADO.
     */
    @Transactional
    public void quitarDia(Long idPedido, Long idPedidoDia, Long idUsuario) {
        Pedido pedido = pedidoDelEmpleado(idPedido, idUsuario);
        if (Pedido.CANCELADO.equals(pedido.getEstado())) {
            throw new ReglaNegocioException("El pedido ya está cancelado.");
        }
        PedidoDia linea = pedidoDiaRepository.findById(idPedidoDia)
                .filter(l -> l.getIdPedido().equals(idPedido))
                .orElseThrow(() -> new RecursoNoEncontradoException("Ese día no está en el pedido " + idPedido + "."));
        if (reglaHorario.estaCerrado(linea.getFechaEntrega())) {
            throw new ReglaNegocioException("El plazo del " + texto(linea.getFechaEntrega()) + " ya cerró.");
        }
        sacarLinea(linea, pedido);
    }

    /**
     * Mejora · Pedido fuera de horario. El ADMINISTRADOR le carga el pedido de un día a un
     * empleado que no llegó a pedir antes de la hora de corte.
     *  - Saltea SOLO la hora de corte: el menú tiene que estar publicado, el plato tiene que
     *    ser una opción de ese menú, el día no puede ser no laborable y tiene que haber stock.
     *  - No se carga para días que ya pasaron (hoy sí, aunque sea después del corte).
     *  - Registra la asistencia del empleado ese día (asiste = TRUE).
     *  - Crea un pedido nuevo ya CONFIRMADO, así entra directo en el consolidado.
     *  - Si el empleado tenía ese día en un BORRADOR, esa línea se reemplaza por esta;
     *    si ya lo tenía CONFIRMADO, no se duplica (409).
     * No hace falta ninguna tabla nueva: usa pedido, pedido_dia y asistencia del script.
     */
    @Transactional
    public PedidoRespuesta cargarFueraDeHorario(Long idAdministrador, Long idEmpleado, Long idMenuDia,
                                                Long idPlato, String comentario) {
        usuarioService.buscarAdministrador(idAdministrador);
        usuarioService.buscarEmpleadoActivo(idEmpleado);

        MenuDia menu = menuDiaRepository.findById(idMenuDia)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el menú " + idMenuDia + "."));
        LocalDate fecha = menu.getFecha();
        if (fecha.isBefore(reglaHorario.hoy())) {
            throw new ReglaNegocioException("El " + texto(fecha) + " ya pasó: no se pueden cargar pedidos para días anteriores.");
        }
        if (!Boolean.TRUE.equals(menu.getPublicado())) {
            throw new ReglaNegocioException("El menú del " + texto(fecha) + " todavía no está publicado.");
        }
        MenuPlato opcion = menuPlatoRepository.findByIdMenuDiaAndIdPlato(idMenuDia, idPlato)
                .orElseThrow(() -> new ReglaNegocioException(
                        "Ese plato no es una opción del menú del " + texto(fecha) + "."));
        if (diaNoLaborableRepository.existsByFecha(fecha)) {
            throw new ReglaNegocioException("El " + texto(fecha) + " no hay servicio.");
        }

        PedidoDia existente = pedidoDiaRepository.buscarActivas(idEmpleado, fecha).stream().findFirst().orElse(null);
        if (existente != null) {
            Pedido suyo = pedidoRepository.findById(existente.getIdPedido()).orElseThrow();
            if (!Pedido.BORRADOR.equals(suyo.getEstado())) {
                throw new ReglaNegocioException("Ese empleado ya tiene un pedido confirmado para el "
                        + texto(fecha) + ".");
            }
        }
        Long excluir = existente == null ? NINGUNA : existente.getId();
        if (pedidoDiaRepository.contarReservadas(idMenuDia, idPlato, excluir) >= opcion.getStockDisponible()) {
            throw new ReglaNegocioException("Esa opción no tiene más porciones. Elegí otra.");
        }

        // El borrador de ese día (si había) se reemplaza por el pedido que carga el administrador.
        if (existente != null) {
            Long idBorrador = existente.getIdPedido();
            pedidoDiaRepository.delete(existente);
            if (pedidoDiaRepository.countByIdPedido(idBorrador) == 0) {
                pedidoRepository.deleteById(idBorrador);
            }
        }
        // Asistencia: si no estaba registrada (o decía que no venía), ahora viene.
        Asistencia asistencia = asistenciaRepository.findByIdUsuarioAndFecha(idEmpleado, fecha)
                .orElseGet(() -> new Asistencia(idEmpleado, fecha, true));
        asistencia.setAsiste(true);
        asistenciaRepository.save(asistencia);

        Pedido pedido = pedidoRepository.save(new Pedido(idEmpleado, reglaHorario.hoy(), Pedido.CONFIRMADO));
        String texto = comentario == null || comentario.isBlank() ? null : comentario.trim();
        pedidoDiaRepository.save(new PedidoDia(pedido.getId(), idMenuDia, idPlato, fecha, texto));
        return respuesta(pedido);
    }

    // ---------------------------------------------------------------- privados

    /** Saca una línea de su pedido. Si el pedido queda vacío: borrador → se borra; confirmado → CANCELADO. */
    private void sacarLinea(PedidoDia linea, Pedido pedido) {
        pedidoDiaRepository.delete(linea);
        if (pedidoDiaRepository.countByIdPedido(pedido.getId()) == 0) {
            if (Pedido.BORRADOR.equals(pedido.getEstado())) {
                pedidoRepository.delete(pedido);
            } else {
                pedido.setEstado(Pedido.CANCELADO);
                pedidoRepository.save(pedido);
            }
        }
    }

    /** El BORRADOR del empleado que ya tiene días de esa semana; si no hay, uno nuevo. */
    private Pedido borradorDeLaSemana(Long idUsuario, LocalDate fecha) {
        LocalDate lunes = ReglaHorario.lunesDe(fecha);
        LocalDate viernes = lunes.plusDays(4);
        for (Pedido borrador : pedidoRepository.findByIdUsuarioAndEstado(idUsuario, Pedido.BORRADOR)) {
            boolean esDeEsaSemana = pedidoDiaRepository.findByIdPedidoOrderByFechaEntregaAsc(borrador.getId()).stream()
                    .anyMatch(l -> !l.getFechaEntrega().isBefore(lunes) && !l.getFechaEntrega().isAfter(viernes));
            if (esDeEsaSemana) {
                return borrador;
            }
        }
        return pedidoRepository.save(new Pedido(idUsuario, reglaHorario.hoy(), Pedido.BORRADOR));
    }

    private Pedido pedidoDelEmpleado(Long idPedido, Long idUsuario) {
        usuarioService.buscarEmpleadoActivo(idUsuario);
        return pedidoRepository.findById(idPedido)
                .filter(p -> p.getIdUsuario().equals(idUsuario))
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el pedido " + idPedido + " de este usuario."));
    }

    private PedidoRespuesta respuesta(Pedido pedido) {
        List<PedidoDia> lineas = pedidoDiaRepository.findByIdPedidoOrderByFechaEntregaAsc(pedido.getId());
        return respuesta(pedido, lineas, nombresDePlatos(lineas));
    }

    private static PedidoRespuesta respuesta(Pedido pedido, List<PedidoDia> lineas, Map<Long, String> nombres) {
        return new PedidoRespuesta(pedido.getId(), pedido.getIdUsuario(), pedido.getFechaPedido(), pedido.getEstado(),
                lineas.stream().map(l -> new PedidoDiaRespuesta(l.getId(), l.getIdPedido(), l.getIdMenuDia(),
                        l.getIdPlato(), nombres.get(l.getIdPlato()), l.getFechaEntrega(), l.getComentario())).toList());
    }

    private Map<Long, String> nombresDePlatos(List<PedidoDia> lineas) {
        return platoRepository.findAllById(lineas.stream().map(PedidoDia::getIdPlato).distinct().toList()).stream()
                .collect(Collectors.toMap(Plato::getId, Plato::getNombre, (a, b) -> a));
    }

    private static String texto(LocalDate fecha) {
        return fecha.format(DD_MM_AAAA);
    }
}
