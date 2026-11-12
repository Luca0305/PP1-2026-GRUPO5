package com.grupo5.pedidos.servicio;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grupo5.pedidos.entidad.DiaNoLaborable;
import com.grupo5.pedidos.repositorio.DiaNoLaborableRepository;
import com.grupo5.pedidos.repositorio.MenuDiaRepository;
import com.grupo5.pedidos.repositorio.PedidoDiaRepository;

/**
 * Días sin servicio (administrador), contra la tabla dia_no_laborable.
 * La regla "en un día no laborable no hay menú ni pedidos" vive acá (la base no la conoce):
 *  - No se marca un día cuyo plazo ya cerró.
 *  - Si hay pedidos activos ese día, primero hay que cancelarlos.
 *  - Si ese día tenía menú, se despublica (las opciones se conservan por si se vuelve a habilitar).
 */
@Service
public class DiaNoLaborableService {

    private static final DateTimeFormatter DD_MM_AAAA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final DiaNoLaborableRepository diaNoLaborableRepository;
    private final MenuDiaRepository menuDiaRepository;
    private final PedidoDiaRepository pedidoDiaRepository;
    private final UsuarioService usuarioService;
    private final ReglaHorario reglaHorario;

    public DiaNoLaborableService(DiaNoLaborableRepository diaNoLaborableRepository, MenuDiaRepository menuDiaRepository,
                                 PedidoDiaRepository pedidoDiaRepository, UsuarioService usuarioService,
                                 ReglaHorario reglaHorario) {
        this.diaNoLaborableRepository = diaNoLaborableRepository;
        this.menuDiaRepository = menuDiaRepository;
        this.pedidoDiaRepository = pedidoDiaRepository;
        this.usuarioService = usuarioService;
        this.reglaHorario = reglaHorario;
    }

    /** Crea el día sin servicio, o le cambia el motivo si ya existía. */
    @Transactional
    public DiaNoLaborable guardar(Long idAdministrador, LocalDate fecha, String motivo) {
        usuarioService.buscarAdministrador(idAdministrador);
        if (reglaHorario.estaCerrado(fecha)) {
            throw new ReglaNegocioException("Elegí una fecha cuyo plazo todavía esté abierto.");
        }
        if (ReglaHorario.esFinDeSemana(fecha)) {
            throw new ReglaNegocioException("Sábados y domingos ya no tienen servicio: elegí un día de lunes a viernes.");
        }
        DiaNoLaborable dia = diaNoLaborableRepository.findByFecha(fecha).orElse(null);
        if (dia == null) {
            if (pedidoDiaRepository.contarActivasDelDia(fecha) > 0) {
                throw new ReglaNegocioException("Hay pedidos activos para el " + fecha.format(DD_MM_AAAA)
                        + ". Deben cancelarse antes de suspender el servicio.");
            }
            dia = new DiaNoLaborable();
            dia.setFecha(fecha);
            // Sin servicio = sin menú publicado ese día.
            menuDiaRepository.findByFecha(fecha).ifPresent(menu -> {
                menu.setPublicado(false);
                menuDiaRepository.save(menu);
            });
        }
        dia.setMotivo(motivo.trim());
        return diaNoLaborableRepository.save(dia);
    }

    /** "Habilitar servicio": borra el día sin servicio. El menú (si había) queda en borrador. */
    @Transactional
    public void habilitar(Long idAdministrador, Long id) {
        usuarioService.buscarAdministrador(idAdministrador);
        DiaNoLaborable dia = diaNoLaborableRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Ese día sin servicio ya no existe."));
        if (reglaHorario.estaCerrado(dia.getFecha())) {
            throw new ReglaNegocioException("Esa fecha ya cerró: queda solo de lectura.");
        }
        diaNoLaborableRepository.delete(dia);
    }
}
