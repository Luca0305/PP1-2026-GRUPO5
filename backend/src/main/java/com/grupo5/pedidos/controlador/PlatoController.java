package com.grupo5.pedidos.controlador;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grupo5.pedidos.entidad.Plato;
import com.grupo5.pedidos.repositorio.PlatoRepository;

/** Atiende /api/platos: recibe el pedido HTTP y devuelve JSON. */
@RestController
@RequestMapping("/api/platos")
public class PlatoController {

    private final PlatoRepository platoRepository;

    // Inyección por constructor: Spring crea el repositorio y lo pasa acá.
    public PlatoController(PlatoRepository platoRepository) {
        this.platoRepository = platoRepository;
    }

    @GetMapping
    public List<Plato> listar() {
        return platoRepository.findAll();
    }

    // 200 con el plato si existe, 404 si no.
    @GetMapping("/{id}")
    public ResponseEntity<Plato> buscar(@PathVariable Long id) {
        return platoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
