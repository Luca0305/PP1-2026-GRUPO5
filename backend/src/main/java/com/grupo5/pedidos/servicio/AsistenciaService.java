package com.grupo5.pedidos.servicio;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grupo5.pedidos.entidad.Asistencia;
import com.grupo5.pedidos.entidad.DiaNoLaborable;
import com.grupo5.pedidos.repositorio.AsistenciaRepository;
import com.grupo5.pedidos.repositorio.DiaNoLaborableRepository;

/**
 * M2 · Mis días. Las reglas viven acá, no en el controller ni en la base:
 *  1. Solo un EMPLEADO activo registra asistencia.
 *  2. Se guarda por semana (lunes a viernes) y con al menos un día.
 *  3. Un día no laborable no se puede marcar.
 *  4. Después de la hora de corte (10:00 por defecto, hora Argentina) de un día, ese día ya no cambia.
 *  5. No se deja de venir un día que ya tiene un pedido activo (primero se cancela).
 * Son las mismas reglas que tenía setAttendance() en core.js del frontend.
 */
@Service
public class AsistenciaService {

    private static final DateTimeFormatter DD_MM_AAAA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final AsistenciaRepository asistenciaRepository;
    private final DiaNoLaborableRepository diaNoLaborableRepository;
    private final UsuarioService usuarioService;
    // La regla de la hora de corte vive en ReglaHorario (compartida con Mi pedido y con test JUnit).
    private final ReglaHorario reglaHorario;

    public AsistenciaService(AsistenciaRepository asistenciaRepository,
                             DiaNoLaborableRepository diaNoLaborableRepository,
                             UsuarioService usuarioService,
                             ReglaHorario reglaHorario) {
        this.asistenciaRepository = asistenciaRepository;
        this.diaNoLaborableRepository = diaNoLaborableRepository;
        this.usuarioService = usuarioService;
        this.reglaHorario = reglaHorario;
    }

    /** Las filas de asistencia de un empleado entre dos fechas (inclusive). */
    @Transactional(readOnly = true)
    public List<Asistencia> listar(Long idUsuario, LocalDate desde, LocalDate hasta) {
        if (hasta.isBefore(desde)) {
            throw new ReglaNegocioException("La fecha 'hasta' no puede ser anterior a 'desde'.");
        }
        usuarioService.buscarEmpleadoActivo(idUsuario);
        return asistenciaRepository.findByIdUsuarioAndFechaBetweenOrderByFechaAsc(idUsuario, desde, hasta);
    }

    /**
     * Guarda la semana completa: los días de {@code fechas} quedan con asiste = TRUE
     * y el resto de los días hábiles todavía abiertos, con asiste = FALSE.
     * Una fila por día (UNIQUE id_usuario, fecha): si ya existe, se actualiza.
     */
    @Transactional
    public List<Asistencia> guardarSemana(Long idUsuario, LocalDate semana, Set<LocalDate> fechas) {
        usuarioService.buscarEmpleadoActivo(idUsuario);

        if (semana.getDayOfWeek() != DayOfWeek.MONDAY) {
            throw new ReglaNegocioException("La semana se indica con la fecha de su lunes.");
        }
        LocalDate viernes = semana.plusDays(4);
        if (fechas.isEmpty()) {
            throw new ReglaNegocioException("Elegí al menos un día de asistencia.");
        }
        for (LocalDate fecha : fechas) {
            if (fecha.isBefore(semana) || fecha.isAfter(viernes)) {
                throw new ReglaNegocioException("El " + texto(fecha)
                        + " no es un día hábil de la semana del " + texto(semana) + ".");
            }
        }

        Map<LocalDate, String> noLaborables = diaNoLaborableRepository
                .findByFechaBetweenOrderByFechaAsc(semana, viernes).stream()
                .collect(Collectors.toMap(DiaNoLaborable::getFecha,
                        d -> d.getMotivo() == null ? "sin servicio" : d.getMotivo()));
        for (LocalDate fecha : fechas) {
            if (noLaborables.containsKey(fecha)) {
                throw new ReglaNegocioException("El " + texto(fecha)
                        + " no hay servicio: " + noLaborables.get(fecha) + ".");
            }
        }

        Map<LocalDate, Asistencia> actuales = asistenciaRepository
                .findByIdUsuarioAndFechaBetweenOrderByFechaAsc(idUsuario, semana, viernes).stream()
                .collect(Collectors.toMap(Asistencia::getFecha, Function.identity()));

        List<Asistencia> aGuardar = new ArrayList<>();
        for (LocalDate dia = semana; !dia.isAfter(viernes); dia = dia.plusDays(1)) {
            if (noLaborables.containsKey(dia)) {
                continue; // un día sin servicio no lleva fila
            }
            boolean quiereVenir = fechas.contains(dia);
            Asistencia actual = actuales.get(dia);
            boolean veniaAntes = actual != null && Boolean.TRUE.equals(actual.getAsiste());
            boolean cambia = quiereVenir != veniaAntes;

            if (reglaHorario.estaCerrado(dia)) {
                if (cambia) {
                    throw new ReglaNegocioException("No se puede cambiar la asistencia del "
                            + texto(dia) + ": el plazo cerró a las " + reglaHorario.horaCorteTexto() + ".");
                }
                continue; // día cerrado y sin cambios: no se toca
            }
            if (actual != null && !cambia) {
                continue; // ya estaba así
            }
            if (veniaAntes && !quiereVenir
                    && asistenciaRepository.contarPedidosActivos(idUsuario, dia) > 0) {
                throw new ReglaNegocioException("Tenés un pedido para el " + texto(dia)
                        + ". Primero cancelalo y después quitá ese día.");
            }

            if (actual == null) {
                aGuardar.add(new Asistencia(idUsuario, dia, quiereVenir));
            } else {
                actual.setAsiste(quiereVenir);
                aGuardar.add(actual);
            }
        }
        asistenciaRepository.saveAll(aGuardar);
        return asistenciaRepository.findByIdUsuarioAndFechaBetweenOrderByFechaAsc(idUsuario, semana, viernes);
    }

    private static String texto(LocalDate fecha) {
        return fecha.format(DD_MM_AAAA);
    }
}
