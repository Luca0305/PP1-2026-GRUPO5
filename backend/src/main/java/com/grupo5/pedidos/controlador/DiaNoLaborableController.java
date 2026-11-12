package com.grupo5.pedidos.controlador;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.grupo5.pedidos.entidad.DiaNoLaborable;
import com.grupo5.pedidos.repositorio.DiaNoLaborableRepository;
import com.grupo5.pedidos.servicio.DiaNoLaborableService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

/**
 * Días sin servicio.
 *   GET    /api/dias-no-laborables[?desde&hasta]          → todos (lectura, cualquiera)
 *   POST   /api/dias-no-laborables                         → crear o cambiar motivo (administrador)
 *   DELETE /api/dias-no-laborables/{id}?idUsuario=1        → habilitar servicio (administrador)
 */
@RestController
@RequestMapping("/api/dias-no-laborables")
public class DiaNoLaborableController {

    private final DiaNoLaborableRepository diaNoLaborableRepository;
    private final DiaNoLaborableService diaNoLaborableService;

    public DiaNoLaborableController(DiaNoLaborableRepository diaNoLaborableRepository,
                                    DiaNoLaborableService diaNoLaborableService) {
        this.diaNoLaborableRepository = diaNoLaborableRepository;
        this.diaNoLaborableService = diaNoLaborableService;
    }

    @GetMapping
    public List<DiaNoLaborable> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        if (desde != null && hasta != null) {
            return diaNoLaborableRepository.findByFechaBetweenOrderByFechaAsc(desde, hasta);
        }
        return diaNoLaborableRepository.findAllByOrderByFechaAsc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DiaNoLaborable guardar(@Valid @RequestBody DiaNoLaborableRequest datos) {
        return diaNoLaborableService.guardar(datos.idUsuario(), datos.fecha(), datos.motivo());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void habilitar(@PathVariable Long id, @RequestParam @Positive Long idUsuario) {
        diaNoLaborableService.habilitar(idUsuario, id);
    }
}
